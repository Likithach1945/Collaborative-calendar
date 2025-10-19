package com.example.calendar.invitations;

import com.example.calendar.events.EventDTO;
import java.time.Instant;
import java.util.UUID;

public class InvitationDTO {
    private UUID id;
    private UUID eventId;
    private EventDTO event; // Include full event details
    private String recipientEmail;
    private InvitationStatus status;
    private Instant proposedStart;
    private Instant proposedEnd;
    private String responseNote;
    private Instant respondedAt;
    private Instant createdAt;
    private Instant updatedAt;

    public InvitationDTO() {
    }

    public InvitationDTO(UUID id, UUID eventId, String recipientEmail, InvitationStatus status,
                         Instant proposedStart, Instant proposedEnd, String responseNote,
                         Instant respondedAt, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.eventId = eventId;
        this.recipientEmail = recipientEmail;
        this.status = status;
        this.proposedStart = proposedStart;
        this.proposedEnd = proposedEnd;
        this.responseNote = responseNote;
        this.respondedAt = respondedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getEventId() {
        return eventId;
    }

    public void setEventId(UUID eventId) {
        this.eventId = eventId;
    }

    public EventDTO getEvent() {
        return event;
    }

    public void setEvent(EventDTO event) {
        this.event = event;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public InvitationStatus getStatus() {
        return status;
    }

    public void setStatus(InvitationStatus status) {
        this.status = status;
    }

    public Instant getProposedStart() {
        return proposedStart;
    }

    public void setProposedStart(Instant proposedStart) {
        this.proposedStart = proposedStart;
    }

    public Instant getProposedEnd() {
        return proposedEnd;
    }

    public void setProposedEnd(Instant proposedEnd) {
        this.proposedEnd = proposedEnd;
    }

    public String getResponseNote() {
        return responseNote;
    }

    public void setResponseNote(String responseNote) {
        this.responseNote = responseNote;
    }

    public Instant getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(Instant respondedAt) {
        this.respondedAt = respondedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
