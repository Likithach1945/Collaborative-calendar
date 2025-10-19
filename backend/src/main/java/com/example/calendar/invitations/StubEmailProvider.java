package com.example.calendar.invitations;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

/**
 * Stub email provider for development/testing
 * Used when no real email provider is configured
 */
@Component
@ConditionalOnMissingBean(SmtpEmailProvider.class)
public class StubEmailProvider implements EmailProvider {
    
    private static final Logger logger = LoggerFactory.getLogger(StubEmailProvider.class);

    @Override
    public boolean sendEmail(String to, String subject, String body) {
        return sendEmail(to, subject, body, null);
    }

    @Override
    public boolean sendEmail(String to, String subject, String body, String replyTo) {
        logger.info("📧 [STUB EMAIL] Would send email:");
        logger.info("   To: {}", to);
        logger.info("   Subject: {}", subject);
        logger.info("   Body length: {} chars", body.length());
        if (replyTo != null) {
            logger.info("   Reply-To: {}", replyTo);
        }
        logger.info("   Note: Configure spring.mail.* properties to enable real email sending");
        return true; // Always returns success in stub mode
    }
}
