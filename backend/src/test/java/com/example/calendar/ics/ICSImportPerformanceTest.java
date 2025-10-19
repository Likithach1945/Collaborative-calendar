package com.example.calendar.ics;

import com.example.calendar.BaseIntegrationTest;
import com.example.calendar.events.EventRepository;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

import static io.restassured.RestAssured.given;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;

public class ICSImportPerformanceTest extends BaseIntegrationTest {

    @Autowired
    private EventRepository eventRepository;

    @BeforeEach
    public void setUpPerformanceTest() {
        eventRepository.deleteAll();
    }

    @Test
    public void testImport500Events() throws IOException {
        // Generate ICS file with 500 events
        File icsFile = generateLargeICSFile(500);
        
        try {
            long startTime = System.currentTimeMillis();
            
            given()
                .port(RestAssured.port)
                .header("Authorization", "Bearer " + testToken)
                .contentType(ContentType.MULTIPART)
                .multiPart("file", icsFile, "text/calendar")
            .when()
                .post("/api/v1/ics/import")
            .then()
                .statusCode(HttpStatus.OK.value())
                .body("importedCount", equalTo(500))
                .body("duplicateCount", equalTo(0))
                .body("errorCount", equalTo(0));
            
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            
            System.out.println("=".repeat(80));
            System.out.println("ICS IMPORT PERFORMANCE TEST RESULTS");
            System.out.println("=".repeat(80));
            System.out.println("Events imported: 500");
            System.out.println("Total time: " + duration + " ms");
            System.out.println("Average time per event: " + (duration / 500.0) + " ms");
            System.out.println("=".repeat(80));
            
            // Verify all events were created
            assertThat(eventRepository.findByOrganizerId(testUser.getId())).hasSize(500);
            
            // Performance assertion - should complete within reasonable time
            // Adjust threshold based on system performance expectations
            assertThat(duration)
                .as("Import of 500 events should complete within 30 seconds")
                .isLessThan(30_000);
            
        } finally {
            // Cleanup temporary file
            icsFile.delete();
        }
    }

    @Test
    public void testImport500RecurringEvents() throws IOException {
        // Generate ICS file with 50 recurring events (10 instances each = 500 total)
        File icsFile = generateRecurringEventsICSFile(50, 10);
        
        try {
            long startTime = System.currentTimeMillis();
            
            given()
                .port(RestAssured.port)
                .header("Authorization", "Bearer " + testToken)
                .contentType(ContentType.MULTIPART)
                .multiPart("file", icsFile, "text/calendar")
            .when()
                .post("/api/v1/ics/import")
            .then()
                .statusCode(HttpStatus.OK.value())
                .body("importedCount", equalTo(500))
                .body("duplicateCount", equalTo(0))
                .body("errorCount", equalTo(0));
            
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            
            System.out.println("=".repeat(80));
            System.out.println("ICS IMPORT RECURRING EVENTS PERFORMANCE TEST RESULTS");
            System.out.println("=".repeat(80));
            System.out.println("Recurring events: 50 (with 10 instances each)");
            System.out.println("Total instances imported: 500");
            System.out.println("Total time: " + duration + " ms");
            System.out.println("Average time per recurring event: " + (duration / 50.0) + " ms");
            System.out.println("Average time per instance: " + (duration / 500.0) + " ms");
            System.out.println("=".repeat(80));
            
            // Verify all instances were created
            assertThat(eventRepository.findByOrganizerId(testUser.getId())).hasSize(500);
            
            // Performance assertion
            assertThat(duration)
                .as("Import of 50 recurring events (500 instances) should complete within 45 seconds")
                .isLessThan(45_000);
            
        } finally {
            icsFile.delete();
        }
    }

    private File generateLargeICSFile(int eventCount) throws IOException {
        File tempFile = File.createTempFile("perf-test-", ".ics");
        
        try (FileWriter writer = new FileWriter(tempFile)) {
            writer.write("BEGIN:VCALENDAR\n");
            writer.write("VERSION:2.0\n");
            writer.write("PRODID:-//Performance Test//EN\n");
            writer.write("CALSCALE:GREGORIAN\n");
            
            for (int i = 0; i < eventCount; i++) {
                writer.write("BEGIN:VEVENT\n");
                writer.write("UID:perf-test-event-" + i + "@example.com\n");
                writer.write("DTSTAMP:20240101T120000Z\n");
                
                // Distribute events across different dates
                int hour = 9 + (i % 8); // 9 AM to 4 PM
                
                writer.write(String.format("DTSTART:20240101T%02d0000Z\n", hour));
                writer.write(String.format("DTEND:20240101T%02d3000Z\n", hour));
                writer.write("SUMMARY:Performance Test Event " + i + "\n");
                writer.write("DESCRIPTION:Automatically generated test event for performance testing\n");
                writer.write("LOCATION:Test Location " + (i % 10) + "\n");
                writer.write("STATUS:CONFIRMED\n");
                writer.write("END:VEVENT\n");
            }
            
            writer.write("END:VCALENDAR\n");
        }
        
        return tempFile;
    }

    private File generateRecurringEventsICSFile(int eventCount, int instancesPerEvent) throws IOException {
        File tempFile = File.createTempFile("perf-test-recurring-", ".ics");
        
        try (FileWriter writer = new FileWriter(tempFile)) {
            writer.write("BEGIN:VCALENDAR\n");
            writer.write("VERSION:2.0\n");
            writer.write("PRODID:-//Performance Test Recurring//EN\n");
            writer.write("CALSCALE:GREGORIAN\n");
            
            for (int i = 0; i < eventCount; i++) {
                writer.write("BEGIN:VEVENT\n");
                writer.write("UID:perf-test-recurring-" + i + "@example.com\n");
                writer.write("DTSTAMP:20240101T120000Z\n");
                
                int hour = 9 + (i % 8);
                writer.write(String.format("DTSTART:20240301T%02d0000Z\n", hour));
                writer.write(String.format("DTEND:20240301T%02d3000Z\n", hour));
                writer.write("RRULE:FREQ=WEEKLY;COUNT=" + instancesPerEvent + "\n");
                writer.write("SUMMARY:Recurring Event " + i + "\n");
                writer.write("DESCRIPTION:Recurring test event for performance testing\n");
                writer.write("LOCATION:Virtual Room " + (i % 5) + "\n");
                writer.write("STATUS:CONFIRMED\n");
                writer.write("END:VEVENT\n");
            }
            
            writer.write("END:VCALENDAR\n");
        }
        
        return tempFile;
    }
}
