package com.example.calendar.availability;

import com.example.calendar.auth.User;
import com.example.calendar.auth.UserRepository;
import com.example.calendar.events.Event;
import com.example.calendar.events.EventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AvailabilityServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AvailabilityService availabilityService;

    private User testUser;
    private User participant1;
    private User participant2;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("organizer@example.com");
        testUser.setTimezone("America/New_York");

        participant1 = new User();
        participant1.setId(UUID.randomUUID());
        participant1.setEmail("participant1@example.com");
        participant1.setTimezone("America/New_York");

        participant2 = new User();
        participant2.setId(UUID.randomUUID());
        participant2.setEmail("participant2@example.com");
        participant2.setTimezone("America/New_York");
    }

    @Test
    void testFindAvailableSlots_Success() {
        // Arrange
        Instant start = Instant.parse("2024-12-01T14:00:00Z"); // 9 AM EST
        Instant end = Instant.parse("2024-12-01T22:00:00Z");   // 5 PM EST
        
        AvailabilityRequestDTO request = new AvailabilityRequestDTO();
        request.setParticipantEmails(Arrays.asList("participant1@example.com", "participant2@example.com"));
        request.setStartRange(start);
        request.setEndRange(end);
        request.setDurationMinutes(60);

        when(userRepository.findByEmail("participant1@example.com")).thenReturn(Optional.of(participant1));
        when(userRepository.findByEmail("participant2@example.com")).thenReturn(Optional.of(participant2));
        when(eventRepository.findByOrganizerAndDateRange(any(UUID.class), any(Instant.class), any(Instant.class)))
            .thenReturn(Collections.emptyList());

        // Act
        List<AvailabilitySlotDTO> suggestions = availabilityService.findAvailableSlots(request, testUser);

        // Assert
        assertNotNull(suggestions);
        assertFalse(suggestions.isEmpty(), "Should find available slots when participants have no conflicts");
        assertTrue(suggestions.size() <= 5, "Should return at most 5 suggestions");
        
        // Verify slots are properly ordered by score
        for (int i = 0; i < suggestions.size() - 1; i++) {
            assertTrue(suggestions.get(i).getScore() >= suggestions.get(i + 1).getScore(),
                "Suggestions should be sorted by score descending");
        }
    }

    @Test
    void testFindAvailableSlots_NoConflicts_ReturnsMultipleSuggestions() {
        // Arrange
        Instant start = Instant.parse("2024-12-01T14:00:00Z");
        Instant end = Instant.parse("2024-12-01T20:00:00Z"); // 6 hours
        
        AvailabilityRequestDTO request = new AvailabilityRequestDTO();
        request.setParticipantEmails(List.of("participant1@example.com"));
        request.setStartRange(start);
        request.setEndRange(end);
        request.setDurationMinutes(30);

        when(userRepository.findByEmail("participant1@example.com")).thenReturn(Optional.of(participant1));
        when(eventRepository.findByOrganizerAndDateRange(eq(participant1.getId()), any(Instant.class), any(Instant.class)))
            .thenReturn(Collections.emptyList());

        // Act
        List<AvailabilitySlotDTO> suggestions = availabilityService.findAvailableSlots(request, testUser);

        // Assert
        assertNotNull(suggestions);
        assertTrue(suggestions.size() >= 3, "Should return at least 3 suggestions when there are many available slots");
    }

    @Test
    void testFindAvailableSlots_WithConflicts_FiltersOutBusyTimes() {
        // Arrange
        Instant start = Instant.parse("2024-12-01T14:00:00Z"); // 9 AM EST
        Instant end = Instant.parse("2024-12-01T18:00:00Z");   // 1 PM EST
        
        AvailabilityRequestDTO request = new AvailabilityRequestDTO();
        request.setParticipantEmails(List.of("participant1@example.com"));
        request.setStartRange(start);
        request.setEndRange(end);
        request.setDurationMinutes(60);

        // Participant has a meeting from 10 AM to 11 AM EST (15:00-16:00 UTC)
        Event conflictingEvent = new Event();
        conflictingEvent.setStartDateTime(Instant.parse("2024-12-01T15:00:00Z"));
        conflictingEvent.setEndDateTime(Instant.parse("2024-12-01T16:00:00Z"));

        when(userRepository.findByEmail("participant1@example.com")).thenReturn(Optional.of(participant1));
        when(eventRepository.findByOrganizerAndDateRange(eq(participant1.getId()), any(Instant.class), any(Instant.class)))
            .thenReturn(List.of(conflictingEvent));

        // Act
        List<AvailabilitySlotDTO> suggestions = availabilityService.findAvailableSlots(request, testUser);

        // Assert
        assertNotNull(suggestions);
        
        // Verify no suggested slot overlaps with the conflicting event
        for (AvailabilitySlotDTO slot : suggestions) {
            boolean overlaps = slot.getStartTime().isBefore(conflictingEvent.getEndDateTime()) &&
                              slot.getEndTime().isAfter(conflictingEvent.getStartDateTime());
            assertFalse(overlaps, "Suggested slot should not overlap with participant's busy time");
        }
    }

    @Test
    void testFindAvailableSlots_NoCommonSlots_ReturnsEmpty() {
        // Arrange
        Instant start = Instant.parse("2024-12-01T14:00:00Z");
        Instant end = Instant.parse("2024-12-01T16:00:00Z"); // Only 2-hour window
        
        AvailabilityRequestDTO request = new AvailabilityRequestDTO();
        request.setParticipantEmails(List.of("participant1@example.com"));
        request.setStartRange(start);
        request.setEndRange(end);
        request.setDurationMinutes(60);

        // Participant is busy for the entire window
        Event allDayEvent = new Event();
        allDayEvent.setStartDateTime(start);
        allDayEvent.setEndDateTime(end);

        when(userRepository.findByEmail("participant1@example.com")).thenReturn(Optional.of(participant1));
        when(eventRepository.findByOrganizerAndDateRange(eq(participant1.getId()), any(Instant.class), any(Instant.class)))
            .thenReturn(List.of(allDayEvent));

        // Act
        List<AvailabilitySlotDTO> suggestions = availabilityService.findAvailableSlots(request, testUser);

        // Assert
        assertNotNull(suggestions);
        assertTrue(suggestions.isEmpty(), "Should return empty list when no slots are available");
    }

    @Test
    void testValidation_NoParticipants_ThrowsException() {
        // Arrange
        AvailabilityRequestDTO request = new AvailabilityRequestDTO();
        request.setParticipantEmails(Collections.emptyList());
        request.setStartRange(Instant.now());
        request.setEndRange(Instant.now().plus(1, ChronoUnit.HOURS));
        request.setDurationMinutes(60);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> availabilityService.findAvailableSlots(request, testUser),
            "Should throw exception when no participants provided");
    }

    @Test
    void testValidation_InvalidDateRange_ThrowsException() {
        // Arrange
        Instant start = Instant.now();
        Instant end = start.minus(1, ChronoUnit.HOURS);
        
        AvailabilityRequestDTO request = new AvailabilityRequestDTO();
        request.setParticipantEmails(List.of("participant1@example.com"));
        request.setStartRange(start);
        request.setEndRange(end);
        request.setDurationMinutes(60);

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
            () -> availabilityService.findAvailableSlots(request, testUser),
            "Should throw exception when end is before start");
    }

    @Test
    void testValidation_InvalidDuration_ThrowsException() {
        // Arrange
        AvailabilityRequestDTO request = new AvailabilityRequestDTO();
        request.setParticipantEmails(List.of("participant1@example.com"));
        request.setStartRange(Instant.now());
        request.setEndRange(Instant.now().plus(1, ChronoUnit.HOURS));
        request.setDurationMinutes(0);

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
            () -> availabilityService.findAvailableSlots(request, testUser),
            "Should throw exception for zero duration");
    }

    @Test
    void testValidation_DurationTooLong_ThrowsException() {
        // Arrange
        AvailabilityRequestDTO request = new AvailabilityRequestDTO();
        request.setParticipantEmails(List.of("participant1@example.com"));
        request.setStartRange(Instant.now());
        request.setEndRange(Instant.now().plus(1, ChronoUnit.DAYS));
        request.setDurationMinutes(500); // More than 8 hours

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
            () -> availabilityService.findAvailableSlots(request, testUser),
            "Should throw exception for duration exceeding 8 hours");
    }

    @Test
    void testPerformance_MultipleParticipants() {
        // Arrange
        Instant start = Instant.parse("2024-12-01T14:00:00Z");
        Instant end = Instant.parse("2024-12-01T22:00:00Z");
        
        List<String> participants = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            String email = "participant" + i + "@example.com";
            participants.add(email);
            
            User participant = new User();
            participant.setId(UUID.randomUUID());
            participant.setEmail(email);
            participant.setTimezone("America/New_York");
            
            when(userRepository.findByEmail(email)).thenReturn(Optional.of(participant));
            when(eventRepository.findByOrganizerAndDateRange(eq(participant.getId()), any(Instant.class), any(Instant.class)))
                .thenReturn(Collections.emptyList());
        }
        
        AvailabilityRequestDTO request = new AvailabilityRequestDTO();
        request.setParticipantEmails(participants);
        request.setStartRange(start);
        request.setEndRange(end);
        request.setDurationMinutes(60);

        // Act
        long startTime = System.currentTimeMillis();
        List<AvailabilitySlotDTO> suggestions = availabilityService.findAvailableSlots(request, testUser);
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;

        // Assert
        assertNotNull(suggestions);
        assertTrue(duration < 5000, "Should complete within 5 seconds for 10 participants");
        System.out.println("Performance test: " + duration + "ms for 10 participants");
    }

    @Test
    void testSlotScoring_EarlierSlotsScoreHigher() {
        // Arrange
        Instant start = Instant.parse("2024-12-01T14:00:00Z");
        Instant end = Instant.parse("2024-12-01T20:00:00Z");
        
        AvailabilityRequestDTO request = new AvailabilityRequestDTO();
        request.setParticipantEmails(List.of("participant1@example.com"));
        request.setStartRange(start);
        request.setEndRange(end);
        request.setDurationMinutes(60);

        when(userRepository.findByEmail("participant1@example.com")).thenReturn(Optional.of(participant1));
        when(eventRepository.findByOrganizerAndDateRange(any(UUID.class), any(Instant.class), any(Instant.class)))
            .thenReturn(Collections.emptyList());

        // Act
        List<AvailabilitySlotDTO> suggestions = availabilityService.findAvailableSlots(request, testUser);

        // Assert
        assertNotNull(suggestions);
        assertFalse(suggestions.isEmpty());
        
        // First suggestion should be earlier than last suggestion
        AvailabilitySlotDTO firstSlot = suggestions.get(0);
        AvailabilitySlotDTO lastSlot = suggestions.get(suggestions.size() - 1);
        
        assertTrue(firstSlot.getStartTime().isBefore(lastSlot.getStartTime()),
            "Earlier slots should have higher scores and appear first");
        assertTrue(firstSlot.getScore() > lastSlot.getScore(),
            "Earlier slots should have higher scores");
    }
}
