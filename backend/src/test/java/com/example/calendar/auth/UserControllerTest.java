package com.example.calendar.auth;

import com.example.calendar.BaseIntegrationTest;
import io.restassured.RestAssured;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.hamcrest.Matchers.*;

public class UserControllerTest extends BaseIntegrationTest {

    @Test
    void getCurrentUser_shouldReturnUserProfile() {
        authenticatedRequest()
                .when()
                .get("/api/v1/users/me")
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("id", notNullValue())
                .body("email", equalTo("test@example.com"))
                .body("displayName", equalTo("Test User"))
                .body("timezone", equalTo("America/New_York"))
                .body("createdAt", notNullValue())
                .body("updatedAt", notNullValue());
    }

    @Test
    void getCurrentUser_withoutAuth_shouldReturn401() {
        RestAssured.given(requestSpec)
                .when()
                .get("/api/v1/users/me")
                .then()
                .statusCode(HttpStatus.UNAUTHORIZED.value());
    }

    @Test
    void updateCurrentUser_shouldUpdateProfile() {
        String updatePayload = """
                {
                    "displayName": "Updated Name",
                    "timezone": "Europe/London"
                }
                """;

        authenticatedRequest()
                .body(updatePayload)
                .when()
                .patch("/api/v1/users/me")
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("displayName", equalTo("Updated Name"))
                .body("timezone", equalTo("Europe/London"));
    }
}
