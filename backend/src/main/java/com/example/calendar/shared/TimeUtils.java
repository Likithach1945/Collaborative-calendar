package com.example.calendar.shared;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.zone.ZoneRules;

public class TimeUtils {

    /**
     * Convert a LocalDateTime in a specific timezone to UTC Instant
     * @param localDateTime The local date-time
     * @param timezone IANA timezone ID
     * @return UTC Instant
     */
    public static Instant toUtcInstant(LocalDateTime localDateTime, String timezone) {
        ZoneId zoneId = ZoneId.of(timezone);
        return localDateTime.atZone(zoneId).toInstant();
    }

    /**
     * Convert a UTC Instant to LocalDateTime in a specific timezone
     * @param instant UTC instant
     * @param timezone IANA timezone ID
     * @return LocalDateTime in the specified timezone
     */
    public static LocalDateTime toLocalDateTime(Instant instant, String timezone) {
        ZoneId zoneId = ZoneId.of(timezone);
        return LocalDateTime.ofInstant(instant, zoneId);
    }

    /**
     * Get the start of day for a date in a specific timezone, as UTC Instant
     * @param date The date
     * @param timezone IANA timezone ID
     * @return UTC Instant representing start of day
     */
    public static Instant getStartOfDay(LocalDate date, String timezone) {
        ZoneId zoneId = ZoneId.of(timezone);
        return date.atStartOfDay(zoneId).toInstant();
    }

    /**
     * Get the end of day for a date in a specific timezone, as UTC Instant
     * @param date The date
     * @param timezone IANA timezone ID
     * @return UTC Instant representing end of day (23:59:59.999999999)
     */
    public static Instant getEndOfDay(LocalDate date, String timezone) {
        ZoneId zoneId = ZoneId.of(timezone);
        return date.atTime(LocalTime.MAX).atZone(zoneId).toInstant();
    }

    /**
     * Check if a timezone ID is valid
     * @param timezone IANA timezone ID
     * @return true if valid, false otherwise
     */
    public static boolean isValidTimezone(String timezone) {
        try {
            ZoneId.of(timezone);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get timezone offset at a specific instant
     * @param instant The instant
     * @param timezone IANA timezone ID
     * @return Offset string (e.g., "+05:30", "-08:00")
     */
    public static String getTimezoneOffset(Instant instant, String timezone) {
        ZoneId zoneId = ZoneId.of(timezone);
        ZonedDateTime zonedDateTime = instant.atZone(zoneId);
        return zonedDateTime.getOffset().getId();
    }

    /**
     * Check if a datetime falls during DST transition in a timezone
     * @param instant The instant to check
     * @param timezone IANA timezone ID
     * @return true if during DST transition
     */
    public static boolean isDstTransition(Instant instant, String timezone) {
        ZoneId zoneId = ZoneId.of(timezone);
        ZoneRules rules = zoneId.getRules();
        return rules.getTransition(toLocalDateTime(instant, timezone)) != null;
    }

    /**
     * Format an Instant in ISO 8601 format with timezone
     * @param instant The instant
     * @param timezone IANA timezone ID
     * @return ISO 8601 formatted string
     */
    public static String formatIso8601(Instant instant, String timezone) {
        ZoneId zoneId = ZoneId.of(timezone);
        return instant.atZone(zoneId).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }

    /**
     * Parse ISO 8601 string to Instant
     * @param iso8601String ISO 8601 formatted string
     * @return UTC Instant
     */
    public static Instant parseIso8601(String iso8601String) {
        return Instant.parse(iso8601String);
    }

    /**
     * Get the week boundaries (start and end) for a date in a timezone
     * Week starts on Monday by default
     * @param date The date
     * @param timezone IANA timezone ID
     * @return Array with [startOfWeek, endOfWeek] as UTC Instants
     */
    public static Instant[] getWeekBoundaries(LocalDate date, String timezone) {
        LocalDate startOfWeek = date.with(DayOfWeek.MONDAY);
        LocalDate endOfWeek = date.with(DayOfWeek.SUNDAY);
        
        return new Instant[]{
            getStartOfDay(startOfWeek, timezone),
            getEndOfDay(endOfWeek, timezone)
        };
    }

    /**
     * Calculate duration between two instants in minutes
     * @param start Start instant
     * @param end End instant
     * @return Duration in minutes
     */
    public static long getDurationInMinutes(Instant start, Instant end) {
        return Duration.between(start, end).toMinutes();
    }

    /**
     * Check if two time ranges overlap
     * @param start1 Start of first range
     * @param end1 End of first range
     * @param start2 Start of second range
     * @param end2 End of second range
     * @return true if ranges overlap
     */
    public static boolean rangesOverlap(Instant start1, Instant end1, Instant start2, Instant end2) {
        return !start1.isAfter(end2) && !end1.isBefore(start2);
    }
}
