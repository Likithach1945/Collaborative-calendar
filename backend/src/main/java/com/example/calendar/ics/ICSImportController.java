package com.example.calendar.ics;

import com.example.calendar.auth.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/ics")
public class ICSImportController {
    
    private static final Logger logger = LoggerFactory.getLogger(ICSImportController.class);
    
    @Autowired
    private ICSImportService icsImportService;
    
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> importICSFile(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        
        String userEmail = (user != null) ? user.getEmail() : "anonymous";
        logger.info("ICS import requested by user {} for file: {}", 
                userEmail, file.getOriginalFilename());
        
        // Validate file
        if (file.isEmpty()) {
            logger.warn("Empty file upload attempted by user {}", userEmail);
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("File is empty"));
        }
        
        // Check file extension
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".ics")) {
            logger.warn("Invalid file type uploaded by user {}: {}", userEmail, filename);
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("File must be an .ics file"));
        }
        
        // Check file size (limit to 10MB)
        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            logger.warn("File too large ({} bytes) uploaded by user {}", 
                    file.getSize(), userEmail);
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("File size must be less than 10MB"));
        }
        
        try {
            ICSImportResultDTO result = icsImportService.importICSFile(file, user);
            
            logger.info("ICS import completed for user {}: imported={}, duplicates={}, errors={}", 
                    user.getEmail(), 
                    result.getImportedCount(), 
                    result.getDuplicateCount(), 
                    result.getErrorCount());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Error importing ICS file for user {}: {}", 
                    user.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to import ICS file: " + e.getMessage()));
        }
    }
    
    // Simple error response DTO
    private static class ErrorResponse {
        private String error;
        
        public ErrorResponse(String error) {
            this.error = error;
        }
        
        public String getError() {
            return error;
        }
        
        public void setError(String error) {
            this.error = error;
        }
    }
}
