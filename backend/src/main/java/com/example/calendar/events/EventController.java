package com.example.calendar.events;

import com.example.calendar.auth.User;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    @Autowired
    private EventService eventService;

    /**
     * List events within a date range
     * GET /api/v1/events?start=2023-01-01T00:00:00Z&end=2023-12-31T23:59:59Z&includeInvitations=true
     */
    @GetMapping
    public ResponseEntity<List<EventDTO>> listEvents(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant end,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate day,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate week,
            @RequestParam(required = false, defaultValue = "false") boolean includeInvitations,
            @RequestParam(required = false) String viewerTimezone,
            @RequestHeader(value = "X-User-Timezone", required = false) String viewerTimezoneHeader,
            @AuthenticationPrincipal User user) {

        // For testing purposes - use a default test user if no authentication
        if (user == null) {
            user = eventService.getTestUser();
        }

    String requestedTimezone = viewerTimezone != null ? viewerTimezone : viewerTimezoneHeader;
    String effectiveTimezone = eventService.resolveViewerTimezone(requestedTimezone, user);
    
    // Log timezone resolution for debugging
    System.out.println("LIST events - query param: " + viewerTimezone + ", header: " + viewerTimezoneHeader + ", effective: " + effectiveTimezone);

        List<EventDTO> events;

        if (day != null) {
            // Get events for a specific day
            events = eventService.getEventsByDay(user, day, includeInvitations, effectiveTimezone);
        } else if (week != null) {
            // Get events for a specific week
            events = eventService.getEventsByWeek(user, week, includeInvitations, effectiveTimezone);
        } else if (start != null && end != null) {
            // Get events within a date range
            events = eventService.getEventsByDateRange(user, start, end, includeInvitations, effectiveTimezone);
        } else {
            // Get all events
            events = eventService.getAllEvents(user, includeInvitations, effectiveTimezone);
        }

        return ResponseEntity.ok(events);
    }

    /**
     * Get a single event by ID
     * GET /api/v1/events/{eventId}
     */
    @GetMapping("/{eventId}")
    public ResponseEntity<EventDTO> getEvent(
            @PathVariable UUID eventId,
        @RequestParam(required = false) String viewerTimezone,
        @RequestHeader(value = "X-User-Timezone", required = false) String viewerTimezoneHeader,
            @AuthenticationPrincipal User user) {
        
        // For testing purposes - use a default test user if no authentication
        if (user == null) {
            user = eventService.getTestUser();
        }
        
    String requestedTimezone = viewerTimezone != null ? viewerTimezone : viewerTimezoneHeader;
    String effectiveTimezone = eventService.resolveViewerTimezone(requestedTimezone, user);
    
    // Log timezone resolution for debugging
    System.out.println("GET event " + eventId + " - query param: " + viewerTimezone + ", header: " + viewerTimezoneHeader + ", effective: " + effectiveTimezone);
    
        EventDTO event = eventService.getEventById(eventId, user, effectiveTimezone);
        System.out.println("GET event " + eventId + " - returned viewerTimezone: " + event.getViewerTimezone());
        return ResponseEntity.ok(event);
    }

    /**
     * Create a new event
     * POST /api/v1/events
     */
    @PostMapping
    public ResponseEntity<EventDTO> createEvent(
            @Valid @RequestBody EventDTO eventDTO,
            @AuthenticationPrincipal User user) {
        
        // For testing purposes - use a default test user if no authentication
        if (user == null) {
            user = eventService.getTestUser();
        }
        
        // Log timezone information for debugging
        System.out.println("Event creation - timezone from request: " + eventDTO.getTimezone());
        System.out.println("Event creation - user timezone: " + user.getTimezone());
        
        EventDTO createdEvent = eventService.createEvent(eventDTO, user);
        
        // Log the result
        System.out.println("Event creation - timezone in created event: " + createdEvent.getTimezone());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
    }

    /**
     * Update an existing event
     * PATCH /api/v1/events/{eventId}
     */
    @PatchMapping("/{eventId}")
    public ResponseEntity<EventDTO> updateEvent(
            @PathVariable UUID eventId,
            @Valid @RequestBody EventDTO eventDTO,
            @AuthenticationPrincipal User user) {

        if (user == null) {
            user = eventService.getTestUser();
        }
        
        EventDTO updatedEvent = eventService.updateEvent(eventId, eventDTO, user);
        return ResponseEntity.ok(updatedEvent);
    }

    /**
     * Delete an event
     * DELETE /api/v1/events/{eventId}
     */
    @DeleteMapping("/{eventId}")
    public ResponseEntity<?> deleteEvent(
            @PathVariable UUID eventId,
            @AuthenticationPrincipal User user) {
        
        try {
            // For testing purposes - use a default test user if no authentication
            if (user == null) {
                user = eventService.getTestUser();
            }
            
            eventService.deleteEvent(eventId, user);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            // Log the error details
            System.err.println("Error deleting event: " + e.getMessage());
            e.printStackTrace();
            
            // Return a meaningful error response
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Error deleting event: " + e.getMessage()));
        }
    }
    
    /**
     * Simple error response class
     */
    private static class ErrorResponse {
        private final String message;
        
        public ErrorResponse(String message) {
            this.message = message;
        }
        
        @SuppressWarnings("unused")
        public String getMessage() {
            return message;
        }
    }
}
