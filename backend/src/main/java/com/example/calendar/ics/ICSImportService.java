package com.example.calendar.ics;

import com.example.calendar.auth.User;
import com.example.calendar.events.Event;
import com.example.calendar.events.EventRepository;
import net.fortuna.ical4j.data.CalendarBuilder;
import net.fortuna.ical4j.model.*;
import net.fortuna.ical4j.model.component.VEvent;
import net.fortuna.ical4j.model.Parameter;
import net.fortuna.ical4j.model.parameter.Value;
import net.fortuna.ical4j.model.property.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.TimeZone;
import java.util.*;
/**
 * Service for importing ICS (iCalendar) files
 */
@Service
public class ICSImportService {
    
    private static final Logger logger = LoggerFactory.getLogger(ICSImportService.class);
    private static final int MAX_RECURRENCE_INSTANCES = 100; // Limit recurrence expansion
    
    @Autowired
    private EventRepository eventRepository;
    
    /**
     * Import events from an ICS file
     * @param file The uploaded ICS file
     * @param user The authenticated user
     * @return Import result summary
     */
    @Transactional
    public ICSImportResultDTO importICSFile(MultipartFile file, User user) {
        long startTime = System.currentTimeMillis();
        logger.info("Starting ICS import for user {} - File: {}, Size: {} bytes", 
                user.getEmail(), file.getOriginalFilename(), file.getSize());
        
        ICSImportResultDTO result = new ICSImportResultDTO();
        
        if (file.isEmpty()) {
            result.addError("File is empty");
            return result;
        }
        
        try (InputStream inputStream = file.getInputStream()) {
            long parseStartTime = System.currentTimeMillis();
            CalendarBuilder builder = new CalendarBuilder();
            net.fortuna.ical4j.model.Calendar calendar = builder.build(inputStream);
            long parseEndTime = System.currentTimeMillis();
            logger.debug("ICS parsing completed in {} ms", parseEndTime - parseStartTime);
            
            // Get all VEVENT components
            List<VEvent> vEvents = calendar.getComponents(Component.VEVENT);
            
            logger.info("Processing {} events from ICS file for user {}", vEvents.size(), user.getEmail());
            
            long processingStartTime = System.currentTimeMillis();
            for (VEvent vEvent : vEvents) {
                try {
                    processVEvent(vEvent, user, result);
                } catch (Exception e) {
                    logger.error("Error processing event: {}", vEvent.getSummary(), e);
                    result.addError("Event '" + getSummary(vEvent) + "': " + e.getMessage());
                }
            }
            long processingEndTime = System.currentTimeMillis();
            
            long totalTime = System.currentTimeMillis() - startTime;
            logger.info("ICS import completed for user {} - Total: {} ms, Parse: {} ms, Processing: {} ms - " +
                    "Imported: {}, Duplicates: {}, Errors: {}", 
                    user.getEmail(), totalTime, parseEndTime - parseStartTime, 
                    processingEndTime - processingStartTime,
                    result.getImportedCount(), result.getDuplicateCount(), result.getErrorCount());
            
            // Performance warning for large imports
            if (totalTime > 5000) {
                logger.warn("ICS import took longer than 5 seconds ({} ms) for {} events", 
                        totalTime, result.getTotalProcessed());
            }
            
        } catch (Exception e) {
            long totalTime = System.currentTimeMillis() - startTime;
            logger.error("ICS import failed for user {} after {} ms: {}", 
                    user.getEmail(), totalTime, e.getMessage(), e);
            result.addError("Failed to parse ICS file: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Process a single VEvent (including recurrence expansion)
     */
    private void processVEvent(VEvent vEvent, User user, ICSImportResultDTO result) {
        // Check for recurrence rule
        RRule rrule = vEvent.getProperty(Property.RRULE);
        DtStart dtStart = vEvent.getStartDate();
        Value valueType = determineValueType(dtStart);
        
        if (rrule != null) {
            // Expand recurring events
            expandRecurringEvent(vEvent, rrule, user, result, valueType);
        } else {
            // Single event
            Event event = convertVEventToEvent(vEvent, user, null, valueType);
            if (event != null) {
                saveEvent(event, result);
            }
        }
    }
    
    /**
     * Expand a recurring event into multiple instances
     */
    private void expandRecurringEvent(VEvent vEvent, RRule rrule, User user, ICSImportResultDTO result, Value valueType) {
        try {
            DtStart dtStart = vEvent.getStartDate();
            if (dtStart == null) {
                result.addError("Recurring event missing start date: " + getSummary(vEvent));
                return;
            }
            
            // Calculate recurrence instances
            // Limit to 2 years or MAX_RECURRENCE_INSTANCES, whichever comes first
            java.util.Date javaRangeEnd = java.util.Date.from(Instant.now().plusSeconds(2L * 365 * 24 * 60 * 60));
            net.fortuna.ical4j.model.Date rangeEnd = valueType == Value.DATE
                ? new net.fortuna.ical4j.model.Date(javaRangeEnd)
                : new net.fortuna.ical4j.model.DateTime(javaRangeEnd);
            
            Recur recur = rrule.getRecur();
            DateList dates = recur.getDates(
                dtStart.getDate(),
                dtStart.getDate(),
                rangeEnd,
                valueType
            );
            
            int instanceCount = 0;
            for (Object dateObj : dates) {
                if (instanceCount >= MAX_RECURRENCE_INSTANCES) {
                    logger.warn("Limiting recurrence expansion to {} instances", MAX_RECURRENCE_INSTANCES);
                    break;
                }
                
                try {
                    net.fortuna.ical4j.model.Date instanceDate = (net.fortuna.ical4j.model.Date) dateObj;
                    Event event = convertVEventToEvent(vEvent, user, instanceDate, valueType);
                    if (event != null) {
                        saveEvent(event, result);
                        instanceCount++;
                    }
                } catch (Exception e) {
                    logger.error("Error creating recurrence instance", e);
                    result.addError("Recurrence instance of '" + getSummary(vEvent) + "': " + e.getMessage());
                }
            }
            
        } catch (Exception e) {
            logger.error("Error expanding recurrence", e);
            result.addError("Failed to expand recurrence for '" + getSummary(vEvent) + "': " + e.getMessage());
        }
    }
    
    /**
     * Convert VEvent to Event entity
     */
    private Event convertVEventToEvent(VEvent vEvent, User user, net.fortuna.ical4j.model.Date recurrenceDate, Value valueType) {
        Event event = new Event();
        event.setOrganizer(user);
        
        // Title
        Summary summary = vEvent.getSummary();
        if (summary != null) {
            event.setTitle(summary.getValue());
        } else {
            event.setTitle("Untitled Event");
        }
        
        // Description
        Description description = vEvent.getDescription();
        if (description != null) {
            event.setDescription(description.getValue());
        }
        
        // Location
        Location location = vEvent.getLocation();
        if (location != null) {
            event.setLocation(location.getValue());
        }
        
        // Times
        DtStart dtStart = vEvent.getStartDate();
        DtEnd dtEnd = vEvent.getEndDate();
        Duration durationProperty = vEvent.getDuration();
        
        if (dtStart == null) {
            return null; // Cannot create event without start time
        }
        
        Instant startInstant;
        Instant endInstant;
        ZoneId zoneId = resolveZoneId(dtStart, user.getTimezone());
        
        if (recurrenceDate != null) {
            // For recurring events, use the recurrence date
            startInstant = toInstant(recurrenceDate, valueType, zoneId);
            endInstant = resolveEndInstant(startInstant, dtStart, dtEnd, durationProperty, valueType, zoneId);
        } else {
            startInstant = toInstant(dtStart.getDate(), valueType, zoneId);
            endInstant = resolveEndInstant(startInstant, dtStart, dtEnd, durationProperty, valueType, zoneId);
        }
        
        event.setStartDateTime(startInstant);
        event.setEndDateTime(endInstant);
        
        // Timezone - use resolved zone id or fallback to user's timezone
        event.setTimezone(zoneId.getId());
        if (vEvent.getProperty(Property.RRULE) != null) {
            event.setRecurrenceRule(vEvent.getProperty(Property.RRULE).getValue());
        }
        
        return event;
    }

    private Instant resolveEndInstant(
        Instant startInstant,
        DtStart dtStart,
        DtEnd dtEnd,
        Duration durationProperty,
        Value valueType,
        ZoneId zoneId
    ) {
        if (dtEnd != null) {
            return toInstant(dtEnd.getDate(), determineValueType(dtEnd), zoneId);
        }

        if (durationProperty != null) {
            try {
                java.time.Duration isoDuration = java.time.Duration.parse(durationProperty.getValue());
                return startInstant.plus(isoDuration);
            } catch (DateTimeParseException ex) {
                logger.warn("Unable to parse duration '{}' for event", durationProperty.getValue(), ex);
            }
        }

        if (valueType == Value.DATE) {
            // All-day events default to 1-day duration
            return startInstant.plus(java.time.Duration.ofDays(1));
        }

        // Default 1 hour if nothing else specified
        return startInstant.plus(java.time.Duration.ofHours(1));
    }

    private Value determineValueType(DateProperty property) {
        if (property == null) {
            return Value.DATE_TIME;
        }
        Parameter valueParam = property.getParameter(Parameter.VALUE);
        if (valueParam instanceof Value) {
            return (Value) valueParam;
        }
        return property.getDate() instanceof DateTime ? Value.DATE_TIME : Value.DATE;
    }

    private ZoneId resolveZoneId(DateProperty property, String fallbackTimezone) {
        if (property != null) {
            TimeZone tz = property.getTimeZone();
            if (tz != null) {
                return tz.toZoneId();
            }
            Parameter tzIdParam = property.getParameter(Parameter.TZID);
            if (tzIdParam != null) {
                try {
                    return ZoneId.of(tzIdParam.getValue());
                } catch (Exception ignored) {
                    logger.debug("Unable to resolve TZID '{}', falling back", tzIdParam.getValue());
                }
            }
        }

        if (fallbackTimezone != null && !fallbackTimezone.isBlank()) {
            try {
                return ZoneId.of(fallbackTimezone);
            } catch (Exception ignored) {
                logger.debug("Invalid fallback timezone '{}', defaulting to UTC", fallbackTimezone);
            }
        }

        return ZoneId.of("UTC");
    }

    private Instant toInstant(net.fortuna.ical4j.model.Date date, Value valueType, ZoneId zoneId) {
        if (date == null) {
            return null;
        }

        if (valueType == Value.DATE) {
            String value = date.toString();
            try {
                LocalDate localDate = LocalDate.parse(value, DateTimeFormatter.BASIC_ISO_DATE);
                return localDate.atStartOfDay(zoneId).toInstant();
            } catch (DateTimeParseException ex) {
                logger.warn("Unable to parse all-day date '{}' for timezone '{}', using raw instant", value, zoneId, ex);
                return date.toInstant();
            }
        }

        return date.toInstant();
    }
    
    /**
     * Save event if not a duplicate
     */
    private void saveEvent(Event event, ICSImportResultDTO result) {
        // Check for duplicate (same title, start time, and organizer)
        List<Event> existingEvents = eventRepository.findByOrganizerAndDateRange(
            event.getOrganizer().getId(),
            event.getStartDateTime().minusSeconds(1),
            event.getStartDateTime().plusSeconds(1)
        );
        
        boolean isDuplicate = existingEvents.stream()
            .anyMatch(e -> e.getTitle().equals(event.getTitle()));
        
        if (isDuplicate) {
            result.incrementDuplicate();
            logger.debug("Skipping duplicate event: {} at {}", event.getTitle(), event.getStartDateTime());
        } else {
            eventRepository.save(event);
            result.incrementImported();
            logger.debug("Imported event: {} at {}", event.getTitle(), event.getStartDateTime());
        }
    }
    
    /**
     * Safely get summary from VEvent
     */
    private String getSummary(VEvent vEvent) {
        Summary summary = vEvent.getSummary();
        return summary != null ? summary.getValue() : "Untitled";
    }
}
