package com.example.calendar.scheduling;

import com.example.calendar.invitations.Invitation;
import com.example.calendar.invitations.InvitationRepository;
import com.example.calendar.invitations.InvitationStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled job that logs reminders for pending invitations.
 * Currently a stub implementation that logs to console.
 * Future enhancement: Send actual email/push notifications.
 */
@Component
public class InvitationReminderJob {

    private static final Logger logger = LoggerFactory.getLogger(InvitationReminderJob.class);
    private static final int REMINDER_MINUTES_BEFORE = 10;

    private final InvitationRepository invitationRepository;

    public InvitationReminderJob(InvitationRepository invitationRepository) {
        this.invitationRepository = invitationRepository;
    }

    /**
     * Runs every minute to check for pending invitations that need reminders.
     * Logs reminder messages for events starting in the next 10 minutes.
     * 
     * Cron expression: "0 * * * * *" = every minute at 0 seconds
     */
    @Scheduled(cron = "0 * * * * *")
    @Transactional(readOnly = true)
    public void sendPendingInvitationReminders() {
        logger.debug("Running invitation reminder job");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderWindow = now.plusMinutes(REMINDER_MINUTES_BEFORE);

        try {
            // Find all pending invitations
            List<Invitation> pendingInvitations = invitationRepository.findByStatus(InvitationStatus.PENDING);

            long remindersSent = 0;
            for (Invitation invitation : pendingInvitations) {
                LocalDateTime eventStartTime = LocalDateTime.ofInstant(
                    invitation.getEvent().getStartDateTime(),
                    java.time.ZoneId.systemDefault()
                );

                // Check if event starts within the reminder window
                if (eventStartTime.isAfter(now) && eventStartTime.isBefore(reminderWindow)) {
                    logReminder(invitation);
                    remindersSent++;
                }
            }

            if (remindersSent > 0) {
                logger.info("Sent {} invitation reminders", remindersSent);
            }

        } catch (Exception e) {
            logger.error("Error processing invitation reminders", e);
        }
    }

    /**
     * Logs a reminder message for a pending invitation.
     * 
     * @param invitation The pending invitation
     */
    private void logReminder(Invitation invitation) {
        String recipientEmail = invitation.getRecipientEmail();
        String eventTitle = invitation.getEvent().getTitle();
        LocalDateTime startTime = LocalDateTime.ofInstant(
            invitation.getEvent().getStartDateTime(),
            java.time.ZoneId.systemDefault()
        );

        String message = String.format(
            "REMINDER: %s has pending invitation for event '%s' starting at %s",
            recipientEmail,
            eventTitle,
            startTime
        );

        logger.info(message);

        // TODO: Replace with actual notification service
        // Future implementation:
        // - emailService.sendReminderEmail(recipientEmail, invitation.getEvent());
        // - pushNotificationService.send(recipientEmail, reminderMessage);
    }

    /**
     * Manual trigger for testing purposes.
     * Can be called from a test endpoint or admin interface.
     */
    public void triggerManually() {
        logger.info("Manually triggering invitation reminder job");
        sendPendingInvitationReminders();
    }
}
