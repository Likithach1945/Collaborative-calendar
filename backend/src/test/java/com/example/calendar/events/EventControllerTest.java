package com.example.calendar.events;

import com.example.calendar.BaseIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.hamcrest.Matchers.*;

public class EventControllerTest extends BaseIntegrationTest {

    @Autowired
    private EventRepository eventRepository;

    private Event testEvent;

    @BeforeEach
    void setUpEvents() {
        // Create a test event
        testEvent = new Event();
        testEvent.setOrganizer(testUser);
        testEvent.setTitle("Test Event");
        testEvent.setDescription("Test Description");
        testEvent.setStartDateTime(Instant.now().plus(1, ChronoUnit.HOURS));
        testEvent.setEndDateTime(Instant.now().plus(2, ChronoUnit.HOURS));
        testEvent.setTimezone("America/New_York");
        testEvent.setLocation("Test Location");
        testEvent = eventRepository.save(testEvent);
    }

    @Test
    void listEvents_shouldReturnUserEvents() {
        authenticatedRequest()
                .when()
                .get("/api/v1/events")
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("$", hasSize(greaterThanOrEqualTo(1)))
                .body("[0].id", notNullValue())
                .body("[0].title", equalTo("Test Event"))
                .body("[0].organizerId", equalTo(testUser.getId().toString()));
    }

    @Test
    void listEvents_withDateRange_shouldReturnFilteredEvents() {
        Instant start = Instant.now();
        Instant end = Instant.now().plus(3, ChronoUnit.HOURS);

        authenticatedRequest()
                .queryParam("start", start.toString())
                .queryParam("end", end.toString())
                .when()
                .get("/api/v1/events")
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("$", hasSize(greaterThanOrEqualTo(1)));
    }

    @Test
    void getEvent_shouldReturnSingleEvent() {
        authenticatedRequest()
                .when()
                .get("/api/v1/events/" + testEvent.getId())
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("id", equalTo(testEvent.getId().toString()))
                .body("title", equalTo("Test Event"))
                .body("description", equalTo("Test Description"))
                .body("location", equalTo("Test Location"));
    }

    @Test
    void getEvent_nonExistent_shouldReturn404() {
        authenticatedRequest()
                .when()
                .get("/api/v1/events/00000000-0000-0000-0000-000000000000")
                .then()
                .statusCode(HttpStatus.NOT_FOUND.value());
    }

    @Test
    void createEvent_shouldReturnCreatedEvent() {
        Instant start = Instant.now().plus(5, ChronoUnit.HOURS);
        Instant end = start.plus(1, ChronoUnit.HOURS);

        String createPayload = String.format("""
                {
                    "title": "New Event",
                    "description": "New Description",
                    "startDateTime": "%s",
                    "endDateTime": "%s",
                    "timezone": "America/New_York",
                    "location": "New Location"
                }
                """, start.toString(), end.toString());

        authenticatedRequest()
                .body(createPayload)
                .when()
                .post("/api/v1/events")
                .then()
                .statusCode(HttpStatus.CREATED.value())
                .body("id", notNullValue())
                .body("title", equalTo("New Event"))
                .body("description", equalTo("New Description"));
    }

    @Test
    void updateEvent_shouldReturnUpdatedEvent() {
        String updatePayload = """
                {
                    "title": "Updated Title",
                    "description": "Updated Description"
                }
                """;

        authenticatedRequest()
                .body(updatePayload)
                .when()
                .patch("/api/v1/events/" + testEvent.getId())
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("title", equalTo("Updated Title"))
                .body("description", equalTo("Updated Description"));
    }

    @Test
    void deleteEvent_shouldReturn204() {
        authenticatedRequest()
                .when()
                .delete("/api/v1/events/" + testEvent.getId())
                .then()
                .statusCode(HttpStatus.NO_CONTENT.value());
    }

    @Test
    void listEvents_withoutAuth_shouldReturn401() {
        requestSpec
                .when()
                .get("/api/v1/events")
                .then()
                .statusCode(HttpStatus.UNAUTHORIZED.value());
    }
}
