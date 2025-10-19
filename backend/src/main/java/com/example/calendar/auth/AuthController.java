package com.example.calendar.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final String FRONTEND_URL = "http://localhost:5173";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Endpoint for Google login - redirects to OAuth2 authorization
     * This is a backup for direct OAuth2 login and not the primary flow
     */
    @GetMapping("/login/google")
    public ResponseEntity<Void> loginGoogle() {
        return ResponseEntity.status(302)
            .header("Location", "/oauth2/authorization/google")
            .build();
    }
    
    @GetMapping("/login/error")
    public ResponseEntity<String> loginError() {
        return ResponseEntity.status(401).body("Authentication failed");
    }

    @GetMapping("/callback/google")
    public ResponseEntity<Void> callbackGoogle(OAuth2AuthenticationToken authentication) {
        try {
            OAuth2User oAuth2User = authentication.getPrincipal();
            
            String googleSub = oAuth2User.getAttribute("sub");
            String email = oAuth2User.getAttribute("email");
            String displayName = oAuth2User.getAttribute("name");
            String pictureUrl = oAuth2User.getAttribute("picture");

            if (googleSub == null || email == null) {
                throw new IllegalStateException("Missing required OAuth attributes");
            }

            // Find or create user
            User user = userRepository.findByGoogleSub(googleSub)
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setGoogleSub(googleSub);
                        newUser.setEmail(email);
                        newUser.setDisplayName(displayName != null ? displayName : email);
                        newUser.setTimezone("UTC"); // Default, user can update later
                        return userRepository.save(newUser);
                    });

            // Generate JWT
            String token = jwtUtil.generateToken(user.getId(), user.getEmail());

            // Create session
            UserDTO userDTO = userMapper.toDTO(user);
            AuthSession session = new AuthSession(token, userDTO);

            // Redirect to frontend with token
            return ResponseEntity.status(302)
                    .header("Location", FRONTEND_URL + "/auth/callback?token=" + token + 
                            "&userId=" + user.getId() + 
                            "&email=" + user.getEmail() + 
                            "&displayName=" + user.getDisplayName() + 
                            "&timezone=" + user.getTimezone())
                    .build();
        } catch (Exception e) {
            return ResponseEntity.status(302)
                    .header("Location", FRONTEND_URL + "/auth/error?message=" + e.getMessage())
                    .build();
        }
    }
    
    @GetMapping("/callback/success")
    public ResponseEntity<Void> callbackSuccess(OAuth2AuthenticationToken authentication) {
        // This method will be called after successful OAuth2 authentication
        return callbackGoogle(authentication);
    }
    
    @GetMapping("/session")
    public ResponseEntity<AuthSession> getSession(OAuth2AuthenticationToken authentication) {
        if (authentication != null && authentication.getPrincipal() != null) {
            OAuth2User oAuth2User = authentication.getPrincipal();
            String googleSub = oAuth2User.getAttribute("sub");
            
            if (googleSub != null) {
                User user = userRepository.findByGoogleSub(googleSub).orElse(null);
                if (user != null) {
                    String token = jwtUtil.generateToken(user.getId(), user.getEmail());
                    UserDTO userDTO = userMapper.toDTO(user);
                    return ResponseEntity.ok(new AuthSession(token, userDTO));
                }
            }
        }
        
        return ResponseEntity.status(401).build();
    }
}
