package com.example.calendar.ics;

import com.example.calendar.BaseIntegrationTest;
import com.example.calendar.events.Event;
import com.example.calendar.events.EventRepository;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;

import java.io.File;
import java.io.IOException;
import java.io.FileOutputStream;
import java.util.List;

import static io.restassured.RestAssured.given;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;

public class ICSImportIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private EventRepository eventRepository;

    @BeforeEach
    public void setUpICSTest() {
        // Clean up events
        eventRepository.deleteAll();
    }

    @Test
    public void testImportValidSingleEvent() throws IOException {
        File icsFile = new ClassPathResource("ics/valid-single-event.ics").getFile();

        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + testToken)
            .contentType(ContentType.MULTIPART)
            .multiPart("file", icsFile, "text/calendar")
        .when()
            .post("/api/v1/ics/import")
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("importedCount", equalTo(1))
            .body("duplicateCount", equalTo(0))
            .body("errorCount", equalTo(0))
            .body("errors", empty());

        // Verify event was created in database
        List<Event> events = eventRepository.findByOrganizerId(testUser.getId());
        assertThat(events).hasSize(1);
        assertThat(events.get(0).getTitle()).isEqualTo("Team Meeting");
        assertThat(events.get(0).getDescription()).isEqualTo("Quarterly planning meeting");
        assertThat(events.get(0).getLocation()).isEqualTo("Conference Room A");
    }

    @Test
    public void testImportRecurringEvent() throws IOException {
        File icsFile = new ClassPathResource("ics/recurring-event.ics").getFile();

        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + testToken)
            .contentType(ContentType.MULTIPART)
            .multiPart("file", icsFile, "text/calendar")
        .when()
            .post("/api/v1/ics/import")
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("importedCount", equalTo(10))  // 10 instances from COUNT=10
            .body("duplicateCount", equalTo(0))
            .body("errorCount", equalTo(0))
            .body("errors", empty());

        // Verify all 10 instances were created
        List<Event> events = eventRepository.findByOrganizerId(testUser.getId());
        assertThat(events).hasSize(10);
        assertThat(events).allMatch(e -> e.getTitle().equals("Weekly Standup"));
    }

    @Test
    public void testImportMultipleEvents() throws IOException {
        File icsFile = new ClassPathResource("ics/multiple-events.ics").getFile();

        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + testToken)
            .contentType(ContentType.MULTIPART)
            .multiPart("file", icsFile, "text/calendar")
        .when()
            .post("/api/v1/ics/import")
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("importedCount", equalTo(7))  // 2 single + 5 recurring instances
            .body("duplicateCount", equalTo(0))
            .body("errorCount", equalTo(0));

        // Verify events
        List<Event> events = eventRepository.findByOrganizerId(testUser.getId());
        assertThat(events).hasSize(7);
    }

    @Test
    public void testImportDuplicateDetection() throws IOException {
        // First import
        File icsFile = new ClassPathResource("ics/valid-single-event.ics").getFile();

        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + testToken)
            .contentType(ContentType.MULTIPART)
            .multiPart("file", icsFile, "text/calendar")
        .when()
            .post("/api/v1/ics/import")
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("importedCount", equalTo(1))
            .body("duplicateCount", equalTo(0));

        // Second import - should detect duplicate
        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + testToken)
            .contentType(ContentType.MULTIPART)
            .multiPart("file", icsFile, "text/calendar")
        .when()
            .post("/api/v1/ics/import")
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("importedCount", equalTo(0))
            .body("duplicateCount", equalTo(1))
            .body("errorCount", equalTo(0));

        // Verify only one event in database
        List<Event> events = eventRepository.findByOrganizerId(testUser.getId());
        assertThat(events).hasSize(1);
    }

    @Test
    public void testImportMalformedFile() throws IOException {
        File icsFile = new ClassPathResource("ics/malformed.ics").getFile();

        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + testToken)
            .contentType(ContentType.MULTIPART)
            .multiPart("file", icsFile, "text/calendar")
        .when()
            .post("/api/v1/ics/import")
        .then()
            .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .body("error", notNullValue());

        // Verify no events were created
        List<Event> events = eventRepository.findByOrganizerId(testUser.getId());
        assertThat(events).isEmpty();
    }

    @Test
    public void testImportInvalidEventNoStartDate() throws IOException {
        File icsFile = new ClassPathResource("ics/invalid-no-start.ics").getFile();

        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + testToken)
            .contentType(ContentType.MULTIPART)
            .multiPart("file", icsFile, "text/calendar")
        .when()
            .post("/api/v1/ics/import")
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("importedCount", equalTo(0))
            .body("duplicateCount", equalTo(0))
            .body("errorCount", equalTo(1))
            .body("errors", hasSize(1))
            .body("errors[0]", containsString("missing start date"));
    }

    @Test
    public void testImportEmptyFile() throws IOException {
        File emptyFile = File.createTempFile("empty", ".ics");
        emptyFile.deleteOnExit();

        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + testToken)
            .contentType(ContentType.MULTIPART)
            .multiPart("file", emptyFile, "text/calendar")
        .when()
            .post("/api/v1/ics/import")
        .then()
            .statusCode(HttpStatus.BAD_REQUEST.value())
            .body("error", equalTo("File is empty"));
    }

    @Test
    public void testImportInvalidFileType() throws IOException {
        File textFile = File.createTempFile("test", ".txt");
        textFile.deleteOnExit();

        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + testToken)
            .contentType(ContentType.MULTIPART)
            .multiPart("file", textFile, "text/plain")
        .when()
            .post("/api/v1/ics/import")
        .then()
            .statusCode(HttpStatus.BAD_REQUEST.value())
            .body("error", equalTo("File must be an .ics file"));
    }

    @Test
    public void testImportWithoutAuthentication() throws IOException {
        File icsFile = new ClassPathResource("ics/valid-single-event.ics").getFile();

        given()
            .port(RestAssured.port)
            .contentType(ContentType.MULTIPART)
            .multiPart("file", icsFile, "text/calendar")
        .when()
            .post("/api/v1/ics/import")
        .then()
            .statusCode(HttpStatus.UNAUTHORIZED.value());
    }

    @Test
    public void testImportFileSizeLimitExceeded() throws IOException {
        // Create a file larger than 10MB
        File largeFile = File.createTempFile("large", ".ics");
        largeFile.deleteOnExit();
        
        try (FileOutputStream fos = new FileOutputStream(largeFile)) {
            byte[] buffer = new byte[1024 * 1024]; // 1MB buffer
            for (int i = 0; i < 11; i++) { // Write 11MB
                fos.write(buffer);
            }
        }

        given()
            .port(RestAssured.port)
            .header("Authorization", "Bearer " + testToken)
            .contentType(ContentType.MULTIPART)
            .multiPart("file", largeFile, "text/calendar")
        .when()
            .post("/api/v1/ics/import")
        .then()
            .statusCode(HttpStatus.BAD_REQUEST.value())
            .body("error", equalTo("File size must be less than 10MB"));
    }
}
