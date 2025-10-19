package com.example.calendar.events;

import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Service for generating video conference links for events
 * Uses Jitsi Meet - open source, free, and reliable
 */
@Service
public class VideoConferenceService {

    @Value("${jitsi.base-url:https://meet.jit.si/}")
    private String jitsiBaseUrl;
    
    private static final Logger logger = LoggerFactory.getLogger(VideoConferenceService.class);
    
    /**
     * Generate a unique video conference link for an event using Jitsi Meet
     * 
     * @param event The event that needs a video conference link
     * @return A unique Jitsi meeting URL
     */
    public String generateMeetingLink(Event event) {
        try {
            if (event == null) {
                logger.warn("Cannot generate meeting link: event is null");
                return null;
            }
            
            // Generate unique Jitsi room using UUID
            String roomId = UUID.randomUUID().toString();
            String link = jitsiBaseUrl + roomId;
            
            logger.info("Generated Jitsi Meet link for event {}: {}", event.getId(), link);
            return link;
        } catch (Exception e) {
            logger.error("Error generating meeting link for event: {}", 
                        event != null ? event.getId() : "unknown", e);
            return null;
        }
    }
}