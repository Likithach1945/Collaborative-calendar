package com.example.calendar.invitations;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import jakarta.mail.internet.MimeMessage;

/**
 * SMTP email provider using Spring's JavaMailSender
 * Enabled when: spring.mail.host is configured
 */
@Component
@ConditionalOnProperty(name = "spring.mail.host")
public class SmtpEmailProvider implements EmailProvider {
    
    private static final Logger logger = LoggerFactory.getLogger(SmtpEmailProvider.class);
    
    private final JavaMailSender mailSender;
    
    public SmtpEmailProvider(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public boolean sendEmail(String to, String subject, String body) {
        return sendEmail(to, subject, body, null);
    }

    @Override
    public boolean sendEmail(String to, String subject, String body, String replyTo) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // true = HTML
            
            if (replyTo != null && !replyTo.isEmpty()) {
                helper.setReplyTo(replyTo);
            }
            
            mailSender.send(message);
            logger.info("Email sent successfully to: {}", to);
            return true;
            
        } catch (Exception e) {
            logger.error("Failed to send email to: {}", to, e);
            return false;
        }
    }
}
