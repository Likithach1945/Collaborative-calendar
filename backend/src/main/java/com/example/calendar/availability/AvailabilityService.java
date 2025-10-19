package com.example.calendar.availability;

import com.example.calendar.auth.User;
import com.example.calendar.auth.UserRepository;
import com.example.calendar.events.Event;
import com.example.calendar.events.EventRepository;
import com.example.calendar.invitations.Invitation;
import com.example.calendar.invitations.InvitationRepository;
import com.example.calendar.invitations.InvitationStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.DateTimeException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for computing availability and suggesting meeting times
 */
@Service
public class AvailabilityService {
    
    private static final int MAX_SUGGESTIONS = 5;
    private static final int PER_ATTENDEE_SUGGESTIONS = 3;
    private static final int PER_ATTENDEE_LOOKAHEAD_DAYS = 3;
    private static final LocalTime BUSINESS_START = LocalTime.of(9, 0);  // 9 AM
    private static final LocalTime BUSINESS_END = LocalTime.of(17, 0);   // 5 PM
    private static final Logger logger = LoggerFactory.getLogger(AvailabilityService.class);
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private InvitationRepository invitationRepository;
    
    
    /**
     * Check availability of multiple participants for a proposed meeting time
     *
     * @param startDateTime Start time of proposed meeting (UTC)
     * @param endDateTime End time of proposed meeting (UTC)
     * @param participantEmails List of participant email addresses to check
     * @return List of AvailabilityDTO showing availability status and conflicts
     */
    public List<AvailabilityDTO> checkParticipantsAvailability(
            Instant startDateTime,
            Instant endDateTime,
            List<String> participantEmails) {

        if (participantEmails == null || participantEmails.isEmpty()) {
            return new ArrayList<>();
        }

        logger.info("🔍 Checking availability for {} participants: {}", participantEmails.size(), participantEmails);
        logger.info("  Proposed time window: {} to {}", startDateTime, endDateTime);

        List<AvailabilityDTO> results = new ArrayList<>();

        for (String email : participantEmails) {
            AvailabilityDTO availability = checkParticipantAvailability(email, startDateTime, endDateTime);
            results.add(availability);
        }

        logger.info("✅ Availability check complete: {} available, {} unavailable", 
            results.stream().filter(AvailabilityDTO::isAvailable).count(),
            results.stream().filter(a -> !a.isAvailable()).count());

        return results;
    }

