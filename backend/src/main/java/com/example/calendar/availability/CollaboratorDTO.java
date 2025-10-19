package com.example.calendar.availability;

/**
 * Data Transfer Object for suggested collaborators
 */
public class CollaboratorDTO {
    private String email;
    private String displayName;
    private String timezone;
    private Integer collaborationCount;  // Number of times collaborated

    public CollaboratorDTO() {}

    public CollaboratorDTO(String email, String displayName, String timezone, Integer collaborationCount) {
        this.email = email;
        this.displayName = displayName;
        this.timezone = timezone;
        this.collaborationCount = collaborationCount;
    }

    // Getters and Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public Integer getCollaborationCount() {
        return collaborationCount;
    }

    public void setCollaborationCount(Integer collaborationCount) {
        this.collaborationCount = collaborationCount;
    }
}
