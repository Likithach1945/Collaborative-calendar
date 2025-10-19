package com.example.calendar.invitations;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter for InvitationStatus enum to handle case-insensitive database values.
 * This allows the database to store values in lowercase (pending, accepted, declined)
 * while the Java enum uses uppercase (PENDING, ACCEPTED, DECLINED).
 */
@Converter(autoApply = true)
public class InvitationStatusConverter implements AttributeConverter<InvitationStatus, String> {

    @Override
    public String convertToDatabaseColumn(InvitationStatus status) {
        if (status == null) {
            return null;
        }
        // Store as uppercase in database
        return status.name().toUpperCase();
    }

    @Override
    public InvitationStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        
        try {
            // Convert database value to uppercase before parsing
            return InvitationStatus.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Log the error and return a default value
            System.err.println("Invalid InvitationStatus value in database: " + dbData);
            return InvitationStatus.PENDING;
        }
    }
}