    /**
     * Check availability of a single participant
     *
     * @param email Participant email address
     * @param startDateTime Start time of proposed meeting (UTC)
     * @param endDateTime End time of proposed meeting (UTC)
     * @return AvailabilityDTO with availability status and any conflicts
     */
    private AvailabilityDTO checkParticipantAvailability(
            String email,
            Instant startDateTime,
            Instant endDateTime) {

        try {
            logger.info("🔍 Checking availability for: {}", email);
            
            // Find the user by email
            Optional<User> userOptional = userRepository.findByEmail(email);

            if (userOptional.isEmpty()) {
                // User doesn't exist in system - cannot verify availability
                logger.warn("⚠️  User with email {} not found in system", email);
                AvailabilityDTO missingUser = new AvailabilityDTO(email, email, false, new ArrayList<>(), new ArrayList<>());
                missingUser.setUserFound(false);
                return missingUser;
            }

            User user = userOptional.get();
            logger.info("   Found user: {}", user.getDisplayName());

            // Get all busy time slots for this user (both organized events and accepted invitations)
            List<Event> allBusyEvents = getAllBusyEventsForUser(user, startDateTime, endDateTime);
            logger.info("   📋 Found {} total busy events for analysis in window: {} to {}", allBusyEvents.size(), startDateTime, endDateTime);

            if (allBusyEvents.size() > 0) {
                logger.info("   🔍 Analyzing each event for conflicts with proposed time:");
            }

            // Filter events that actually conflict with the proposed meeting
            List<Event> conflictingEvents = allBusyEvents.stream()
                    .filter(event -> {
                        boolean hasConflict = hasTimeConflict(event, startDateTime, endDateTime);
                        if (hasConflict) {
                            logger.info("     ❌ CONFLICT DETECTED: '{}' ({} to {}) overlaps with proposed ({} to {})", 
                                event.getTitle(), event.getStartDateTime(), event.getEndDateTime(), startDateTime, endDateTime);
                        } else {
                            logger.info("     ✅ NO CONFLICT: '{}' ({} to {}) does not overlap with proposed ({} to {})", 
                                event.getTitle(), event.getStartDateTime(), event.getEndDateTime(), startDateTime, endDateTime);
                        }
                        return hasConflict;
                    })
                    .toList();

            List<AvailabilityDTO.ConflictDTO> conflicts = convertToConflictDTOs(conflictingEvents);
            boolean isAvailable = conflictingEvents.isEmpty();
            List<AvailabilitySlotDTO> suggestedSlots = Collections.emptyList();

            if (isAvailable) {
                logger.info("   🎉 RESULT: {} is AVAILABLE (no conflicts found)", email);
            } else {
                logger.error("   🚨 RESULT: {} is UNAVAILABLE ({} conflicts found)", email, conflicts.size());
                for (AvailabilityDTO.ConflictDTO conflict : conflicts) {
                    logger.error("     ⚠️  Blocking conflict: '{}' ({} to {})", conflict.getTitle(), conflict.getStartDateTime(), conflict.getEndDateTime());
                }
                Duration meetingDuration = Duration.between(startDateTime, endDateTime);
                if (!meetingDuration.isNegative() && !meetingDuration.isZero()) {
                    suggestedSlots = findAlternativeSlotsForUser(
                        user,
                        startDateTime,
                        endDateTime,
                        meetingDuration,
                        PER_ATTENDEE_SUGGESTIONS
                    );
                }
            }

            AvailabilityDTO result = new AvailabilityDTO(email, user.getDisplayName(), isAvailable, conflicts, suggestedSlots);
            result.setUserFound(true);
            return result;

        } catch (Exception e) {
            logger.error("Error checking availability for {}: {}", email, e.getMessage(), e);
            // On error, cannot verify availability - mark as unavailable to be safe
            AvailabilityDTO fallback = new AvailabilityDTO(email, email, false, new ArrayList<>(), new ArrayList<>());
            fallback.setUserFound(true);
            return fallback;
        }
    }

    /**
     * Get all events where the user is busy (both organized events and accepted invitations)
     *
     * @param user The user to check
     * @param startDateTime Start of time window (UTC)
     * @param endDateTime End of time window (UTC)
     * @return List of all events where the user is busy
     */
    private List<Event> getAllBusyEventsForUser(User user, Instant startDateTime, Instant endDateTime) {
        try {
            List<Event> allBusyEvents = new ArrayList<>();

            logger.info("     🔍 Getting ALL busy events for user: {} ({}) in window: {} to {}", 
                user.getDisplayName(), user.getEmail(), startDateTime, endDateTime);

            // 1. Get events organized by this user
            List<Event> organizedEvents = eventRepository.findByOrganizerAndDateRange(user.getId(), startDateTime, endDateTime);
            logger.info("     📅 Found {} organized events in time window", organizedEvents.size());
            for (Event event : organizedEvents) {
                logger.info("       - Organized: '{}' ({} to {})", event.getTitle(), event.getStartDateTime(), event.getEndDateTime());
            }
            allBusyEvents.addAll(organizedEvents);

            // 2. Get events where this user has accepted invitations
            List<Invitation> acceptedInvitations = invitationRepository.findByRecipientEmailAndStatus(
                user.getEmail(), InvitationStatus.ACCEPTED);
            
            logger.info("     📨 Found {} accepted invitations total (checking all)", acceptedInvitations.size());
            
            if (acceptedInvitations.size() > 0) {
                logger.info("     📝 Listing ALL accepted invitations:");
                for (Invitation invitation : acceptedInvitations) {
                    Event event = invitation.getEvent();
                    logger.info("       - Invitation to: '{}' ({} to {})", 
                        event.getTitle(), event.getStartDateTime(), event.getEndDateTime());
                }
            }

            // Filter accepted invitations to only include those in our time window
            List<Event> acceptedEvents = acceptedInvitations.stream()
                .map(Invitation::getEvent)
                .filter(event -> {
                    // Only include events that overlap with our time window
                    boolean overlaps = event.getStartDateTime().isBefore(endDateTime) && 
                                     event.getEndDateTime().isAfter(startDateTime);
                    if (overlaps) {
                        logger.info("     ⚠️  CONFLICTING accepted event: '{}' ({} to {})", 
                            event.getTitle(), event.getStartDateTime(), event.getEndDateTime());
                    } else {
                        logger.info("     ✅ Non-conflicting accepted event: '{}' ({} to {})", 
                            event.getTitle(), event.getStartDateTime(), event.getEndDateTime());
                    }
                    return overlaps;
                })
                .toList();

            logger.info("     📊 SUMMARY: {} organized + {} accepted in window = {} total busy events", 
                organizedEvents.size(), acceptedEvents.size(), organizedEvents.size() + acceptedEvents.size());
            
            allBusyEvents.addAll(acceptedEvents);

            return allBusyEvents;
            
        } catch (Exception e) {
            logger.error("     ❌ ERROR in getAllBusyEventsForUser for {}: {}", user.getEmail(), e.getMessage(), e);
            return new ArrayList<>(); // Return empty list on error instead of causing failure
        }
    }

