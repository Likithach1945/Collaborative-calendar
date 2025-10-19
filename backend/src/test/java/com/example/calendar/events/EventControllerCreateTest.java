package com.example.calendar.events;

import com.example.calendar.auth.User;
import com.example.calendar.auth.UserRepository;
import com.example.calendar.invitations.Invitation;
import com.example.calendar.invitations.InvitationRepository;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
public class EventControllerCreateTest {

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

    @LocalServerPort
    private int port;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private InvitationRepository invitationRepository;

    private String authToken;
    private User testUser;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "/api/v1";

        // Clean up
        invitationRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        // Create test user
        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setDisplayName("Test User");
        testUser.setTimezone("America/New_York");
        testUser.setGoogleSub("google123");
        testUser = userRepository.save(testUser);

        // Mock auth token (in real scenario, use OAuth flow)
        authToken = "Bearer mock-token-" + testUser.getId();
    }

    @Test
    void testCreateEvent_Success() {
        Instant now = Instant.now();
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("title", "Team Meeting");
        eventData.put("description", "Discuss Q1 goals");
        eventData.put("startDateTime", now.toString());
        eventData.put("endDateTime", now.plus(1, ChronoUnit.HOURS).toString());
        eventData.put("timezone", "America/New_York");
        eventData.put("location", "Conference Room A");
        eventData.put("participants", Arrays.asList("alice@example.com", "bob@example.com"));

        given()
            .contentType(ContentType.JSON)
            .header("Authorization", authToken)
            .body(eventData)
        .when()
            .post("/events")
        .then()
            .statusCode(201)
            .body("title", equalTo("Team Meeting"))
            .body("description", equalTo("Discuss Q1 goals"))
            .body("location", equalTo("Conference Room A"))
            .body("timezone", equalTo("America/New_York"))
            .body("id", notNullValue())
            .body("organizerId", equalTo(testUser.getId().toString()));

        // Verify invitations were created
        List<Invitation> invitations = invitationRepository.findAll();
        assertEquals(2, invitations.size(), "Should create 2 invitations");
    }

    @Test
    void testCreateEvent_MissingTitle_Returns400() {
        Instant now = Instant.now();
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("description", "No title provided");
        eventData.put("startDateTime", now.toString());
        eventData.put("endDateTime", now.plus(1, ChronoUnit.HOURS).toString());
        eventData.put("timezone", "America/New_York");

        given()
            .contentType(ContentType.JSON)
            .header("Authorization", authToken)
            .body(eventData)
        .when()
            .post("/events")
        .then()
            .statusCode(400);
    }

    @Test
    void testCreateEvent_MissingStartDateTime_Returns400() {
        Instant now = Instant.now();
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("title", "Meeting");
        eventData.put("endDateTime", now.plus(1, ChronoUnit.HOURS).toString());
        eventData.put("timezone", "America/New_York");

        given()
            .contentType(ContentType.JSON)
            .header("Authorization", authToken)
            .body(eventData)
        .when()
            .post("/events")
        .then()
            .statusCode(400);
    }

    @Test
    void testCreateEvent_MissingEndDateTime_Returns400() {
        Instant now = Instant.now();
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("title", "Meeting");
        eventData.put("startDateTime", now.toString());
        eventData.put("timezone", "America/New_York");

        given()
            .contentType(ContentType.JSON)
            .header("Authorization", authToken)
            .body(eventData)
        .when()
            .post("/events")
        .then()
            .statusCode(400);
    }

    @Test
    void testCreateEvent_EndBeforeStart_Returns400() {
        Instant now = Instant.now();
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("title", "Invalid Meeting");
        eventData.put("startDateTime", now.toString());
        eventData.put("endDateTime", now.minus(1, ChronoUnit.HOURS).toString()); // End before start
        eventData.put("timezone", "America/New_York");

        given()
            .contentType(ContentType.JSON)
            .header("Authorization", authToken)
            .body(eventData)
        .when()
            .post("/events")
        .then()
            .statusCode(400);
    }

    @Test
    void testCreateEvent_InvalidTimezone_Returns400() {
        Instant now = Instant.now();
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("title", "Meeting");
        eventData.put("startDateTime", now.toString());
        eventData.put("endDateTime", now.plus(1, ChronoUnit.HOURS).toString());
        eventData.put("timezone", "Invalid/Timezone");

        given()
            .contentType(ContentType.JSON)
            .header("Authorization", authToken)
            .body(eventData)
        .when()
            .post("/events")
        .then()
            .statusCode(400);
    }

    @Test
    void testCreateEvent_InvalidParticipantEmail_Returns400() {
        Instant now = Instant.now();
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("title", "Meeting");
        eventData.put("startDateTime", now.toString());
        eventData.put("endDateTime", now.plus(1, ChronoUnit.HOURS).toString());
        eventData.put("timezone", "America/New_York");
        eventData.put("participants", Arrays.asList("alice@example.com", "invalid-email"));

        given()
            .contentType(ContentType.JSON)
            .header("Authorization", authToken)
            .body(eventData)
        .when()
            .post("/events")
        .then()
            .statusCode(400);
    }

    @Test
    void testCreateEvent_WithoutParticipants_Success() {
        Instant now = Instant.now();
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("title", "Solo Meeting");
        eventData.put("startDateTime", now.toString());
        eventData.put("endDateTime", now.plus(1, ChronoUnit.HOURS).toString());
        eventData.put("timezone", "America/New_York");

        given()
            .contentType(ContentType.JSON)
            .header("Authorization", authToken)
            .body(eventData)
        .when()
            .post("/events")
        .then()
            .statusCode(201)
            .body("title", equalTo("Solo Meeting"));

        // Verify no invitations were created
        List<Invitation> invitations = invitationRepository.findAll();
        assertEquals(0, invitations.size(), "Should not create invitations when no participants");
    }

    @Test
    void testCreateEvent_MultipleParticipants_CreatesCorrectNumberOfInvitations() {
        Instant now = Instant.now();
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("title", "Large Meeting");
        eventData.put("startDateTime", now.toString());
        eventData.put("endDateTime", now.plus(1, ChronoUnit.HOURS).toString());
        eventData.put("timezone", "America/New_York");
        eventData.put("participants", Arrays.asList(
            "alice@example.com",
            "bob@example.com",
            "charlie@example.com",
            "david@example.com",
            "eve@example.com"
        ));

        given()
            .contentType(ContentType.JSON)
            .header("Authorization", authToken)
            .body(eventData)
        .when()
            .post("/events")
        .then()
            .statusCode(201);

        // Verify 5 invitations were created
        List<Invitation> invitations = invitationRepository.findAll();
        assertEquals(5, invitations.size(), "Should create 5 invitations for 5 participants");
    }

    @Test
    void testCreateEvent_Unauthorized_Returns401() {
        Instant now = Instant.now();
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("title", "Meeting");
        eventData.put("startDateTime", now.toString());
        eventData.put("endDateTime", now.plus(1, ChronoUnit.HOURS).toString());
        eventData.put("timezone", "America/New_York");

        given()
            .contentType(ContentType.JSON)
            // No Authorization header
            .body(eventData)
        .when()
            .post("/events")
        .then()
            .statusCode(401);
    }

    @Test
    void testCreateEvent_OrganizerSetToAuthenticatedUser() {
        Instant now = Instant.now();
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("title", "Test Meeting");
        eventData.put("startDateTime", now.toString());
        eventData.put("endDateTime", now.plus(1, ChronoUnit.HOURS).toString());
        eventData.put("timezone", "America/New_York");

        String response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", authToken)
            .body(eventData)
        .when()
            .post("/events")
        .then()
            .statusCode(201)
            .body("organizerId", notNullValue())
            .extract()
            .path("organizerId")
            .toString();

        // Verify the organizer is the authenticated user
        assertEquals(testUser.getId().toString(), response, 
                "Event organizer should be the authenticated user");
    }
}
