package com.example.calendar.availability;

import java.time.Instant;

/**
 * DTO representing an available time slot for a meeting
 */
public class AvailabilitySlotDTO {
    
    private Instant startTime;
    private Instant endTime;
    private double score; // Higher score = better time slot
    
    public AvailabilitySlotDTO() {
    }
    
    public AvailabilitySlotDTO(Instant startTime, Instant endTime, double score) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.score = score;
    }
    
    public Instant getStartTime() {
        return startTime;
    }
    
    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }
    
    public Instant getEndTime() {
        return endTime;
    }
    
    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }
    
    public double getScore() {
        return score;
    }
    
    public void setScore(double score) {
        this.score = score;
    }
}
