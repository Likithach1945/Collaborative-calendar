package com.example.calendar.availability;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.Collections;
import java.util.List;

/**
 * DTO for representing a participant's availability for a proposed meeting time
 */
public class AvailabilityDTO {
    private String participantEmail;
    private String participantName;
    @JsonProperty("isAvailable")
    private boolean isAvailable;
    private List<ConflictDTO> conflicts; // List of conflicting events
    @JsonProperty("suggestedSlots")
    private List<AvailabilitySlotDTO> suggestedSlots;
    private boolean userFound = true;

    public AvailabilityDTO() {
    }

    public AvailabilityDTO(String participantEmail, String participantName, 
                          boolean isAvailable, List<ConflictDTO> conflicts) {
        this(participantEmail, participantName, isAvailable, conflicts, Collections.emptyList());
    }

    public AvailabilityDTO(String participantEmail, String participantName,
                           boolean isAvailable, List<ConflictDTO> conflicts,
                           List<AvailabilitySlotDTO> suggestedSlots) {
        this.participantEmail = participantEmail;
        this.participantName = participantName;
        this.isAvailable = isAvailable;
        this.conflicts = conflicts;
        this.suggestedSlots = suggestedSlots != null ? suggestedSlots : Collections.emptyList();
        this.userFound = true;
    }

    public boolean isUserFound() {
        return userFound;
    }

    public void setUserFound(boolean userFound) {
        this.userFound = userFound;
    }

    public String getParticipantEmail() {
        return participantEmail;
    }

    public void setParticipantEmail(String participantEmail) {
        this.participantEmail = participantEmail;
    }

    public String getParticipantName() {
        return participantName;
    }

    public void setParticipantName(String participantName) {
        this.participantName = participantName;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }

    public List<ConflictDTO> getConflicts() {
        return conflicts;
    }

    public void setConflicts(List<ConflictDTO> conflicts) {
        this.conflicts = conflicts != null ? conflicts : Collections.emptyList();
    }

    public List<AvailabilitySlotDTO> getSuggestedSlots() {
        return suggestedSlots;
    }

    public void setSuggestedSlots(List<AvailabilitySlotDTO> suggestedSlots) {
        this.suggestedSlots = suggestedSlots != null ? suggestedSlots : Collections.emptyList();
    }

    /**
     * Inner class representing a conflicting event
     */
    public static class ConflictDTO {
        private String title;
        private Instant startDateTime;
        private Instant endDateTime;
        private String location;

        public ConflictDTO() {
        }

        public ConflictDTO(String title, Instant startDateTime, Instant endDateTime, String location) {
            this.title = title;
            this.startDateTime = startDateTime;
            this.endDateTime = endDateTime;
            this.location = location;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
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

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }
    }
}
