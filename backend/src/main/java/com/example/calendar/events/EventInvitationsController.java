package com.example.calendar.events;

import com.example.calendar.auth.User;
import com.example.calendar.invitations.Invitation;
import com.example.calendar.invitations.InvitationDTO;
import com.example.calendar.invitations.InvitationMapper;
import com.example.calendar.invitations.InvitationService;
import com.example.calendar.invitations.InvitationSummaryDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for handling event invitations with proper path mappings.
 * This is separate from InvitationController to ensure correct routing.
 */
@RestController
@RequestMapping("/api/v1/events")
public class EventInvitationsController {

    private static final Logger logger = LoggerFactory.getLogger(EventInvitationsController.class);
    
    @Autowired
    private InvitationService invitationService;
    
    @Autowired
    private InvitationMapper invitationMapper;
    
    /**
     * Get all invitations for a specific event
     * GET /api/v1/events/{eventId}/invitations
     */
    @GetMapping("/{eventId}/invitations")
    public ResponseEntity<?> getEventInvitations(
            @PathVariable UUID eventId,
            @AuthenticationPrincipal User user) {
        
        String userEmail = (user != null) ? user.getEmail() : "anonymous";
        logger.info("Get invitations for event {}, user={}", eventId, userEmail);
        
        try {
            List<Invitation> invitations = invitationService.getEventInvitations(eventId, user);
            List<InvitationDTO> dtos = invitations.stream()
                    .map(invitationMapper::toDTO)
                    .toList();
            
            return ResponseEntity.ok(dtos);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Get invitation response summary for an event
     * GET /api/v1/events/{eventId}/invitations/summary
     */
    @GetMapping("/{eventId}/invitations/summary")
    public ResponseEntity<?> getEventInvitationSummary(
            @PathVariable UUID eventId,
            @AuthenticationPrincipal User user) {
        
        String userEmail = (user != null) ? user.getEmail() : "anonymous";
        logger.info("Get invitation summary for event {}, user={}", eventId, userEmail);
        
        try {
            InvitationSummaryDTO summary = invitationService.getEventInvitationSummary(eventId, user);
            return ResponseEntity.ok(summary);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Get all proposals for an event (organizer view)
     * GET /api/v1/events/{eventId}/proposals
     */
    @GetMapping("/{eventId}/proposals")
    public ResponseEntity<?> getEventProposals(
            @PathVariable UUID eventId,
            @AuthenticationPrincipal User user) {
        
        String userEmail = (user != null) ? user.getEmail() : "anonymous";
        logger.info("Get event proposals request: eventId={}, user={}", eventId, userEmail);
        
        try {
            List<Invitation> proposals = invitationService.getEventProposals(eventId, user);
            List<InvitationDTO> dtos = proposals.stream()
                    .map(invitationMapper::toDTO)
                    .toList();
            
            return ResponseEntity.ok(dtos);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to get event proposals: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error getting event proposals", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to get event proposals"));
        }
    }
    
    // ErrorResponse inner class
    private static class ErrorResponse {
        private final String error;
        
        public ErrorResponse(String error) {
            this.error = error;
        }
        
        // Jackson requires a getter
        public String getError() {
            return error;
        }
    }
}