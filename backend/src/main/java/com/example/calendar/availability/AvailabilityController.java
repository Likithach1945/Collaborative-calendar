package com.example.calendar.availability;

import com.example.calendar.auth.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for availability and meeting suggestions
 */
@RestController
@RequestMapping("/api/v1/availability")
public class AvailabilityController {
    
    private static final Logger logger = LoggerFactory.getLogger(AvailabilityController.class);
    
    @Autowired
    private AvailabilityService availabilityService;
    
    /**
     * Check availability of recipients for a specific proposed time
     * POST /api/v1/availability/check
     * 
     * Request body:
     * {
     *   "participantEmails": ["alice@example.com", "bob@example.com"],
     *   "startDateTime": "2025-10-20T14:00:00Z",
     *   "endDateTime": "2025-10-20T15:00:00Z"
     * }
     * 
     * @param checkRequest Request containing participants and proposed meeting time
     * @return List of AvailabilityDTO with availability status and conflicts for each recipient
     */
    @PostMapping("/check")
    public ResponseEntity<?> checkRecipientsAvailability(
            @RequestBody CheckAvailabilityRequest checkRequest) {
        
        try {
            // Validate input
            if (checkRequest.getParticipantEmails() == null || 
                checkRequest.getParticipantEmails().isEmpty()) {
                return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse("At least one participant email is required"));
            }
            
            if (checkRequest.getStartDateTime() == null || 
                checkRequest.getEndDateTime() == null) {
                return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse("Both start and end times are required"));
            }
            
            if (checkRequest.getEndDateTime().isBefore(checkRequest.getStartDateTime())) {
                return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse("End time must be after start time"));
            }
            
            // Check availability for each recipient
            List<AvailabilityDTO> availabilityList = 
                availabilityService.checkParticipantsAvailability(
                    checkRequest.getStartDateTime(),
                    checkRequest.getEndDateTime(),
                    checkRequest.getParticipantEmails()
                );
            
            // Debug logging for response
            CheckAvailabilityResponse response = new CheckAvailabilityResponse(availabilityList);
            logger.info("🔄 API Response: {}", response);
            for (AvailabilityDTO dto : availabilityList) {
                logger.info("🔄 DTO - Email: {}, Available: {}", dto.getParticipantEmail(), dto.isAvailable());
            }
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                .badRequest()
                .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * DEBUG: Simple test endpoint to verify JSON serialization
     */
    @GetMapping("/debug")
    public ResponseEntity<CheckAvailabilityResponse> debugAvailability() {
        List<AvailabilityDTO> testList = List.of(
            new AvailabilityDTO("test@example.com", "Test User", true, List.of(), List.of())
        );
        CheckAvailabilityResponse response = new CheckAvailabilityResponse(testList);
        logger.info("🔧 Debug endpoint - returning: {}", response);
        return ResponseEntity.ok(response);
    }

    /**
     * Find available time slots for a meeting
     * POST /api/v1/availability
     * 
     * @param request Request containing participants, date range, and duration
     * @param user Authenticated user
     * @return List of suggested time slots
     */
    @PostMapping
    public ResponseEntity<?> findAvailability(
            @RequestBody AvailabilityRequestDTO request,
            @AuthenticationPrincipal User user) {
        
        try {
            List<AvailabilitySlotDTO> suggestions = 
                availabilityService.findAvailableSlots(request, user);
            
            if (suggestions.isEmpty()) {
                // No common slots found - return 422 Unprocessable Entity
                return ResponseEntity
                    .status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(new ErrorResponse("No available time slots found for all participants"));
            }
            
            return ResponseEntity.ok(new AvailabilityResponseDTO(suggestions));
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                .badRequest()
                .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Response wrapper for availability suggestions
     */
    public static class AvailabilityResponseDTO {
        private List<AvailabilitySlotDTO> suggestions;
        
        public AvailabilityResponseDTO(List<AvailabilitySlotDTO> suggestions) {
            this.suggestions = suggestions;
        }
        
        public List<AvailabilitySlotDTO> getSuggestions() {
            return suggestions;
        }
        
        public void setSuggestions(List<AvailabilitySlotDTO> suggestions) {
            this.suggestions = suggestions;
        }
    }
    
    /**
     * Error response wrapper
     */
    public static class ErrorResponse {
        private String error;
        
        public ErrorResponse(String error) {
            this.error = error;
        }
        
        public String getError() {
            return error;
        }
        
        public void setError(String error) {
            this.error = error;
        }
    }
    
    /**
     * Request class for checking availability at a specific time
     */
    public static class CheckAvailabilityRequest {
        private List<String> participantEmails;
        private java.time.Instant startDateTime;
        private java.time.Instant endDateTime;
        
        public CheckAvailabilityRequest() {
        }
        
        public CheckAvailabilityRequest(List<String> participantEmails, 
                                       java.time.Instant startDateTime,
                                       java.time.Instant endDateTime) {
            this.participantEmails = participantEmails;
            this.startDateTime = startDateTime;
            this.endDateTime = endDateTime;
        }
        
        public List<String> getParticipantEmails() {
            return participantEmails;
        }
        
        public void setParticipantEmails(List<String> participantEmails) {
            this.participantEmails = participantEmails;
        }
        
        public java.time.Instant getStartDateTime() {
            return startDateTime;
        }
        
        public void setStartDateTime(java.time.Instant startDateTime) {
            this.startDateTime = startDateTime;
        }
        
        public java.time.Instant getEndDateTime() {
            return endDateTime;
        }
        
        public void setEndDateTime(java.time.Instant endDateTime) {
            this.endDateTime = endDateTime;
        }
    }
    
    /**
     * Get suggested collaborators for the current user
     * Returns team members/colleagues that the user frequently collaborates with
     * GET /api/v1/availability/collaborators
     * 
     * @param user Authenticated user
     * @return List of suggested collaborators with their details
     */
    @GetMapping("/collaborators")
    public ResponseEntity<?> getSuggestedCollaborators(
            @AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("User not authenticated"));
            }
            
            List<CollaboratorDTO> collaborators = 
                availabilityService.getSuggestedCollaborators(user.getId(), 20);
            
            return ResponseEntity.ok(new CollaboratorsResponse(collaborators));
            
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Error retrieving collaborators: " + e.getMessage()));
        }
    }
    
    /**
     * Response wrapper for collaborators list
     */
    public static class CollaboratorsResponse {
        private List<CollaboratorDTO> collaborators;
        
        public CollaboratorsResponse(List<CollaboratorDTO> collaborators) {
            this.collaborators = collaborators;
        }
        
        public List<CollaboratorDTO> getCollaborators() {
            return collaborators;
        }
        
        public void setCollaborators(List<CollaboratorDTO> collaborators) {
            this.collaborators = collaborators;
        }
    }
    
    /**
     * Response wrapper for availability check results
     */
    public static class CheckAvailabilityResponse {
        private List<AvailabilityDTO> availabilities;
        
        public CheckAvailabilityResponse(List<AvailabilityDTO> availabilities) {
            this.availabilities = availabilities;
        }
        
        public List<AvailabilityDTO> getAvailabilities() {
            return availabilities;
        }
        
        public void setAvailabilities(List<AvailabilityDTO> availabilities) {
            this.availabilities = availabilities;
        }
    }
}
