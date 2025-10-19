package com.example.calendar.events;

import com.example.calendar.auth.User;
import com.example.calendar.auth.UserRepository;
import com.example.calendar.invitations.EmailService;
import com.example.calendar.invitations.Invitation;
import com.example.calendar.invitations.InvitationRepository;
import com.example.calendar.invitations.InvitationStatus;
import com.example.calendar.shared.TimeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EventService {

    private static final Logger logger = LoggerFactory.getLogger(EventService.class);

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventMapper eventMapper;

    @Autowired
    private InvitationRepository invitationRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private VideoConferenceService videoConferenceService;
    
    /**
     * Get events for a user within a date range
     * @param user The authenticated user
     * @param start Start instant (UTC)
     * @param end End instant (UTC)
     * @return List of EventDTOs
     */
    public List<EventDTO> getEventsByDateRange(User user, Instant start, Instant end) {
        return getEventsByDateRange(user, start, end, false, user != null ? user.getTimezone() : null);
    }

    /**
     * Get events for a user within a date range with option to include accepted invitations
     * @param user The authenticated user
     * @param start Start instant (UTC)
     * @param end End instant (UTC)
     * @param includeInvitations Whether to include events where the user is an invitee
     * @return List of EventDTOs
     */
    public List<EventDTO> getEventsByDateRange(User user, Instant start, Instant end, boolean includeInvitations) {
        return getEventsByDateRange(user, start, end, includeInvitations, user != null ? user.getTimezone() : null);
    }

    /**
     * Get events for a user within a date range with viewer-specific localization
     * @param user The authenticated user
     * @param start Start instant (UTC)
     * @param end End instant (UTC)
     * @param includeInvitations Whether to include events where the user is an invitee
     * @param viewerTimezone Optional timezone to localize event start/end times for the viewer
     * @return List of EventDTOs with localized fields populated
     */
    @Cacheable(value = "events", key = "#user.id + '_' + #start + '_' + #end + '_' + #includeInvitations + '_' + (#viewerTimezone == null ? 'null' : #viewerTimezone)")
    public List<EventDTO> getEventsByDateRange(User user, Instant start, Instant end, boolean includeInvitations, String viewerTimezone) {
        String effectiveTimezone = sanitizeTimezone(viewerTimezone, user != null ? user.getTimezone() : null);

        List<EventDTO> organizedEvents = eventRepository.findByOrganizerAndDateRange(user.getId(), start, end)
                .stream()
                .map(event -> mapToViewer(event, effectiveTimezone))
                .collect(Collectors.toList());

        if (includeInvitations) {
            List<EventDTO> invitedEvents = invitationRepository.findByRecipientEmailAndStatus(
                    user.getEmail().toLowerCase(), InvitationStatus.ACCEPTED)
                    .stream()
                    .map(Invitation::getEvent)
                    .filter(event -> {
                        Instant eventStart = event.getStartDateTime();
                        Instant eventEnd = event.getEndDateTime();
                        return (start == null || eventEnd.isAfter(start)) &&
                               (end == null || eventStart.isBefore(end));
                    })
                    .map(event -> mapToViewer(event, effectiveTimezone))
                    .collect(Collectors.toList());

            organizedEvents.addAll(invitedEvents);
        }

        organizedEvents.sort(Comparator.comparing(EventDTO::getStartDateTime));
        return organizedEvents;
    }

    /**
     * Get events for a specific day in user's timezone
     * @param user The authenticated user
     * @param date The date in user's timezone
     * @return List of EventDTOs
     */
    public List<EventDTO> getEventsByDay(User user, LocalDate date) {
        return getEventsByDay(user, date, false, user != null ? user.getTimezone() : null);
    }
    
    /**
     * Get events for a specific day in user's timezone with option to include accepted invitations
     * @param user The authenticated user
     * @param date The date in user's timezone
     * @param includeInvitations Whether to include events where the user is an invitee
     * @return List of EventDTOs
     */
    public List<EventDTO> getEventsByDay(User user, LocalDate date, boolean includeInvitations) {
        return getEventsByDay(user, date, includeInvitations, user != null ? user.getTimezone() : null);
    }

    public List<EventDTO> getEventsByDay(User user, LocalDate date, boolean includeInvitations, String viewerTimezone) {
        String effectiveTimezone = sanitizeTimezone(viewerTimezone, user != null ? user.getTimezone() : null);
        Instant start = TimeUtils.getStartOfDay(date, effectiveTimezone);
        Instant end = TimeUtils.getEndOfDay(date, effectiveTimezone);
        return getEventsByDateRange(user, start, end, includeInvitations, effectiveTimezone);
    }

    /**
     * Get events for a specific week in user's timezone
     * @param user The authenticated user
     * @param date Any date within the target week
     * @return List of EventDTOs
     */
    public List<EventDTO> getEventsByWeek(User user, LocalDate date) {
        return getEventsByWeek(user, date, false, user != null ? user.getTimezone() : null);
    }
    
    /**
     * Get events for a specific week in user's timezone with option to include accepted invitations
     * @param user The authenticated user
     * @param date Any date within the target week
     * @param includeInvitations Whether to include events where the user is an invitee
     * @return List of EventDTOs
     */
    public List<EventDTO> getEventsByWeek(User user, LocalDate date, boolean includeInvitations) {
        return getEventsByWeek(user, date, includeInvitations, user != null ? user.getTimezone() : null);
    }

    public List<EventDTO> getEventsByWeek(User user, LocalDate date, boolean includeInvitations, String viewerTimezone) {
        String effectiveTimezone = sanitizeTimezone(viewerTimezone, user != null ? user.getTimezone() : null);
        Instant[] boundaries = TimeUtils.getWeekBoundaries(date, effectiveTimezone);
        return getEventsByDateRange(user, boundaries[0], boundaries[1], includeInvitations, effectiveTimezone);
    }

    /**
     * Get all events for a user
     * @param user The authenticated user
     * @return List of EventDTOs
     */
    public List<EventDTO> getAllEvents(User user) {
        return getAllEvents(user, false, user != null ? user.getTimezone() : null);
    }
    
    /**
     * Get all events for a user with option to include accepted invitations
     * @param user The authenticated user
     * @param includeInvitations Whether to include events where the user is an invitee
     * @return List of EventDTOs
     */
    public List<EventDTO> getAllEvents(User user, boolean includeInvitations) {
        return getAllEvents(user, includeInvitations, user != null ? user.getTimezone() : null);
    }

    public List<EventDTO> getAllEvents(User user, boolean includeInvitations, String viewerTimezone) {
        String effectiveTimezone = sanitizeTimezone(viewerTimezone, user != null ? user.getTimezone() : null);

        List<EventDTO> result = eventRepository.findByOrganizerId(user.getId())
                .stream()
                .map(event -> mapToViewer(event, effectiveTimezone))
                .collect(Collectors.toList());

        if (includeInvitations) {
            List<EventDTO> invitedEvents = invitationRepository.findByRecipientEmailAndStatus(
                    user.getEmail().toLowerCase(), InvitationStatus.ACCEPTED)
                    .stream()
                    .map(Invitation::getEvent)
                    .map(event -> mapToViewer(event, effectiveTimezone))
                    .collect(Collectors.toList());

            result.addAll(invitedEvents);
        }

        result.sort(Comparator.comparing(EventDTO::getStartDateTime));
        return result;
    }

    /**
     * Get a single event by ID
     * @param eventId The event ID
     * @param user The authenticated user (for authorization)
     * @return EventDTO
     * @throws java.util.NoSuchElementException if event not found
     * @throws IllegalStateException if user is not authorized to view the event
     */
    public EventDTO getEventById(UUID eventId, User user) {
        return getEventById(eventId, user, user != null ? user.getTimezone() : null);
    }

    public EventDTO getEventById(UUID eventId, User user, String viewerTimezone) {
        Event event = eventRepository.findByIdWithOrganizer(eventId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Event not found"));

        boolean isOrganizer = event.getOrganizer().getId().equals(user.getId());

        boolean isInvited = invitationRepository.findByEventId(eventId).stream()
                .anyMatch(inv -> inv.getRecipientEmail().equalsIgnoreCase(user.getEmail()));

        if (!isOrganizer && !isInvited) {
            throw new IllegalStateException("Not authorized to access this event");
        }

        String effectiveTimezone = sanitizeTimezone(viewerTimezone, user != null ? user.getTimezone() : null);
        return mapToViewer(event, effectiveTimezone);
    }

    /**
     * Create a new event
     * @param eventDTO Event data
     * @param user The authenticated user
     * @return Created EventDTO
     */
    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public EventDTO createEvent(EventDTO eventDTO, User user) {
        Event event = eventMapper.toEntity(eventDTO);
        event.setOrganizer(user);

        String organizerTimezone = sanitizeTimezone(eventDTO.getTimezone(), user != null ? user.getTimezone() : null);
        event.setTimezone(organizerTimezone);
        
        // Validate event times
        if (event.getEndDateTime().isBefore(event.getStartDateTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        
        // Validate timezone
        if (!TimeUtils.isValidTimezone(event.getTimezone())) {
            throw new IllegalArgumentException("Invalid timezone: " + event.getTimezone());
        }
        
        // Save the event first to generate ID
        Event savedEvent = eventRepository.save(event);
        
        // Automatically generate video conference link if not provided
        if (savedEvent.getVideoConferenceLink() == null || savedEvent.getVideoConferenceLink().isEmpty()) {
            try {
                String meetingLink = videoConferenceService.generateMeetingLink(savedEvent);
                if (meetingLink != null) {
                    savedEvent.setVideoConferenceLink(meetingLink);
                    savedEvent = eventRepository.save(savedEvent);
                    logger.info("Generated and persisted meeting link for event {}: {}", savedEvent.getId(), meetingLink);
                } else {
                    logger.warn("Failed to generate meeting link for event {}", savedEvent.getId());
                }
            } catch (Exception e) {
                logger.error("Exception while generating meeting link for event {}", savedEvent.getId(), e);
                // Continue without video link - don't fail the entire event creation
            }
        }
        
        // Create invitations for all participants
        if (eventDTO.getParticipants() != null && !eventDTO.getParticipants().isEmpty()) {
            for (String participantEmail : eventDTO.getParticipants()) {
                // Validate email format (basic validation)
                if (participantEmail == null || !participantEmail.contains("@")) {
                    throw new IllegalArgumentException("Invalid email address: " + participantEmail);
                }
                
                Invitation invitation = new Invitation();
                invitation.setEvent(savedEvent);
                invitation.setRecipientEmail(participantEmail.toLowerCase().trim());
                invitation.setStatus(InvitationStatus.PENDING);
                Invitation savedInvitation = invitationRepository.save(invitation);
                
                // Send invitation email (log-only in MVP)
                emailService.sendInvitationEmail(savedInvitation);
            }
        }
        
        return mapToViewer(savedEvent, organizerTimezone);
    }

    /**
     * Update an existing event
     * @param eventId The event ID
     * @param eventDTO Updated event data
     * @param user The authenticated user
     * @return Updated EventDTO
     */
    @CacheEvict(value = "events", allEntries = true)
    public EventDTO updateEvent(UUID eventId, EventDTO eventDTO, User user) {
        Event existingEvent = eventRepository.findById(eventId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Event not found"));
        
        if (!existingEvent.getOrganizer().getId().equals(user.getId())) {
            throw new IllegalStateException("Not authorized to update this event");
        }
        
        // Update fields
        existingEvent.setTitle(eventDTO.getTitle());
        existingEvent.setDescription(eventDTO.getDescription());
        existingEvent.setStartDateTime(eventDTO.getStartDateTime());
        existingEvent.setEndDateTime(eventDTO.getEndDateTime());
    String updatedTimezone = sanitizeTimezone(eventDTO.getTimezone(), existingEvent.getTimezone());
    existingEvent.setTimezone(updatedTimezone);
        existingEvent.setRecurrenceRule(eventDTO.getRecurrenceRule());
        
        // Only update video conference link if explicitly provided
        if (eventDTO.getVideoConferenceLink() != null) {
            existingEvent.setVideoConferenceLink(eventDTO.getVideoConferenceLink());
        } else if (existingEvent.getVideoConferenceLink() == null || existingEvent.getVideoConferenceLink().isEmpty()) {
            // Generate a new link if none exists
            existingEvent.setVideoConferenceLink(videoConferenceService.generateMeetingLink(existingEvent));
        }
        
        existingEvent.setLocation(eventDTO.getLocation());
        
        // Validate
        if (existingEvent.getEndDateTime().isBefore(existingEvent.getStartDateTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        
        if (!TimeUtils.isValidTimezone(existingEvent.getTimezone())) {
            throw new IllegalArgumentException("Invalid timezone: " + existingEvent.getTimezone());
        }
        
        Event savedEvent = eventRepository.save(existingEvent);
        String viewerTimezone = sanitizeTimezone(null, user != null ? user.getTimezone() : null);
        return mapToViewer(savedEvent, viewerTimezone);
    }

    public String resolveViewerTimezone(String requestedTimezone, User user) {
        return sanitizeTimezone(requestedTimezone, user != null ? user.getTimezone() : null);
    }

    public EventDTO localizeEventForViewer(EventDTO eventDTO, String viewerTimezone) {
        return applyViewerTimezone(eventDTO, viewerTimezone);
    }

    private EventDTO mapToViewer(Event event, String viewerTimezone) {
        if (event == null) {
            return null;
        }
        EventDTO dto = eventMapper.toDTO(event);
        return applyViewerTimezone(dto, viewerTimezone);
    }

    private EventDTO applyViewerTimezone(EventDTO eventDTO, String requestedTimezone) {
        if (eventDTO == null) {
            return null;
        }

        String effectiveTimezone = sanitizeTimezone(requestedTimezone, eventDTO.getTimezone());
        eventDTO.setViewerTimezone(effectiveTimezone);

        if (eventDTO.getStartDateTime() != null) {
            eventDTO.setStartDateTimeLocalized(TimeUtils.formatIso8601(eventDTO.getStartDateTime(), effectiveTimezone));
        } else {
            eventDTO.setStartDateTimeLocalized(null);
        }

        if (eventDTO.getEndDateTime() != null) {
            eventDTO.setEndDateTimeLocalized(TimeUtils.formatIso8601(eventDTO.getEndDateTime(), effectiveTimezone));
        } else {
            eventDTO.setEndDateTimeLocalized(null);
        }

        return eventDTO;
    }

    private String sanitizeTimezone(String requestedTimezone, String fallbackTimezone) {
        if (requestedTimezone != null && !requestedTimezone.isBlank() && TimeUtils.isValidTimezone(requestedTimezone)) {
            return requestedTimezone;
        }

        if (fallbackTimezone != null && !fallbackTimezone.isBlank() && TimeUtils.isValidTimezone(fallbackTimezone)) {
            return fallbackTimezone;
        }

        return "UTC";
    }

    /**
     * Delete an event and notify all attendees of cancellation
     * @param eventId The event ID
     * @param user The authenticated user
     */
    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public void deleteEvent(UUID eventId, User user) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Event not found"));
        
        if (!event.getOrganizer().getId().equals(user.getId())) {
            throw new IllegalStateException("Not authorized to delete this event");
        }
        
        // Find all invitations for this event
        List<Invitation> invitations = invitationRepository.findByEventId(event.getId());
        
        // Update all invitations to CANCELLED status
        for (Invitation invitation : invitations) {
            invitation.setStatus(InvitationStatus.CANCELLED);
            invitationRepository.save(invitation);
            
            // Send cancellation email to attendees
            try {
                String recipientEmail = invitation.getRecipientEmail();
                if (recipientEmail == null || recipientEmail.isEmpty()) {
                    System.err.println("Skipping email - invalid recipient email");
                    continue;
                }
                
                // Get a safe timezone
                String timezone = "UTC";
                if (event.getTimezone() != null && !event.getTimezone().isEmpty()) {
                    timezone = event.getTimezone();
                }
                
                // Format the date time in a readable format
                String formattedStartTime;
                try {
                    java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter
                        .ofLocalizedDateTime(java.time.format.FormatStyle.FULL, java.time.format.FormatStyle.SHORT)
                        .withZone(java.time.ZoneId.of(timezone));
                    
                    formattedStartTime = formatter.format(event.getStartDateTime());
                } catch (Exception ex) {
                    // Fallback to ISO format if formatting fails
                    formattedStartTime = event.getStartDateTime().toString();
                }
                
                String title = event.getTitle() != null ? event.getTitle() : "Untitled Event";
                String subject = "Event Cancelled: " + title;
                String message = String.format(
                    "The event '%s' scheduled for %s has been cancelled by the organizer.",
                    title,
                    formattedStartTime
                );
                
                emailService.sendEmail(recipientEmail, subject, message);
            } catch (Exception e) {
                // Log error but continue with deletion
                System.err.println("Failed to send cancellation email: " + e.getMessage());
                e.printStackTrace(); // Add stack trace to help with debugging
            }
        }
        
        // Delete the event after notifying everyone
        eventRepository.delete(event);
    }
    
    /**
     * Get or create a test user for development/testing purposes
     * @return Test user
     */
    public User getTestUser() {
        return userRepository.findByEmail("test@example.com")
                .orElseGet(() -> {
                    User testUser = new User();
                    testUser.setGoogleSub("test-user-123");
                    testUser.setDisplayName("Test User");
                    testUser.setEmail("test@example.com");
                    testUser.setTimezone("America/New_York");
                    return userRepository.save(testUser);
                });
    }
}