    /**
     * Check if an event has a time conflict with the proposed meeting
     *
     * @param event Event to check
     * @param proposedStart Start time of proposed meeting
     * @param proposedEnd End time of proposed meeting
     * @return true if there's a conflict, false otherwise
     */
    private boolean hasTimeConflict(Event event, Instant proposedStart, Instant proposedEnd) {
        // No conflict if event ends before or at proposed start
        if (event.getEndDateTime().compareTo(proposedStart) <= 0) {
            logger.debug("  No conflict: Event {} ends at {} (before proposed start {})", 
                event.getTitle(), event.getEndDateTime(), proposedStart);
            return false;
        }

        // No conflict if event starts at or after proposed end
        if (event.getStartDateTime().compareTo(proposedEnd) >= 0) {
            logger.debug("  No conflict: Event {} starts at {} (after proposed end {})", 
                event.getTitle(), event.getStartDateTime(), proposedEnd);
            return false;
        }

        // Otherwise there's an overlap
        logger.debug("  ⚠️ CONFLICT: Event '{}' ({} - {}) overlaps with proposed ({} - {})", 
            event.getTitle(), 
            event.getStartDateTime(), 
            event.getEndDateTime(), 
            proposedStart, 
            proposedEnd);
        return true;
    }

    /**
     * Convert Event objects to ConflictDTO objects
     *
     * @param events List of Event objects
     * @return List of ConflictDTO objects
     */
    private List<AvailabilityDTO.ConflictDTO> convertToConflictDTOs(List<Event> events) {
        return events.stream()
                .map(event -> new AvailabilityDTO.ConflictDTO(
                        event.getTitle(),
                        event.getStartDateTime(),
                        event.getEndDateTime(),
                        event.getLocation()
                ))
                .toList();
    }
    
    /**
     * Find available time slots for a meeting
     *
     * @param request Request containing participants, date range, and duration
     * @param requestingUser The authenticated user making the request
     * @return List of suggested time slots, sorted by score (best first)
     */
    public List<AvailabilitySlotDTO> findAvailableSlots(AvailabilityRequestDTO request, User requestingUser) {
        // Validate input
        validateRequest(request);
        
        // Use UTC as default timezone if no user is authenticated (for debugging)
        String timezone = (requestingUser != null) ? requestingUser.getTimezone() : "UTC";
        
        // Get all participants' busy times
        Map<String, List<Event>> participantEvents = getParticipantEvents(
            request.getParticipantEmails(),
            request.getStartRange(),
            request.getEndRange()
        );
        
        // Generate candidate time slots
        Duration meetingDuration = Duration.ofMinutes(request.getDurationMinutes());
        List<AvailabilitySlotDTO> candidates = generateCandidateSlots(
            request.getStartRange(),
            request.getEndRange(),
            meetingDuration,
            timezone  // Use the timezone variable instead of requestingUser.getTimezone()
        );
        
        // Filter out slots that conflict with any participant's events
        List<AvailabilitySlotDTO> availableSlots = filterAvailableSlots(
            candidates,
            participantEvents
        );
        
        // Score and sort slots (earlier is better)
        scoreSlots(availableSlots, request.getStartRange());
        
        // Return top N suggestions
        return availableSlots.stream()
            .limit(MAX_SUGGESTIONS)
            .collect(Collectors.toList());
    }
    
