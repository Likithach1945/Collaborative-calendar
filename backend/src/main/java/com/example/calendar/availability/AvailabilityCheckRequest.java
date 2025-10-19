package com.example.calendar.availability;

import java.time.Instant;
import java.util.List;

/**
 * Request DTO for checking participant availability
 */
public class AvailabilityCheckRequest {
    private Instant startDateTime;
    private Instant endDateTime;
    private List<String> participantEmails;

    public AvailabilityCheckRequest() {
    }

    public AvailabilityCheckRequest(Instant startDateTime, Instant endDateTime, List<String> participantEmails) {
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.participantEmails = participantEmails;
    }

    public Instant getStartDateTime() {
        return startDateTime;
    }

    public void setStartDateTime(Instant startDateTime) {
        this.startDateTime = startDateTime;
    }

    public Instant getEndDateTime() {
        return endDateTime;
    }

    public void setEndDateTime(Instant endDateTime) {
        this.endDateTime = endDateTime;
    }

    public List<String> getParticipantEmails() {
        return participantEmails;
    }

    public void setParticipantEmails(List<String> participantEmails) {
        this.participantEmails = participantEmails;
    }
}
