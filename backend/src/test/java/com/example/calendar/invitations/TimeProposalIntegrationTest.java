package com.example.calendar.invitations;

import com.example.calendar.BaseIntegrationTest;
import com.example.calendar.auth.User;
import com.example.calendar.auth.UserRepository;
import com.example.calendar.events.Event;
import com.example.calendar.events.EventRepository;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for time proposal functionality (T084)
 */
public class TimeProposalIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private UserRepository userRepository;

    private User organizer;
    private User recipient;
    private Event testEvent;
    private Invitation testInvitation;
    private String organizerToken;
    private String recipientToken;

    @BeforeEach
    public void setupTestData() {
        invitationRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        // Create organizer
        organizer = new User();
        organizer.setEmail("organizer@example.com");
        organizer.setDisplayName("Event Organizer");
        organizer = userRepository.save(organizer);
        organizerToken = jwtUtil.generateToken(organizer.getId(), organizer.getEmail());

        // Create recipient
        recipient = new User();
        recipient.setEmail("recipient@example.com");
        recipient.setDisplayName("Event Recipient");
        recipient = userRepository.save(recipient);
        recipientToken = jwtUtil.generateToken(recipient.getId(), recipient.getEmail());

        // Create test event
        testEvent = new Event();
        testEvent.setTitle("Team Meeting");
        testEvent.setStartDateTime(Instant.now().plus(7, ChronoUnit.DAYS));
        testEvent.setEndDateTime(Instant.now().plus(7, ChronoUnit.DAYS).plus(1, ChronoUnit.HOURS));
        testEvent.setLocation("Conference Room");
        testEvent.setOrganizer(organizer);
        testEvent = eventRepository.save(testEvent);

        // Create invitation
        testInvitation = new Invitation();
        testInvitation.setEvent(testEvent);
        testInvitation.setRecipientEmail(recipient.getEmail());
        testInvitation.setStatus(InvitationStatus.PENDING);
        testInvitation = invitationRepository.save(testInvitation);
    }

    @Test
    public void testProposeAlternativeTime() {
        Instant proposedStart = Instant.now().plus(8, ChronoUnit.DAYS);
        Instant proposedEnd = proposedStart.plus(1, ChronoUnit.HOURS);

        Map<String, Object> proposalRequest = new HashMap<>();
        proposalRequest.put("status", "PROPOSED");
        proposalRequest.put("responseNote", "Can we meet a day later?");
        proposalRequest.put("proposedStart", proposedStart.toString());
        proposalRequest.put("proposedEnd", proposedEnd.toString());

        given()
            .header("Authorization", "Bearer " + recipientToken)
            .contentType(ContentType.JSON)
            .body(proposalRequest)
        .when()
            .patch("/api/v1/invitations/" + testInvitation.getId())
        .then()
            .statusCode(200)
            .body("status", equalTo("PROPOSED"))
            .body("responseNote", equalTo("Can we meet a day later?"))
            .body("proposedStart", notNullValue())
            .body("proposedEnd", notNullValue());

        // Verify in database
        Invitation updated = invitationRepository.findById(testInvitation.getId()).orElseThrow();
        assertEquals(InvitationStatus.PROPOSED, updated.getStatus());
        assertNotNull(updated.getProposedStart());
        assertNotNull(updated.getProposedEnd());
        assertEquals(proposedStart, updated.getProposedStart());
        assertEquals(proposedEnd, updated.getProposedEnd());
    }

    @Test
    public void testProposalRequiresStartAndEnd() {
        Map<String, Object> invalidProposal = new HashMap<>();
        invalidProposal.put("status", "PROPOSED");
        invalidProposal.put("responseNote", "Missing times");
        // Missing proposedStart and proposedEnd

        given()
            .header("Authorization", "Bearer " + recipientToken)
            .contentType(ContentType.JSON)
            .body(invalidProposal)
        .when()
            .patch("/api/v1/invitations/" + testInvitation.getId())
        .then()
            .statusCode(400);
    }

    @Test
    public void testProposalEndMustBeAfterStart() {
        Instant proposedStart = Instant.now().plus(8, ChronoUnit.DAYS);
        Instant proposedEnd = proposedStart.minus(1, ChronoUnit.HOURS); // Invalid: end before start

        Map<String, Object> invalidProposal = new HashMap<>();
        invalidProposal.put("status", "PROPOSED");
        invalidProposal.put("proposedStart", proposedStart.toString());
        invalidProposal.put("proposedEnd", proposedEnd.toString());

        given()
            .header("Authorization", "Bearer " + recipientToken)
            .contentType(ContentType.JSON)
            .body(invalidProposal)
        .when()
            .patch("/api/v1/invitations/" + testInvitation.getId())
        .then()
            .statusCode(400);
    }

    @Test
    public void testAcceptProposalUpdatesEventTime() {
        // First, recipient proposes a new time
        Instant proposedStart = Instant.now().plus(8, ChronoUnit.DAYS);
        Instant proposedEnd = proposedStart.plus(1, ChronoUnit.HOURS);

        testInvitation.setStatus(InvitationStatus.PROPOSED);
        testInvitation.setProposedStart(proposedStart);
        testInvitation.setProposedEnd(proposedEnd);
        testInvitation = invitationRepository.save(testInvitation);

        Instant originalStart = testEvent.getStartDateTime();

        // Organizer accepts the proposal
        given()
            .header("Authorization", "Bearer " + organizerToken)
        .when()
            .post("/api/v1/invitations/" + testInvitation.getId() + "/accept-proposal")
        .then()
            .statusCode(200)
            .body("message", containsString("accepted"));

        // Verify event time was updated
        Event updatedEvent = eventRepository.findById(testEvent.getId()).orElseThrow();
        assertEquals(proposedStart, updatedEvent.getStartDateTime());
        assertEquals(proposedEnd, updatedEvent.getEndDateTime());
        assertNotEquals(originalStart, updatedEvent.getStartDateTime());

        // Verify invitation status changed to ACCEPTED
        Invitation updatedInvitation = invitationRepository.findById(testInvitation.getId()).orElseThrow();
        assertEquals(InvitationStatus.ACCEPTED, updatedInvitation.getStatus());
    }

    @Test
    public void testRejectProposal() {
        // Setup proposal
        testInvitation.setStatus(InvitationStatus.PROPOSED);
        testInvitation.setProposedStart(Instant.now().plus(8, ChronoUnit.DAYS));
        testInvitation.setProposedEnd(Instant.now().plus(8, ChronoUnit.DAYS).plus(1, ChronoUnit.HOURS));
        testInvitation = invitationRepository.save(testInvitation);

        Map<String, String> rejectionRequest = new HashMap<>();
        rejectionRequest.put("rejectionNote", "Original time works better");

        Instant originalStart = testEvent.getStartDateTime();

        // Organizer rejects the proposal
        given()
            .header("Authorization", "Bearer " + organizerToken)
            .contentType(ContentType.JSON)
            .body(rejectionRequest)
        .when()
            .post("/api/v1/invitations/" + testInvitation.getId() + "/reject-proposal")
        .then()
            .statusCode(200)
            .body("status", equalTo("DECLINED"));

        // Verify event time unchanged
        Event unchangedEvent = eventRepository.findById(testEvent.getId()).orElseThrow();
        assertEquals(originalStart, unchangedEvent.getStartDateTime());

        // Verify invitation status changed to DECLINED
        Invitation updatedInvitation = invitationRepository.findById(testInvitation.getId()).orElseThrow();
        assertEquals(InvitationStatus.DECLINED, updatedInvitation.getStatus());
    }

    @Test
    public void testSupersedingOtherProposals() {
        // Create second recipient with a proposal
        User recipient2 = new User();
        recipient2.setEmail("recipient2@example.com");
        recipient2.setDisplayName("Second Recipient");
        recipient2 = userRepository.save(recipient2);

        Invitation invitation2 = new Invitation();
        invitation2.setEvent(testEvent);
        invitation2.setRecipientEmail(recipient2.getEmail());
        invitation2.setStatus(InvitationStatus.PROPOSED);
        invitation2.setProposedStart(Instant.now().plus(9, ChronoUnit.DAYS));
        invitation2.setProposedEnd(Instant.now().plus(9, ChronoUnit.DAYS).plus(1, ChronoUnit.HOURS));
        invitation2 = invitationRepository.save(invitation2);

        // Setup first invitation as proposal
        testInvitation.setStatus(InvitationStatus.PROPOSED);
        testInvitation.setProposedStart(Instant.now().plus(8, ChronoUnit.DAYS));
        testInvitation.setProposedEnd(Instant.now().plus(8, ChronoUnit.DAYS).plus(1, ChronoUnit.HOURS));
        testInvitation = invitationRepository.save(testInvitation);

        // Organizer accepts first proposal
        given()
            .header("Authorization", "Bearer " + organizerToken)
        .when()
            .post("/api/v1/invitations/" + testInvitation.getId() + "/accept-proposal")
        .then()
            .statusCode(200);

        // Verify first invitation is ACCEPTED
        Invitation accepted = invitationRepository.findById(testInvitation.getId()).orElseThrow();
        assertEquals(InvitationStatus.ACCEPTED, accepted.getStatus());

        // Verify second invitation is SUPERSEDED
        Invitation superseded = invitationRepository.findById(invitation2.getId()).orElseThrow();
        assertEquals(InvitationStatus.SUPERSEDED, superseded.getStatus());
    }

    @Test
    public void testOnlyOrganizerCanAcceptProposal() {
        // Setup proposal
        testInvitation.setStatus(InvitationStatus.PROPOSED);
        testInvitation.setProposedStart(Instant.now().plus(8, ChronoUnit.DAYS));
        testInvitation.setProposedEnd(Instant.now().plus(8, ChronoUnit.DAYS).plus(1, ChronoUnit.HOURS));
        testInvitation = invitationRepository.save(testInvitation);

        // Recipient tries to accept their own proposal
        given()
            .header("Authorization", "Bearer " + recipientToken)
        .when()
            .post("/api/v1/invitations/" + testInvitation.getId() + "/accept-proposal")
        .then()
            .statusCode(400);
    }

    @Test
    public void testGetEventProposals() {
        // Create multiple proposals
        testInvitation.setStatus(InvitationStatus.PROPOSED);
        testInvitation.setProposedStart(Instant.now().plus(8, ChronoUnit.DAYS));
        testInvitation.setProposedEnd(Instant.now().plus(8, ChronoUnit.DAYS).plus(1, ChronoUnit.HOURS));
        invitationRepository.save(testInvitation);

        User recipient2 = new User();
        recipient2.setEmail("recipient2@example.com");
        recipient2 = userRepository.save(recipient2);

        Invitation invitation2 = new Invitation();
        invitation2.setEvent(testEvent);
        invitation2.setRecipientEmail(recipient2.getEmail());
        invitation2.setStatus(InvitationStatus.PROPOSED);
        invitation2.setProposedStart(Instant.now().plus(9, ChronoUnit.DAYS));
        invitation2.setProposedEnd(Instant.now().plus(9, ChronoUnit.DAYS).plus(1, ChronoUnit.HOURS));
        invitationRepository.save(invitation2);

        // Create one accepted invitation (should not be in proposals list)
        User recipient3 = new User();
        recipient3.setEmail("recipient3@example.com");
        recipient3 = userRepository.save(recipient3);

        Invitation invitation3 = new Invitation();
        invitation3.setEvent(testEvent);
        invitation3.setRecipientEmail(recipient3.getEmail());
        invitation3.setStatus(InvitationStatus.ACCEPTED);
        invitationRepository.save(invitation3);

        // Organizer gets proposals
        given()
            .header("Authorization", "Bearer " + organizerToken)
        .when()
            .get("/api/v1/events/" + testEvent.getId() + "/proposals")
        .then()
            .statusCode(200)
            .body("size()", equalTo(2))
            .body("[0].status", equalTo("PROPOSED"))
            .body("[1].status", equalTo("PROPOSED"));
    }

    @Test
    public void testNonOrganizerCannotGetProposals() {
        // Recipient tries to get proposals
        given()
            .header("Authorization", "Bearer " + recipientToken)
        .when()
            .get("/api/v1/events/" + testEvent.getId() + "/proposals")
        .then()
            .statusCode(403);
    }

    @Test
    public void testSummaryIncludesProposalCounts() {
        // Create various invitation states
        testInvitation.setStatus(InvitationStatus.PROPOSED);
        invitationRepository.save(testInvitation);

        User recipient2 = new User();
        recipient2.setEmail("recipient2@example.com");
        recipient2 = userRepository.save(recipient2);

        Invitation invitation2 = new Invitation();
        invitation2.setEvent(testEvent);
        invitation2.setRecipientEmail(recipient2.getEmail());
        invitation2.setStatus(InvitationStatus.ACCEPTED);
        invitationRepository.save(invitation2);

        User recipient3 = new User();
        recipient3.setEmail("recipient3@example.com");
        recipient3 = userRepository.save(recipient3);

        Invitation invitation3 = new Invitation();
        invitation3.setEvent(testEvent);
        invitation3.setRecipientEmail(recipient3.getEmail());
        invitation3.setStatus(InvitationStatus.SUPERSEDED);
        invitationRepository.save(invitation3);

        // Get summary
        given()
            .header("Authorization", "Bearer " + organizerToken)
        .when()
            .get("/api/v1/events/" + testEvent.getId() + "/invitations/summary")
        .then()
            .statusCode(200)
            .body("totalInvitations", equalTo(3))
            .body("acceptedCount", equalTo(1))
            .body("proposedCount", equalTo(1))
            .body("supersededCount", equalTo(1));
    }
}