    /**
     * Validate the availability request
     */
    private void validateRequest(AvailabilityRequestDTO request) {
        if (request.getParticipantEmails() == null || request.getParticipantEmails().isEmpty()) {
            throw new IllegalArgumentException("At least one participant is required");
        }
        
        if (request.getStartRange() == null || request.getEndRange() == null) {
            throw new IllegalArgumentException("Date range is required");
        }
        
        if (request.getEndRange().isBefore(request.getStartRange())) {
            throw new IllegalArgumentException("End range must be after start range");
        }
        
        if (request.getDurationMinutes() == null || request.getDurationMinutes() <= 0) {
            throw new IllegalArgumentException("Duration must be positive");
        }
        
        if (request.getDurationMinutes() > 480) { // Max 8 hours
            throw new IllegalArgumentException("Duration cannot exceed 8 hours");
        }
    }
    
    /**
     * Get all events for participants in the date range
     */
    private Map<String, List<Event>> getParticipantEvents(
            List<String> participantEmails, 
            Instant start, 
            Instant end) {
        
        Map<String, List<Event>> eventsByParticipant = new HashMap<>();
        
        for (String email : participantEmails) {
            // Find user by email
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                // Use the same comprehensive logic to get all busy events
                List<Event> events = getAllBusyEventsForUser(user, start, end);
                eventsByParticipant.put(email, events);
            } else {
                // If user doesn't exist, assume they have no events
                eventsByParticipant.put(email, Collections.emptyList());
            }
        }
        
