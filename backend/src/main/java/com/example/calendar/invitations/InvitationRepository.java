package com.example.calendar.invitations;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, UUID> {
    
    List<Invitation> findByEventId(UUID eventId);
    
    List<Invitation> findByRecipientEmail(String recipientEmail);
    
    List<Invitation> findByStatus(InvitationStatus status);
    
    List<Invitation> findByEventIdAndRecipientEmail(UUID eventId, String recipientEmail);
    
    /**
     * Find invitations by recipient email and status
     * Used for fetching events where the user is invited and has accepted
     */
    List<Invitation> findByRecipientEmailAndStatus(String recipientEmail, InvitationStatus status);
}
