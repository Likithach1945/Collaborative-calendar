package com.example.calendar;

import com.example.calendar.auth.User;
import com.example.calendar.auth.UserRepository;
import com.example.calendar.auth.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import io.restassured.RestAssured;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.specification.RequestSpecification;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
public abstract class BaseIntegrationTest {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("calendar_test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
    }

    @LocalServerPort
    protected int port;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected JwtUtil jwtUtil;

    protected RequestSpecification requestSpec;
    protected User testUser;
    protected String testToken;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";

        requestSpec = new RequestSpecBuilder()
                .setContentType("application/json")
                .setAccept("application/json")
                .build();

        // Create test user
        testUser = new User();
        testUser.setGoogleSub("test-google-sub-123");
        testUser.setEmail("test@example.com");
        testUser.setDisplayName("Test User");
        testUser.setTimezone("America/New_York");
        testUser = userRepository.save(testUser);

        // Generate test token
        testToken = jwtUtil.generateToken(testUser.getId(), testUser.getEmail());
    }

    protected RequestSpecification authenticatedRequest() {
        return RestAssured.given(requestSpec)
                .header("Authorization", "Bearer " + testToken);
    }
}
