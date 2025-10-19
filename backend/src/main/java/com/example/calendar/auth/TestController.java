package com.example.calendar.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Get or create a test user for development
     */
    @GetMapping("/user")
    public ResponseEntity<User> getTestUser() {
        // Look for existing test user
        Optional<User> existingUser = userRepository.findByEmail("test@example.com");
        
        if (existingUser.isPresent()) {
            return ResponseEntity.ok(existingUser.get());
        }

        // Create new test user
        User testUser = new User();
        testUser.setGoogleSub("test-user-123");
        testUser.setDisplayName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setTimezone("America/New_York");
        
        User savedUser = userRepository.save(testUser);
        return ResponseEntity.ok(savedUser);
    }
}