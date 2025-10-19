package com.example.calendar.events;

import com.example.calendar.auth.User;
import com.example.calendar.auth.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Testcontainers
class EventRepositoryTest {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("calendar_test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
    }

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        eventRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User();
        testUser.setGoogleSub("test-sub");
        testUser.setEmail("test@example.com");
        testUser.setDisplayName("Test User");
        testUser.setTimezone("UTC");
        testUser = userRepository.save(testUser);
    }

    @Test
    void findByOrganizerAndDateRange_shouldReturnEventsInRange() {
        // Create events
        Instant now = Instant.now();
        Event event1 = createEvent("Event 1", now.minus(2, ChronoUnit.HOURS), now.minus(1, ChronoUnit.HOURS));
        Event event2 = createEvent("Event 2", now.plus(1, ChronoUnit.HOURS), now.plus(2, ChronoUnit.HOURS));
        Event event3 = createEvent("Event 3", now.plus(5, ChronoUnit.HOURS), now.plus(6, ChronoUnit.HOURS));

        // Query for events in range
        Instant rangeStart = now.minus(3, ChronoUnit.HOURS);
        Instant rangeEnd = now.plus(3, ChronoUnit.HOURS);

        List<Event> events = eventRepository.findByOrganizerAndDateRange(
                testUser.getId(), rangeStart, rangeEnd);

        // Should return event1 and event2, not event3
        assertThat(events).hasSize(2);
        assertThat(events).extracting(Event::getTitle)
                .containsExactly("Event 1", "Event 2");
    }

    @Test
    void findByOrganizerAndDateRange_shouldOrderByStartDateTime() {
        // Create events in random order
        Instant now = Instant.now();
        Event event3 = createEvent("Event 3", now.plus(6, ChronoUnit.HOURS), now.plus(7, ChronoUnit.HOURS));
        Event event1 = createEvent("Event 1", now.plus(2, ChronoUnit.HOURS), now.plus(3, ChronoUnit.HOURS));
        Event event2 = createEvent("Event 2", now.plus(4, ChronoUnit.HOURS), now.plus(5, ChronoUnit.HOURS));

        // Query all events
        Instant rangeStart = now;
        Instant rangeEnd = now.plus(10, ChronoUnit.HOURS);

        List<Event> events = eventRepository.findByOrganizerAndDateRange(
                testUser.getId(), rangeStart, rangeEnd);

        // Should be ordered by start time
        assertThat(events).hasSize(3);
        assertThat(events).extracting(Event::getTitle)
                .containsExactly("Event 1", "Event 2", "Event 3");
    }

    @Test
    void findByOrganizerAndDateRange_shouldOnlyReturnUserEvents() {
        // Create another user
        User otherUser = new User();
        otherUser.setGoogleSub("other-sub");
        otherUser.setEmail("other@example.com");
        otherUser.setDisplayName("Other User");
        otherUser.setTimezone("UTC");
        otherUser = userRepository.save(otherUser);

        // Create events for both users
        Instant now = Instant.now();
        Event testUserEvent = createEvent("Test User Event", now.plus(1, ChronoUnit.HOURS), now.plus(2, ChronoUnit.HOURS));
        
        Event otherUserEvent = new Event();
        otherUserEvent.setOrganizer(otherUser);
        otherUserEvent.setTitle("Other User Event");
        otherUserEvent.setStartDateTime(now.plus(1, ChronoUnit.HOURS));
        otherUserEvent.setEndDateTime(now.plus(2, ChronoUnit.HOURS));
        otherUserEvent.setTimezone("UTC");
        eventRepository.save(otherUserEvent);

        // Query test user events
        Instant rangeStart = now;
        Instant rangeEnd = now.plus(10, ChronoUnit.HOURS);

        List<Event> events = eventRepository.findByOrganizerAndDateRange(
                testUser.getId(), rangeStart, rangeEnd);

        // Should only return test user's event
        assertThat(events).hasSize(1);
        assertThat(events.get(0).getTitle()).isEqualTo("Test User Event");
    }

    @Test
    void findByOrganizerAndDateRange_shouldReturnEmptyForNoMatches() {
        // Create event outside range
        Instant now = Instant.now();
        createEvent("Old Event", now.minus(10, ChronoUnit.DAYS), now.minus(9, ChronoUnit.DAYS));

        // Query for recent events
        Instant rangeStart = now.minus(1, ChronoUnit.HOURS);
        Instant rangeEnd = now.plus(1, ChronoUnit.HOURS);

        List<Event> events = eventRepository.findByOrganizerAndDateRange(
                testUser.getId(), rangeStart, rangeEnd);

        assertThat(events).isEmpty();
    }

    @Test
    void findByOrganizerId_shouldReturnAllUserEvents() {
        // Create multiple events
        Instant now = Instant.now();
        createEvent("Event 1", now.minus(1, ChronoUnit.DAYS), now.minus(1, ChronoUnit.DAYS).plus(1, ChronoUnit.HOURS));
        createEvent("Event 2", now, now.plus(1, ChronoUnit.HOURS));
        createEvent("Event 3", now.plus(1, ChronoUnit.DAYS), now.plus(1, ChronoUnit.DAYS).plus(1, ChronoUnit.HOURS));

        List<Event> events = eventRepository.findByOrganizerId(testUser.getId());

        assertThat(events).hasSize(3);
    }

    private Event createEvent(String title, Instant start, Instant end) {
        Event event = new Event();
        event.setOrganizer(testUser);
        event.setTitle(title);
        event.setStartDateTime(start);
        event.setEndDateTime(end);
        event.setTimezone("UTC");
        return eventRepository.save(event);
    }
}
