package com.example.calendar.invitations;

import com.example.calendar.BaseIntegrationTest;
import com.example.calendar.auth.User;
import com.example.calendar.auth.UserRepository;
import com.example.calendar.events.Event;
import com.example.calendar.events.EventRepository;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static io.restassured.RestAssured.given;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;

public class InvitationResponseIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private UserRepository userRepository;

    private User organizer;
    private User recipient1;
    private User recipient2;
    private String organizerToken;
    private String recipient1Token;
    private String recipient2Token;
    private Event testEvent;

    @BeforeEach
    public void setUpInvitationTest() {
        // Clean up
        invitationRepository.deleteAll();
        eventRepository.deleteAll();

        // Create organizer (testUser from BaseIntegrationTest)
        organizer = testUser;
        organizerToken = testToken;

        // Create recipient users
        recipient1 = new User();
        recipient1.setGoogleSub("recipient1-google-sub");
        recipient1.setEmail("recipient1@example.com");
        recipient1.setDisplayName("Recipient One");
        recipient1.setTimezone("America/New_York");
        recipient1 = userRepository.save(recipient1);
        recipient1Token = jwtUtil.generateToken(recipient1.getId(), recipient1.getEmail());

        recipient2 = new User();
        recipient2.setGoogleSub("recipient2-google-sub");
        recipient2.setEmail("recipient2@example.com");
        recipient2.setDisplayName("Recipient Two");
        recipient2.setTimezone("America/Los_Angeles");
        recipient2 = userRepository.save(recipient2);
        recipient2Token = jwtUtil.generateToken(recipient2.getId(), recipient2.getEmail());

        // Create test event with invitations
        testEvent = new Event();
        testEvent.setTitle("Team Meeting");
        testEvent.setDescription("Weekly sync");
        testEvent.setStartDateTime(Instant.now().plus(1, ChronoUnit.DAYS));
        testEvent.setEndDateTime(Instant.now().plus(1, ChronoUnit.DAYS).plus(1, ChronoUnit.HOURS));
        testEvent.setTimezone("UTC");
        testEvent.setOrganizer(organizer);
        testEvent = eventRepository.save(testEvent);

        // Create invitations
        Invitation inv1 = new Invitation();
        inv1.setEvent(testEvent);
        inv1.setRecipientEmail(recipient1.getEmail());
        inv1.setStatus(InvitationStatus.PENDING);
        invitationRepository.save(inv1);

        Invitation inv2 = new Invitation();
        inv2.setEvent(testEvent);
        inv2.setRecipientEmail(recipient2.getEmail());
        inv2.setStatus(InvitationStatus.PENDING);
        invitationRepository.save(inv2);
    }

    @Test
    public void testAcceptInvitation() {
        List<Invitation> invitations = invitationRepository.findByRecipientEmail(recipient1.getEmail());
        assertThat(invitations).hasSize(1);
        Invitation invitation = invitations.get(0);

        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + recipient1Token)
            .contentType(ContentType.JSON)
            .body("""
                {
                    "status": "ACCEPTED",
                    "responseNote": "Looking forward to it!"
                }
                """)
        .when()
            .patch("/api/v1/invitations/" + invitation.getId())
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("id", equalTo(invitation.getId().toString()))
            .body("status", equalTo("ACCEPTED"))
            .body("responseNote", equalTo("Looking forward to it!"))
            .body("respondedAt", notNullValue());

        // Verify in database
        Invitation updated = invitationRepository.findById(invitation.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(InvitationStatus.ACCEPTED);
        assertThat(updated.getResponseNote()).isEqualTo("Looking forward to it!");
        assertThat(updated.getRespondedAt()).isNotNull();
    }

    @Test
    public void testDeclineInvitation() {
        List<Invitation> invitations = invitationRepository.findByRecipientEmail(recipient2.getEmail());
        Invitation invitation = invitations.get(0);

        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + recipient2Token)
            .contentType(ContentType.JSON)
            .body("""
                {
                    "status": "DECLINED",
                    "responseNote": "Sorry, I have a conflict"
                }
                """)
        .when()
            .patch("/api/v1/invitations/" + invitation.getId())
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("status", equalTo("DECLINED"))
            .body("responseNote", equalTo("Sorry, I have a conflict"));

        // Verify in database
        Invitation updated = invitationRepository.findById(invitation.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(InvitationStatus.DECLINED);
    }

    @Test
    public void testRespondToInvitationWithoutNote() {
        List<Invitation> invitations = invitationRepository.findByRecipientEmail(recipient1.getEmail());
        Invitation invitation = invitations.get(0);

        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + recipient1Token)
            .contentType(ContentType.JSON)
            .body("""
                {
                    "status": "ACCEPTED"
                }
                """)
        .when()
            .patch("/api/v1/invitations/" + invitation.getId())
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("status", equalTo("ACCEPTED"))
            .body("responseNote", nullValue());
    }

    @Test
    public void testCannotRespondToOtherUsersInvitation() {
        List<Invitation> invitations = invitationRepository.findByRecipientEmail(recipient1.getEmail());
        Invitation invitation = invitations.get(0);

        // Recipient2 tries to respond to recipient1's invitation
        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + recipient2Token)
            .contentType(ContentType.JSON)
            .body("""
                {
                    "status": "ACCEPTED"
                }
                """)
        .when()
            .patch("/api/v1/invitations/" + invitation.getId())
        .then()
            .statusCode(HttpStatus.BAD_REQUEST.value())
            .body("error", containsString("not the recipient"));
    }

    @Test
    public void testInvalidStatus() {
        List<Invitation> invitations = invitationRepository.findByRecipientEmail(recipient1.getEmail());
        Invitation invitation = invitations.get(0);

        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + recipient1Token)
            .contentType(ContentType.JSON)
            .body("""
                {
                    "status": "PENDING"
                }
                """)
        .when()
            .patch("/api/v1/invitations/" + invitation.getId())
        .then()
            .statusCode(HttpStatus.BAD_REQUEST.value())
            .body("error", containsString("Invalid status"));
    }

    @Test
    public void testGetEventInvitations() {
        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + organizerToken)
        .when()
            .get("/api/v1/events/" + testEvent.getId() + "/invitations")
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("size()", equalTo(2))
            .body("[0].recipientEmail", isOneOf(recipient1.getEmail(), recipient2.getEmail()))
            .body("[1].recipientEmail", isOneOf(recipient1.getEmail(), recipient2.getEmail()));
    }

    @Test
    public void testNonOrganizerCannotGetEventInvitations() {
        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + recipient1Token)
        .when()
            .get("/api/v1/events/" + testEvent.getId() + "/invitations")
        .then()
            .statusCode(HttpStatus.FORBIDDEN.value())
            .body("error", containsString("not the organizer"));
    }

    @Test
    public void testGetEventInvitationSummary() {
        // Accept one invitation
        List<Invitation> inv1List = invitationRepository.findByRecipientEmail(recipient1.getEmail());
        Invitation inv1 = inv1List.get(0);
        inv1.setStatus(InvitationStatus.ACCEPTED);
        invitationRepository.save(inv1);

        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + organizerToken)
        .when()
            .get("/api/v1/events/" + testEvent.getId() + "/invitations/summary")
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("totalInvitations", equalTo(2))
            .body("acceptedCount", equalTo(1))
            .body("declinedCount", equalTo(0))
            .body("pendingCount", equalTo(1))
            .body("acceptanceRate", equalTo(50.0f));
    }

    @Test
    public void testGetUserInvitations() {
        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + recipient1Token)
        .when()
            .get("/api/v1/invitations")
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("size()", equalTo(1))
            .body("[0].recipientEmail", equalTo(recipient1.getEmail()))
            .body("[0].status", equalTo("PENDING"));
    }

    @Test
    public void testGetUserInvitationsByStatus() {
        // Accept recipient1's invitation
        List<Invitation> inv1List = invitationRepository.findByRecipientEmail(recipient1.getEmail());
        Invitation inv1 = inv1List.get(0);
        inv1.setStatus(InvitationStatus.ACCEPTED);
        invitationRepository.save(inv1);

        // Get accepted invitations
        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + recipient1Token)
            .queryParam("status", "ACCEPTED")
        .when()
            .get("/api/v1/invitations")
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("size()", equalTo(1))
            .body("[0].status", equalTo("ACCEPTED"));

        // Get pending invitations
        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + recipient1Token)
            .queryParam("status", "PENDING")
        .when()
            .get("/api/v1/invitations")
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("size()", equalTo(0));
    }

    @Test
    public void testChangeResponseFromAcceptedToDeclined() {
        // First accept
        List<Invitation> invitations = invitationRepository.findByRecipientEmail(recipient1.getEmail());
        Invitation invitation = invitations.get(0);

        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + recipient1Token)
            .contentType(ContentType.JSON)
            .body("""
                {
                    "status": "ACCEPTED"
                }
                """)
        .when()
            .patch("/api/v1/invitations/" + invitation.getId())
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("status", equalTo("ACCEPTED"));

        // Then decline
        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + recipient1Token)
            .contentType(ContentType.JSON)
            .body("""
                {
                    "status": "DECLINED",
                    "responseNote": "Changed my mind"
                }
                """)
        .when()
            .patch("/api/v1/invitations/" + invitation.getId())
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("status", equalTo("DECLINED"))
            .body("responseNote", equalTo("Changed my mind"));

        // Verify final state
        Invitation updated = invitationRepository.findById(invitation.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(InvitationStatus.DECLINED);
    }

    @Test
    public void testUnauthorizedAccessToInvitation() {
        List<Invitation> invitations = invitationRepository.findByRecipientEmail(recipient1.getEmail());
        Invitation invitation = invitations.get(0);

        given()
            .port(RestAssured.port)
            .contentType(ContentType.JSON)
            .body("""
                {
                    "status": "ACCEPTED"
                }
                """)
        .when()
            .patch("/api/v1/invitations/" + invitation.getId())
        .then()
            .statusCode(HttpStatus.UNAUTHORIZED.value());
    }
}
