package com.example.calendar.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get current user profile
     * GET /api/v1/users/me
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal User user) {
        UserDTO userDTO = userMapper.toDTO(user);
        return ResponseEntity.ok(userDTO);
    }

    /**
     * Update current user profile
     * PATCH /api/v1/users/me
     */
    @PatchMapping("/me")
    public ResponseEntity<UserDTO> updateCurrentUser(
            @RequestBody UserDTO userDTO,
            @AuthenticationPrincipal User user) {
        
        // Update allowed fields
        if (userDTO.getDisplayName() != null) {
            user.setDisplayName(userDTO.getDisplayName());
        }
        
        if (userDTO.getTimezone() != null) {
            user.setTimezone(userDTO.getTimezone());
        }
        
        User updatedUser = userRepository.save(user);
        UserDTO responseDTO = userMapper.toDTO(updatedUser);
        
        return ResponseEntity.ok(responseDTO);
    }
}
