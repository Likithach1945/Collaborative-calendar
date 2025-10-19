package com.example.calendar.events;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class EventDTO {
    private UUID id;
    private UUID organizerId;
    private String organizerEmail;
    private String organizerName;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotNull(message = "Start date and time is required")
    private Instant startDateTime;
    
    @NotNull(message = "End date and time is required")
    private Instant endDateTime;
    
    @NotBlank(message = "Timezone is required")
    private String timezone;
    
    private String recurrenceRule;
    private String videoConferenceLink;
    private String location;
    private List<@Email(message = "Invalid email address") String> participants; // List of participant email addresses
    private Instant createdAt;
    private Instant updatedAt;
    private String viewerTimezone;
    private String startDateTimeLocalized;
    private String endDateTimeLocalized;

    public EventDTO() {
    }

    public EventDTO(UUID id, UUID organizerId, String organizerEmail, String organizerName, 
                    String title, String description, 
                    Instant startDateTime, Instant endDateTime, String timezone, 
                    String recurrenceRule, String videoConferenceLink, String location,
                    List<String> participants, Instant createdAt, Instant updatedAt,
                    String viewerTimezone, String startDateTimeLocalized, String endDateTimeLocalized) {
        this.id = id;
        this.organizerId = organizerId;
        this.organizerEmail = organizerEmail;
        this.organizerName = organizerName;
        this.title = title;
        this.description = description;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.timezone = timezone;
        this.recurrenceRule = recurrenceRule;
        this.videoConferenceLink = videoConferenceLink;
        this.location = location;
        this.participants = participants;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.viewerTimezone = viewerTimezone;
        this.startDateTimeLocalized = startDateTimeLocalized;
        this.endDateTimeLocalized = endDateTimeLocalized;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getOrganizerId() {
        return organizerId;
    }

    public void setOrganizerId(UUID organizerId) {
        this.organizerId = organizerId;
    }

    public String getOrganizerEmail() {
        return organizerEmail;
    }

    public void setOrganizerEmail(String organizerEmail) {
        this.organizerEmail = organizerEmail;
    }

    public String getOrganizerName() {
        return organizerName;
    }

    public void setOrganizerName(String organizerName) {
        this.organizerName = organizerName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getRecurrenceRule() {
        return recurrenceRule;
    }

    public void setRecurrenceRule(String recurrenceRule) {
        this.recurrenceRule = recurrenceRule;
    }

    public String getVideoConferenceLink() {
        return videoConferenceLink;
    }

    public void setVideoConferenceLink(String videoConferenceLink) {
        this.videoConferenceLink = videoConferenceLink;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<String> getParticipants() {
        return participants;
    }

    public void setParticipants(List<String> participants) {
        this.participants = participants;
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

    public String getViewerTimezone() {
        return viewerTimezone;
    }

    public void setViewerTimezone(String viewerTimezone) {
        this.viewerTimezone = viewerTimezone;
    }

    public String getStartDateTimeLocalized() {
        return startDateTimeLocalized;
    }

    public void setStartDateTimeLocalized(String startDateTimeLocalized) {
        this.startDateTimeLocalized = startDateTimeLocalized;
    }

    public String getEndDateTimeLocalized() {
        return endDateTimeLocalized;
    }

    public void setEndDateTimeLocalized(String endDateTimeLocalized) {
        this.endDateTimeLocalized = endDateTimeLocalized;
    }
}
