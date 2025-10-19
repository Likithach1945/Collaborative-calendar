package com.example.calendar.invitations;

import com.example.calendar.events.Event;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;

/**
 * Email service for sending invitation notifications.
 * Currently a stub that logs email content instead of actually sending.
 * In production, integrate with an email service provider (SendGrid, AWS SES, etc.)
 */
@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired
    private EmailProvider emailProvider;
    
    /**
     * Send a simple email
     * @param to Recipient email address
     * @param subject Email subject
     * @param message Email message
     */
    public void sendEmail(String to, String subject, String message) {
        emailProvider.sendEmail(to, subject, message);
    }
    
    /**
     * Send invitation email to a participant
     * @param invitation The invitation containing event and recipient details
     */
    public void sendInvitationEmail(Invitation invitation) {
        Event event = invitation.getEvent();
        String recipientEmail = invitation.getRecipientEmail();
        
        // Format the event times for the email
        DateTimeFormatter formatter = DateTimeFormatter
                .ofLocalizedDateTime(FormatStyle.FULL, FormatStyle.SHORT)
                .withZone(ZoneId.of(event.getTimezone()));
        
        String startTime = formatter.format(event.getStartDateTime());
        String endTime = formatter.format(event.getEndDateTime());
        
        // Log the email content (stub implementation)
        logger.info("=== EMAIL INVITATION ===");
        logger.info("To: {}", recipientEmail);
        logger.info("Subject: Invitation: {} @ {}", event.getTitle(), startTime);
        logger.info("Body:");
        logger.info("  You have been invited to: {}", event.getTitle());
        logger.info("  Organizer: {} ({})", 
                event.getOrganizer().getDisplayName(), 
                event.getOrganizer().getEmail());
        logger.info("  Start: {}", startTime);
        logger.info("  End: {}", endTime);
        logger.info("  Timezone: {}", event.getTimezone());
        
        if (event.getDescription() != null && !event.getDescription().isEmpty()) {
            logger.info("  Description: {}", event.getDescription());
        }
        
        if (event.getLocation() != null && !event.getLocation().isEmpty()) {
            logger.info("  Location: {}", event.getLocation());
        }
        
        if (event.getVideoConferenceLink() != null && !event.getVideoConferenceLink().isEmpty()) {
            logger.info("  Video Conference: {}", event.getVideoConferenceLink());
        }
        
        logger.info("  Invitation ID: {}", invitation.getId());
        logger.info("  Status: {}", invitation.getStatus());
        logger.info("========================");
    }
    
    /**
     * Send invitation update email to a participant
     * @param invitation The updated invitation
     */
    public void sendInvitationUpdateEmail(Invitation invitation) {
        logger.info("=== EMAIL INVITATION UPDATE ===");
        logger.info("To: {}", invitation.getRecipientEmail());
        logger.info("Event: {}", invitation.getEvent().getTitle());
        logger.info("Status: {}", invitation.getStatus());
        logger.info("==============================");
    }
    
    /**
     * Send notification to organizer about invitation response
     * @param invitation The invitation with response
     */
    public void sendResponseNotificationEmail(Invitation invitation) {
        Event event = invitation.getEvent();
        logger.info("=== EMAIL RESPONSE NOTIFICATION ===");
        logger.info("To: {}", event.getOrganizer().getEmail());
        logger.info("Subject: {} has {} your invitation to \"{}\"",
                invitation.getRecipientEmail(),
                invitation.getStatus().toString().toLowerCase(),
                event.getTitle());
        logger.info("===================================");
    }
}
