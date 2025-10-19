package com.example.calendar.invitations;

/**
 * Email provider interface for sending emails
 * Implementations can use SMTP, SendGrid, AWS SES, etc.
 */
public interface EmailProvider {
    
    /**
     * Send an email
     * @param to Recipient email address
     * @param subject Email subject
     * @param body Email body (HTML or plain text)
     * @return true if sent successfully, false otherwise
     */
    boolean sendEmail(String to, String subject, String body);
    
    /**
     * Send an email with reply-to address
     * @param to Recipient email address
     * @param subject Email subject
     * @param body Email body (HTML or plain text)
     * @param replyTo Reply-to email address
     * @return true if sent successfully, false otherwise
     */
    boolean sendEmail(String to, String subject, String body, String replyTo);
}
