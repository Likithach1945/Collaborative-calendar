-- V1__init.sql
-- Initial schema for calendar application

CREATE TABLE IF NOT EXISTS users (
    id BINARY(16) PRIMARY KEY,
    google_sub VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(320) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_google_sub (google_sub)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS events (
    id BINARY(16) PRIMARY KEY,
    organizer_id BINARY(16) NOT NULL,
    title VARCHAR(120) NOT NULL,
    description TEXT,
    start_date_time TIMESTAMP NOT NULL,
    end_date_time TIMESTAMP NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    recurrence_rule VARCHAR(500),
    video_conference_link VARCHAR(500),
    location VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_organizer_start (organizer_id, start_date_time),
    INDEX idx_start_date (start_date_time),
    INDEX idx_end_date (end_date_time),
    CHECK (end_date_time > start_date_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS invitations (
    id BINARY(16) PRIMARY KEY,
    event_id BINARY(16) NOT NULL,
    recipient_email VARCHAR(320) NOT NULL,
    status ENUM('pending', 'accepted', 'declined', 'proposed', 'superseded') NOT NULL DEFAULT 'pending',
    proposed_start TIMESTAMP NULL,
    proposed_end TIMESTAMP NULL,
    response_note VARCHAR(500),
    responded_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_event (event_id),
    INDEX idx_recipient (recipient_email),
    INDEX idx_status (status),
    CHECK (proposed_end IS NULL OR proposed_end > proposed_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
