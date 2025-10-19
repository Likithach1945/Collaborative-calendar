package com.example.calendar.invitations;

import com.example.calendar.auth.User;
import com.example.calendar.events.EventService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/invitations")
public class InvitationController {
    
    private static final Logger logger = LoggerFactory.getLogger(InvitationController.class);
    
    @Autowired
    private InvitationService invitationService;
    
    @Autowired
    private InvitationMapper invitationMapper;

    @Autowired
    private EventService eventService;
    
    /**
     * Respond to an invitation (accept/decline)
     * PATCH /api/v1/invitations/{id}
     */
    @PatchMapping("/{id}")
    public ResponseEntity<?> respondToInvitation(
            @PathVariable UUID id,
            @Valid @RequestBody InvitationResponseDTO response,
        @RequestParam(required = false) String viewerTimezone,
        @RequestHeader(value = "X-User-Timezone", required = false) String viewerTimezoneHeader,
            @AuthenticationPrincipal User user) {
        
        logger.info("Invitation response request: id={}, user={}, status={}", 
                id, user.getEmail(), response.getStatus());
        
        try {
            String requestedTimezone = viewerTimezone != null ? viewerTimezone : viewerTimezoneHeader;
            String effectiveTimezone = eventService.resolveViewerTimezone(requestedTimezone, user);

            Invitation invitation = invitationService.respondToInvitation(id, user, response);
            InvitationDTO dto = invitationMapper.toDTO(invitation);
            if (dto.getEvent() != null) {
                dto.setEvent(eventService.localizeEventForViewer(dto.getEvent(), effectiveTimezone));
            }
            
            return ResponseEntity.ok(dto);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid invitation response: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error responding to invitation {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to process invitation response"));
        }
    }
    
    /**
     * Get all invitations for the authenticated user
     * GET /api/v1/invitations
     */
    @GetMapping
    public ResponseEntity<List<InvitationDTO>> getUserInvitations(
            @AuthenticationPrincipal User user,
        @RequestParam(required = false) InvitationStatus status,
        @RequestParam(required = false) String viewerTimezone,
        @RequestHeader(value = "X-User-Timezone", required = false) String viewerTimezoneHeader) {
        
        // Temporary fix for authentication issues during debugging
        if (user == null) {
            logger.warn("No authenticated user found, returning empty invitation list for debugging");
            return ResponseEntity.ok(new ArrayList<>());
        }
        
        logger.info("Get invitations for user {}, status={}", user.getEmail(), status);
        
        List<Invitation> invitations;
        if (status != null) {
            invitations = invitationService.getUserInvitationsByStatus(user, status);
        } else {
            invitations = invitationService.getUserInvitations(user);
        }
        
        String requestedTimezone = viewerTimezone != null ? viewerTimezone : viewerTimezoneHeader;
        String effectiveTimezone = eventService.resolveViewerTimezone(requestedTimezone, user);

        List<InvitationDTO> dtos = invitations.stream()
                .map(invitationMapper::toDTO)
                .peek(dto -> {
                    if (dto.getEvent() != null) {
                        dto.setEvent(eventService.localizeEventForViewer(dto.getEvent(), effectiveTimezone));
                    }
                })
                .toList();
        
        return ResponseEntity.ok(dtos);
    }
    
    // Event invitation endpoints moved to EventInvitationsController for proper path mapping
    
    /**
     * Accept a time proposal (T080)
     * POST /api/v1/invitations/{id}/accept-proposal
     */
    @PostMapping("/{id}/accept-proposal")
    public ResponseEntity<?> acceptProposal(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        
        String userEmail = (user != null) ? user.getEmail() : "anonymous";
        logger.info("Accept proposal request: invitation={}, user={}", id, userEmail);
        
        try {
            invitationService.acceptProposal(id, user);
            return ResponseEntity.ok().body(new SuccessResponse("Proposal accepted and event time updated"));
            
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to accept proposal: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error accepting proposal", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to accept proposal"));
        }
    }
    
    /**
     * Reject a time proposal (T080)
     * POST /api/v1/invitations/{id}/reject-proposal
     */
    @PostMapping("/{id}/reject-proposal")
    public ResponseEntity<?> rejectProposal(
            @PathVariable UUID id,
            @RequestBody(required = false) ProposalRejectionDTO rejectionDTO,
        @RequestParam(required = false) String viewerTimezone,
        @RequestHeader(value = "X-User-Timezone", required = false) String viewerTimezoneHeader,
            @AuthenticationPrincipal User user) {
        
        String userEmail = (user != null) ? user.getEmail() : "anonymous";
        logger.info("Reject proposal request: invitation={}, user={}", id, userEmail);
        
        try {
            String note = rejectionDTO != null ? rejectionDTO.getRejectionNote() : null;
            String requestedTimezone = viewerTimezone != null ? viewerTimezone : viewerTimezoneHeader;
            String effectiveTimezone = eventService.resolveViewerTimezone(requestedTimezone, user);

            Invitation invitation = invitationService.rejectProposal(id, user, note);
            InvitationDTO dto = invitationMapper.toDTO(invitation);
            if (dto.getEvent() != null) {
                dto.setEvent(eventService.localizeEventForViewer(dto.getEvent(), effectiveTimezone));
            }
            
            return ResponseEntity.ok(dto);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to reject proposal: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error rejecting proposal", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to reject proposal"));
        }
    }
    
    // Event proposals endpoint moved to EventInvitationsController for proper path mapping
    
    // DTOs
    @SuppressWarnings("unused")
    private static class ErrorResponse {
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
    
    @SuppressWarnings("unused")
    private static class SuccessResponse {
        private String message;
        
        public SuccessResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
    }
    
    @SuppressWarnings("unused")
    private static class ProposalRejectionDTO {
        private String rejectionNote;
        
        public String getRejectionNote() {
            return rejectionNote;
        }
        
        public void setRejectionNote(String rejectionNote) {
            this.rejectionNote = rejectionNote;
        }
    }
}
