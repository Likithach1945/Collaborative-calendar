package com.example.calendar.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for testing authentication
 */
@RestController
@RequestMapping("/auth/test")
public class TestAuthController {
    
    @GetMapping("/status")
    public ResponseEntity<String> testAuthStatus() {
        return ResponseEntity.ok("Authentication service is running correctly");
    }
}