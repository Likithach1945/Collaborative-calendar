package com.example.calendar.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingPathVariableException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import javax.naming.AuthenticationException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

/**
 * DEPRECATED: Use com.example.calendar.shared.GlobalExceptionHandler instead.
 * This class is kept for reference purposes and will be removed in future versions.
 */
// @ControllerAdvice - Removing the annotation to avoid conflicting exception handlers
public class LegacyExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(LegacyExceptionHandler.class);

    @ExceptionHandler(NoSuchElementException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<Map<String, Object>> handleNoSuchElementException(NoSuchElementException e) {
        logger.error("Resource not found: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Resource not found");
        response.put("message", e.getMessage());
        response.put("status", HttpStatus.NOT_FOUND.value());
        
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }
    
    @ExceptionHandler(EmptyResultDataAccessException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<Map<String, Object>> handleEmptyResultDataAccessException(EmptyResultDataAccessException e) {
        logger.error("Resource not found: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Resource not found");
        response.put("message", "The requested resource does not exist");
        response.put("status", HttpStatus.NOT_FOUND.value());
        
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException e) {
        logger.error("Invalid request: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Invalid request");
        response.put("message", e.getMessage());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ResponseEntity<Map<String, Object>> handleIllegalStateException(IllegalStateException e) {
        logger.error("State conflict: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "State conflict");
        response.put("message", e.getMessage());
        response.put("status", HttpStatus.CONFLICT.value());
        
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(AccessDeniedException e) {
        logger.error("Access denied: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Access denied");
        response.put("message", "You do not have permission to perform this action");
        response.put("status", HttpStatus.FORBIDDEN.value());
        
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }
    
    @ExceptionHandler(AuthenticationException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(AuthenticationException e) {
        logger.error("Authentication failed: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Authentication failed");
        response.put("message", "Please login to access this resource");
        response.put("status", HttpStatus.UNAUTHORIZED.value());
        
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException e) {
        logger.error("Validation error: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        
        List<Map<String, String>> errors = new ArrayList<>();
        e.getBindingResult().getAllErrors().forEach((error) -> {
            Map<String, String> errorDetails = new HashMap<>();
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errorDetails.put("field", fieldName);
            errorDetails.put("message", errorMessage);
            errors.add(errorDetails);
        });
        
        response.put("error", "Validation failed");
        response.put("errors", errors);
        response.put("status", HttpStatus.BAD_REQUEST.value());
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({
        HttpMessageNotReadableException.class,
        MethodArgumentTypeMismatchException.class,
        MissingPathVariableException.class,
        MissingServletRequestParameterException.class
    })
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, Object>> handleBadRequestExceptions(Exception e) {
        logger.error("Bad request: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Bad request");
        response.put("message", "The request could not be understood by the server");
        response.put("status", HttpStatus.BAD_REQUEST.value());
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolationException(DataIntegrityViolationException e) {
        logger.error("Data integrity violation: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Data conflict");
        response.put("message", "The operation violates data constraints");
        response.put("status", HttpStatus.CONFLICT.value());
        
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }
    
    @ExceptionHandler(DataAccessException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<Map<String, Object>> handleDataAccessException(DataAccessException e) {
        logger.error("Database error: {}", e.getMessage(), e);
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Database error");
        response.put("message", "An error occurred while accessing the database");
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    @ExceptionHandler(NoHandlerFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<Map<String, Object>> handleNoHandlerFoundException(NoHandlerFoundException e) {
        logger.error("Endpoint not found: {} {}", e.getHttpMethod(), e.getRequestURL());
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Endpoint not found");
        response.put("message", String.format("No handler found for %s %s", e.getHttpMethod(), e.getRequestURL()));
        response.put("status", HttpStatus.NOT_FOUND.value());
        
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }
    
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    @ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)
    public ResponseEntity<Map<String, Object>> handleMethodNotAllowedException(HttpRequestMethodNotSupportedException e) {
        logger.error("Method not allowed: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Method not allowed");
        response.put("message", String.format("The %s method is not supported for this endpoint", e.getMethod()));
        response.put("allowedMethods", e.getSupportedHttpMethods().stream().map(method -> method.name()).collect(Collectors.toList()));
        response.put("status", HttpStatus.METHOD_NOT_ALLOWED.value());
        
        return new ResponseEntity<>(response, HttpStatus.METHOD_NOT_ALLOWED);
    }
    
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<Map<String, Object>> handleException(Exception e) {
        logger.error("Unexpected error: {}", e.getMessage(), e);
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Internal server error");
        response.put("message", "An unexpected error occurred");
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}