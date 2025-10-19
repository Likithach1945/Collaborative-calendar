package com.example.calendar.invitations;

import com.example.calendar.auth.User;
import com.example.calendar.events.Event;
import com.example.calendar.events.EventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class InvitationService {
    
    private static final Logger logger = LoggerFactory.getLogger(InvitationService.class);
    
    @Autowired
    private InvitationRepository invitationRepository;
    
    @Autowired
    private EventRepository eventRepository;
    
    /**
     * Respond to an invitation (accept/decline/propose)
     */
    @Transactional
    @CacheEvict(value = {"invitations", "events"}, allEntries = true)
    public Invitation respondToInvitation(UUID invitationId, User user, InvitationResponseDTO response) {
        logger.info("User {} responding to invitation {}: {}", 
                user.getEmail(), invitationId, response.getStatus());
        
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new IllegalArgumentException("Invitation not found"));
        
        // Verify the user is the recipient
        if (!invitation.getRecipientEmail().equalsIgnoreCase(user.getEmail())) {
            throw new IllegalArgumentException("User is not the recipient of this invitation");
        }
        
        // Validate response DTO
        if (!response.isValid()) {
            throw new IllegalArgumentException("Invalid response: " + 
                (response.getStatus() == InvitationStatus.PROPOSED 
                    ? "Proposed start/end times required and must be valid"
                    : "Proposal fields should not be set for accept/decline"));
        }
        
        // Validate status transition
        InvitationStatus newStatus = response.getStatus();
        if (newStatus != InvitationStatus.ACCEPTED 
            && newStatus != InvitationStatus.DECLINED
            && newStatus != InvitationStatus.PROPOSED) {
            throw new IllegalArgumentException("Invalid status. Must be ACCEPTED, DECLINED, or PROPOSED");
        }
        
        // Update invitation
        invitation.setStatus(newStatus);
        invitation.setResponseNote(response.getResponseNote());
        invitation.setRespondedAt(Instant.now());
        
        // For proposals, update the proposed time fields
        if (newStatus == InvitationStatus.PROPOSED) {
            invitation.setProposedStart(response.getProposedStart());
            invitation.setProposedEnd(response.getProposedEnd());
            logger.info("Time proposal: {} to {}", response.getProposedStart(), response.getProposedEnd());
        }
        
        invitation = invitationRepository.save(invitation);
        
        logger.info("Invitation {} response saved: {} by {}", 
                invitationId, newStatus, user.getEmail());
        
        return invitation;
    }
    
    /**
     * Get all invitations for an event
     */
    @Cacheable(value = "invitations", key = "'event_' + #eventId")
    public List<Invitation> getEventInvitations(UUID eventId, User user) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        
        // Verify user is the organizer (skip check if user is null for debugging)
        if (user != null && !event.getOrganizer().getId().equals(user.getId())) {
            throw new IllegalArgumentException("User is not the organizer of this event");
        }
        
        return invitationRepository.findByEventId(eventId);
    }
    
    /**
     * Get invitation response summary for an event
     */
    public InvitationSummaryDTO getEventInvitationSummary(UUID eventId, User user) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        
        // Verify user is the organizer (skip check if user is null for debugging)
        if (user != null && !event.getOrganizer().getId().equals(user.getId())) {
            throw new IllegalArgumentException("User is not the organizer of this event");
        }
        
        List<Invitation> invitations = invitationRepository.findByEventId(eventId);
        
        int total = invitations.size();
        int accepted = 0;
        int declined = 0;
        int pending = 0;
        int proposed = 0;
        int superseded = 0;
        
        for (Invitation invitation : invitations) {
            switch (invitation.getStatus()) {
                case ACCEPTED:
                    accepted++;
                    break;
                case DECLINED:
                    declined++;
                    break;
                case PENDING:
                    pending++;
                    break;
                case PROPOSED:
                    proposed++;
                    break;
                case SUPERSEDED:
                    superseded++;
                    break;
                default:
                    break;
            }
        }
        
        logger.debug("Event {} invitation summary: total={}, accepted={}, declined={}, pending={}, proposed={}, superseded={}", 
                eventId, total, accepted, declined, pending, proposed, superseded);
        
        return new InvitationSummaryDTO(total, accepted, declined, pending, proposed, superseded);
    }
    
    /**
     * Get invitations for a user (where they are the recipient)
     */
    public List<Invitation> getUserInvitations(User user) {
        return invitationRepository.findByRecipientEmail(user.getEmail());
    }
    
    /**
     * Get invitations by status for a user
     */
    public List<Invitation> getUserInvitationsByStatus(User user, InvitationStatus status) {
        List<Invitation> allInvitations = invitationRepository.findByRecipientEmail(user.getEmail());
        return allInvitations.stream()
                .filter(inv -> inv.getStatus() == status)
                .toList();
    }
    
    /**
     * Accept a time proposal and update the event time (T080)
     * Uses optimistic locking to prevent concurrent updates
     */
    @Transactional
    public Event acceptProposal(UUID invitationId, User user) {
        logger.info("User {} accepting proposal for invitation {}", user.getEmail(), invitationId);
        
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new IllegalArgumentException("Invitation not found"));
        
        // Verify invitation has a proposal
        if (invitation.getStatus() != InvitationStatus.PROPOSED) {
            throw new IllegalArgumentException("Invitation does not have a pending proposal");
        }
        
        if (invitation.getProposedStart() == null || invitation.getProposedEnd() == null) {
            throw new IllegalArgumentException("Invitation proposal is missing time information");
        }
        
        Event event = invitation.getEvent();
        
        // Verify user is the organizer
        if (!event.getOrganizer().getId().equals(user.getId())) {
            throw new IllegalArgumentException("User is not the organizer of this event");
        }
        
        // Update event time with proposed time
        Instant oldStart = event.getStartDateTime();
        Instant oldEnd = event.getEndDateTime();
        
        event.setStartDateTime(invitation.getProposedStart());
        event.setEndDateTime(invitation.getProposedEnd());
        
        event = eventRepository.save(event);
        
        logger.info("Event {} time updated from [{} to {}] to [{} to {}]", 
                event.getId(), oldStart, oldEnd, 
                event.getStartDateTime(), event.getEndDateTime());
        
        // Mark this invitation as accepted
        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setRespondedAt(Instant.now());
        invitationRepository.save(invitation);
        
        // Supersede all other proposals for this event (T081)
        supersedOtherProposals(event.getId(), invitationId);
        
        return event;
    }
    
    /**
     * Reject a time proposal (T080)
     */
    @Transactional
    public Invitation rejectProposal(UUID invitationId, User user, String rejectionNote) {
        logger.info("User {} rejecting proposal for invitation {}", user.getEmail(), invitationId);
        
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new IllegalArgumentException("Invitation not found"));
        
        // Verify invitation has a proposal
        if (invitation.getStatus() != InvitationStatus.PROPOSED) {
            throw new IllegalArgumentException("Invitation does not have a pending proposal");
        }
        
        Event event = invitation.getEvent();
        
        // Verify user is the organizer
        if (!event.getOrganizer().getId().equals(user.getId())) {
            throw new IllegalArgumentException("User is not the organizer of this event");
        }
        
        // Mark proposal as declined
        invitation.setStatus(InvitationStatus.DECLINED);
        invitation.setResponseNote(rejectionNote != null ? rejectionNote : "Proposal rejected by organizer");
        invitation.setRespondedAt(Instant.now());
        
        invitation = invitationRepository.save(invitation);
        
        logger.info("Proposal rejected for invitation {}", invitationId);
        
        return invitation;
    }
    
    /**
     * Mark all other proposals for an event as superseded (T081)
     */
    @Transactional
    public void supersedOtherProposals(UUID eventId, UUID acceptedInvitationId) {
        logger.info("Superseding other proposals for event {} (accepted: {})", 
                eventId, acceptedInvitationId);
        
        List<Invitation> allInvitations = invitationRepository.findByEventId(eventId);
        
        int superseded = 0;
        for (Invitation invitation : allInvitations) {
            // Skip the accepted invitation
            if (invitation.getId().equals(acceptedInvitationId)) {
                continue;
            }
            
            // Supersede other proposals
            if (invitation.getStatus() == InvitationStatus.PROPOSED) {
                invitation.setStatus(InvitationStatus.SUPERSEDED);
                invitationRepository.save(invitation);
                superseded++;
                logger.debug("Superseded invitation {}", invitation.getId());
            }
        }
        
        logger.info("Superseded {} proposals for event {}", superseded, eventId);
    }
    
    /**
     * Get all proposals for an event (organizer view)
     */
    public List<Invitation> getEventProposals(UUID eventId, User user) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        
        // Verify user is the organizer
        if (!event.getOrganizer().getId().equals(user.getId())) {
            throw new IllegalArgumentException("User is not the organizer of this event");
        }
        
        List<Invitation> allInvitations = invitationRepository.findByEventId(eventId);
        return allInvitations.stream()
                .filter(inv -> inv.getStatus() == InvitationStatus.PROPOSED)
                .toList();
    }
}