        return eventsByParticipant;
    }
    
    /**
     * Generate candidate time slots during business hours
     */
    @Cacheable(value = "candidateSlots", key = "#start + '-' + #end + '-' + #duration.toMinutes() + '-' + #timezone")
    private List<AvailabilitySlotDTO> generateCandidateSlots(
            Instant start, 
            Instant end, 
            Duration duration,
            String timezone) {
        
        List<AvailabilitySlotDTO> candidates = new ArrayList<>();
        ZoneId zoneId = ZoneId.of(timezone);
        
        // Start from the beginning of the range
        Instant current = start;
        
        // Generate slots in 30-minute increments during business hours
        while (current.plus(duration).isBefore(end) || current.plus(duration).equals(end)) {
            ZonedDateTime zonedCurrent = current.atZone(zoneId);
            LocalTime timeOfDay = zonedCurrent.toLocalTime();
            
            // Only suggest slots during business hours (9 AM - 5 PM)
            if (!timeOfDay.isBefore(BUSINESS_START) && 
                timeOfDay.plus(duration).isBefore(BUSINESS_END.plusMinutes(1))) {
                
                candidates.add(new AvailabilitySlotDTO(
                    current,
                    current.plus(duration),
                    0.0 // Score will be calculated later
                ));
            }
            
            // Move to next 30-minute increment
            current = current.plus(Duration.ofMinutes(30));
        }
        
        return candidates;
    }
    
    /**
     * Filter out slots that conflict with any participant's events
     */
    private List<AvailabilitySlotDTO> filterAvailableSlots(
            List<AvailabilitySlotDTO> candidates,
            Map<String, List<Event>> participantEvents) {
        
        return candidates.stream()
            .filter(slot -> isSlotAvailable(slot, participantEvents))
            .collect(Collectors.toList());
    }
    
    /**
     * Check if a slot is available for all participants
     */
    private boolean isSlotAvailable(
            AvailabilitySlotDTO slot,
            Map<String, List<Event>> participantEvents) {
        
        // Check each participant's events
        for (List<Event> events : participantEvents.values()) {
            for (Event event : events) {
                // Check if slot overlaps with this event
                if (slotsOverlap(slot.getStartTime(), slot.getEndTime(),
                                event.getStartDateTime(), event.getEndDateTime())) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Check if two time ranges overlap
     */
    private boolean slotsOverlap(Instant start1, Instant end1, Instant start2, Instant end2) {
        return start1.isBefore(end2) && end1.isAfter(start2);
    }
    
    /**
     * Score slots based on various factors (earlier times are better)
     */
    private void scoreSlots(List<AvailabilitySlotDTO> slots, Instant rangeStart) {
        for (AvailabilitySlotDTO slot : slots) {
            double score = calculateScore(slot, rangeStart);
            slot.setScore(score);
        }
        
        // Sort by score descending (best first)
        slots.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
    }
    
    /**
     * Calculate score for a slot
     * Higher score = better slot
     * Prioritizes earlier times
     */
    private double calculateScore(AvailabilitySlotDTO slot, Instant rangeStart) {
        // Base score: 100
        double score = 100.0;
        
        // Penalty for being later in the range
        // Earlier slots get higher scores
        long minutesFromStart = Duration.between(rangeStart, slot.getStartTime()).toMinutes();
        double timePenalty = minutesFromStart * 0.01; // 0.01 points per minute
        score -= timePenalty;
        
        // Bonus for slots at preferred times (10 AM, 2 PM)
        ZonedDateTime zonedStart = slot.getStartTime().atZone(ZoneId.of("UTC"));
        int hour = zonedStart.getHour();
        if (hour == 10 || hour == 14) {
            score += 10.0;
        }
        
        return Math.max(0, score); // Ensure non-negative
    }

    /**
     * Find alternative free slots for a single participant when conflicts occur.
     */
    private List<AvailabilitySlotDTO> findAlternativeSlotsForUser(
            User user,
            Instant proposedStart,
            Instant proposedEnd,
            Duration meetingDuration,
            int maxSuggestions) {

        if (user == null || meetingDuration == null || meetingDuration.isNegative() || meetingDuration.isZero()) {
            return Collections.emptyList();
        }

        String timezone = resolveTimezone(user);
        Instant searchStart = proposedStart;
        Instant searchEnd = proposedStart.plus(Duration.ofDays(PER_ATTENDEE_LOOKAHEAD_DAYS));

        // Ensure we search far enough to accommodate the meeting duration after the conflict window
        Instant minimumEnd = proposedEnd.plus(meetingDuration);
        if (searchEnd.isBefore(minimumEnd)) {
            searchEnd = minimumEnd;
        }

        List<Event> busyEvents = getAllBusyEventsForUser(user, searchStart, searchEnd);
        Map<String, List<Event>> participantEvents = Map.of(user.getEmail(), busyEvents);

        List<AvailabilitySlotDTO> candidates = generateCandidateSlots(searchStart, searchEnd, meetingDuration, timezone);
        if (candidates.isEmpty()) {
            return Collections.emptyList();
        }

        List<AvailabilitySlotDTO> available = filterAvailableSlots(candidates, participantEvents).stream()
            .filter(slot -> !slot.getStartTime().isBefore(proposedStart))
            .collect(Collectors.toList());

        if (available.isEmpty()) {
            return Collections.emptyList();
        }

        scoreSlots(available, proposedStart);

        return available.stream()
            .limit(Math.max(1, maxSuggestions))
            .collect(Collectors.toList());
    }

    private String resolveTimezone(User user) {
        if (user == null) {
            return "UTC";
        }

        String timezone = user.getTimezone();
        if (timezone == null || timezone.isBlank()) {
            return "UTC";
        }

        try {
            ZoneId.of(timezone);
            return timezone;
        } catch (DateTimeException ex) {
            logger.warn("Invalid timezone '{}' for user {}. Falling back to UTC.", timezone, user.getEmail());
            return "UTC";
        }
    }
    
    /**
     * Get suggested collaborators for the current user
     * Returns users they have previously invited to events, sorted by frequency
     *
     * @param userId The current user's ID
     * @param limit Maximum number of suggestions to return
     * @return List of CollaboratorDTO representing suggested collaborators
     */
    public List<CollaboratorDTO> getSuggestedCollaborators(UUID userId, int limit) {
        try {
            // Find the current user
            Optional<User> currentUserOpt = userRepository.findById(userId);
            if (currentUserOpt.isEmpty()) {
                logger.warn("User not found: {}", userId);
                return new ArrayList<>();
            }

            // Get all invitations where this user was the organizer
            List<Object[]> collaborators = userRepository.findFrequentCollaborators(userId, limit);

            List<CollaboratorDTO> result = new ArrayList<>();
            for (Object[] row : collaborators) {
                String email = (String) row[0];
                String displayName = (String) row[1];
                String timezone = (String) row[2];
                Long count = (Long) row[3];

                result.add(new CollaboratorDTO(
                    email,
                    displayName,
                    timezone,
                    count.intValue()
                ));
            }

            logger.debug("Found {} suggested collaborators for user {}", result.size(), userId);
            return result;

        } catch (Exception e) {
            logger.error("Error getting suggested collaborators: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
}
