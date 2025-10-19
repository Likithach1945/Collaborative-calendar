package com.example.calendar.invitations;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

/**
 * DTO for responding to an invitation (accept/decline/propose)
 */
public class InvitationResponseDTO {
    
    @NotNull(message = "Status is required")
    private InvitationStatus status;
    
    private String responseNote;
    
    // For PROPOSED status: alternative time suggestion
    private Instant proposedStart;
    private Instant proposedEnd;
    
    public InvitationResponseDTO() {
    }
    
    public InvitationResponseDTO(InvitationStatus status, String responseNote) {
        this.status = status;
        this.responseNote = responseNote;
    }
    
    public InvitationResponseDTO(InvitationStatus status, String responseNote, 
                                  Instant proposedStart, Instant proposedEnd) {
        this.status = status;
        this.responseNote = responseNote;
        this.proposedStart = proposedStart;
        this.proposedEnd = proposedEnd;
    }
    
    public InvitationStatus getStatus() {
        return status;
    }
    
    public void setStatus(InvitationStatus status) {
        this.status = status;
    }
    
    public String getResponseNote() {
        return responseNote;
    }
    
    public void setResponseNote(String responseNote) {
        this.responseNote = responseNote;
    }
    
    public Instant getProposedStart() {
        return proposedStart;
    }
    
    public void setProposedStart(Instant proposedStart) {
        this.proposedStart = proposedStart;
    }
    
    public Instant getProposedEnd() {
        return proposedEnd;
    }
    
    public void setProposedEnd(Instant proposedEnd) {
        this.proposedEnd = proposedEnd;
    }
    
    /**
     * Validates that proposal fields are provided when status is PROPOSED
     */
    public boolean isValid() {
        if (status == InvitationStatus.PROPOSED) {
            if (proposedStart == null || proposedEnd == null) {
                return false;
            }
            if (!proposedEnd.isAfter(proposedStart)) {
                return false;
            }
        }
        // For ACCEPTED/DECLINED, proposal fields should not be set
        if ((status == InvitationStatus.ACCEPTED || status == InvitationStatus.DECLINED) 
            && (proposedStart != null || proposedEnd != null)) {
            return false;
        }
        return true;
    }
}
