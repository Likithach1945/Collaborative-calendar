package com.example.calendar.availability;

import java.time.Instant;
import java.util.List;

/**
 * DTO for requesting availability suggestions
 */
public class AvailabilityRequestDTO {
    
    private List<String> participantEmails;
    private Instant startRange;
    private Instant endRange;
    private Integer durationMinutes;
    
    public AvailabilityRequestDTO() {
    }
    
    public AvailabilityRequestDTO(List<String> participantEmails, Instant startRange, 
                                  Instant endRange, Integer durationMinutes) {
        this.participantEmails = participantEmails;
        this.startRange = startRange;
        this.endRange = endRange;
        this.durationMinutes = durationMinutes;
    }
    
    public List<String> getParticipantEmails() {
        return participantEmails;
    }
    
    public void setParticipantEmails(List<String> participantEmails) {
        this.participantEmails = participantEmails;
    }
    
    public Instant getStartRange() {
        return startRange;
    }
    
    public void setStartRange(Instant startRange) {
        this.startRange = startRange;
    }
    
    public Instant getEndRange() {
        return endRange;
    }
    
    public void setEndRange(Instant endRange) {
        this.endRange = endRange;
    }
    
    public Integer getDurationMinutes() {
        return durationMinutes;
    }
    
    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
}
