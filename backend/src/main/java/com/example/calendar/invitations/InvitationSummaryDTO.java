package com.example.calendar.invitations;

/**
 * DTO for invitation response summary
 */
public class InvitationSummaryDTO {
    
    private int totalInvitations;
    private int acceptedCount;
    private int declinedCount;
    private int pendingCount;
    private int proposedCount;
    private int supersededCount;
    
    public InvitationSummaryDTO() {
    }
    
    public InvitationSummaryDTO(int totalInvitations, int acceptedCount, int declinedCount, int pendingCount) {
        this.totalInvitations = totalInvitations;
        this.acceptedCount = acceptedCount;
        this.declinedCount = declinedCount;
        this.pendingCount = pendingCount;
        this.proposedCount = 0;
        this.supersededCount = 0;
    }
    
    public InvitationSummaryDTO(int totalInvitations, int acceptedCount, int declinedCount, 
                                 int pendingCount, int proposedCount, int supersededCount) {
        this.totalInvitations = totalInvitations;
        this.acceptedCount = acceptedCount;
        this.declinedCount = declinedCount;
        this.pendingCount = pendingCount;
        this.proposedCount = proposedCount;
        this.supersededCount = supersededCount;
    }
    
    public int getTotalInvitations() {
        return totalInvitations;
    }
    
    public void setTotalInvitations(int totalInvitations) {
        this.totalInvitations = totalInvitations;
    }
    
    public int getAcceptedCount() {
        return acceptedCount;
    }
    
    public void setAcceptedCount(int acceptedCount) {
        this.acceptedCount = acceptedCount;
    }
    
    public int getDeclinedCount() {
        return declinedCount;
    }
    
    public void setDeclinedCount(int declinedCount) {
        this.declinedCount = declinedCount;
    }
    
    public int getPendingCount() {
        return pendingCount;
    }
    
    public void setPendingCount(int pendingCount) {
        this.pendingCount = pendingCount;
    }
    
    public int getProposedCount() {
        return proposedCount;
    }
    
    public void setProposedCount(int proposedCount) {
        this.proposedCount = proposedCount;
    }
    
    public int getSupersededCount() {
        return supersededCount;
    }
    
    public void setSupersededCount(int supersededCount) {
        this.supersededCount = supersededCount;
    }
    
    public double getAcceptanceRate() {
        if (totalInvitations == 0) {
            return 0.0;
        }
        return (acceptedCount * 100.0) / totalInvitations;
    }
}
