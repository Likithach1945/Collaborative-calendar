package com.example.calendar.availability;

import com.example.calendar.auth.User;
import com.example.calendar.auth.UserRepository;
import com.example.calendar.events.Event;
import com.example.calendar.events.EventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Performance test for availability suggestions
 * Tests the system with realistic load scenarios
 */
@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class AvailabilityPerformanceTest {

    @Autowired
    private AvailabilityService availabilityService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    private User organizer;

    @BeforeEach
    void setUp() {
        organizer = new User();
        organizer.setEmail("organizer@example.com");
        organizer.setDisplayName("Organizer");
        organizer.setTimezone("America/New_York");
        organizer.setGoogleSub("google-organizer");
        organizer = userRepository.save(organizer);
    }

    @Test
    void testPerformance_10Participants_NoEvents() {
        // Create 10 participants with no events
        List<String> participantEmails = createParticipants(10, 0);

        Instant start = Instant.now().plus(1, ChronoUnit.DAYS).truncatedTo(ChronoUnit.HOURS);
        Instant end = start.plus(8, ChronoUnit.HOURS);

        AvailabilityRequestDTO request = new AvailabilityRequestDTO();
        request.setParticipantEmails(participantEmails);
        request.setStartRange(start);
        request.setEndRange(end);
        request.setDurationMinutes(60);

        // Measure execution time
        long startTime = System.currentTimeMillis();
        List<AvailabilitySlotDTO> suggestions = availabilityService.findAvailableSlots(request, organizer);
        long duration = System.currentTimeMillis() - startTime;

        // Assertions
        assertNotNull(suggestions);
        assertFalse(suggestions.isEmpty(), "Should find suggestions when participants have no conflicts");
        assertTrue(duration < 2000, "Should complete within 2 seconds for 10 participants with no events");

        System.out.println(String.format("Performance: 10 participants, 0 events each - %dms", duration));
        System.out.println(String.format("Found %d suggestions", suggestions.size()));
    }

    @Test
    void testPerformance_10Participants_5EventsEach() {
        // Create 10 participants, each with 5 events
        List<String> participantEmails = createParticipants(10, 5);

        Instant start = Instant.now().plus(1, ChronoUnit.DAYS).truncatedTo(ChronoUnit.HOURS);
        Instant end = start.plus(8, ChronoUnit.HOURS);

        AvailabilityRequestDTO request = new AvailabilityRequestDTO();
        request.setParticipantEmails(participantEmails);
        request.setStartRange(start);
        request.setEndRange(end);
        request.setDurationMinutes(60);

        // Measure execution time
        long startTime = System.currentTimeMillis();
        List<AvailabilitySlotDTO> suggestions = availabilityService.findAvailableSlots(request, organizer);
        long duration = System.currentTimeMillis() - startTime;

        // Assertions
        assertNotNull(suggestions);
        assertTrue(duration < 3000, "Should complete within 3 seconds for 10 participants with 5 events each");

        System.out.println(String.format("Performance: 10 participants, 5 events each - %dms", duration));
        System.out.println(String.format("Found %d suggestions", suggestions.size()));
    }

    @Test
    void testPerformance_5Participants_20EventsEach() {
        // Create 5 participants, each with 20 events (heavy load)
        List<String> participantEmails = createParticipants(5, 20);

        Instant start = Instant.now().plus(1, ChronoUnit.DAYS).truncatedTo(ChronoUnit.HOURS);
        Instant end = start.plus(8, ChronoUnit.HOURS);

        AvailabilityRequestDTO request = new AvailabilityRequestDTO();
        request.setParticipantEmails(participantEmails);
        request.setStartRange(start);
        request.setEndRange(end);
        request.setDurationMinutes(60);

        // Measure execution time
        long startTime = System.currentTimeMillis();
        List<AvailabilitySlotDTO> suggestions = availabilityService.findAvailableSlots(request, organizer);
        long duration = System.currentTimeMillis() - startTime;

        // Assertions
        assertNotNull(suggestions);
        assertTrue(duration < 4000, "Should complete within 4 seconds for 5 participants with 20 events each");

        System.out.println(String.format("Performance: 5 participants, 20 events each - %dms", duration));
        System.out.println(String.format("Found %d suggestions", suggestions.size()));
    }

    /**
     * Helper method to create participants with events
     * @param participantCount Number of participants to create
     * @param eventsPerParticipant Number of events to create for each participant
     * @return List of participant email addresses
     */
    private List<String> createParticipants(int participantCount, int eventsPerParticipant) {
        List<String> emails = new ArrayList<>();

        for (int i = 0; i < participantCount; i++) {
            String email = String.format("participant%d@example.com", i);
            emails.add(email);

            User user = new User();
            user.setEmail(email);
            user.setDisplayName("Participant " + i);
            user.setTimezone("America/New_York");
            user.setGoogleSub("google-" + i);
            user = userRepository.save(user);

            // Create events for this participant
            for (int j = 0; j < eventsPerParticipant; j++) {
                Event event = new Event();
                event.setOrganizer(user);
                event.setTitle("Meeting " + j);
                event.setTimezone("America/New_York");
                
                // Spread events across a week
                Instant eventStart = Instant.now()
                    .plus(j, ChronoUnit.DAYS)
                    .truncatedTo(ChronoUnit.HOURS)
                    .plus(9 + (j % 8), ChronoUnit.HOURS);
                
                event.setStartDateTime(eventStart);
                event.setEndDateTime(eventStart.plus(1, ChronoUnit.HOURS));
                
                eventRepository.save(event);
            }
        }

        return emails;
    }
}
