package com.example.calendar.auth;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final String FRONTEND_URL = "http://localhost:5173";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, 
            Authentication authentication) throws IOException, ServletException {
        
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();
            
        String googleSub = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        String displayName = oAuth2User.getAttribute("name");
        String pictureUrl = oAuth2User.getAttribute("picture");

        if (googleSub == null || email == null) {
            getRedirectStrategy().sendRedirect(request, response, 
                FRONTEND_URL + "/auth/error?message=Missing+required+OAuth+attributes");
            return;
        }

        try {
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

            // Redirect to frontend with token
            getRedirectStrategy().sendRedirect(request, response, 
                FRONTEND_URL + "/auth/callback?token=" + token + 
                "&userId=" + user.getId() + 
                "&email=" + user.getEmail() + 
                "&displayName=" + user.getDisplayName() + 
                "&timezone=" + user.getTimezone());
        } catch (Exception e) {
            getRedirectStrategy().sendRedirect(request, response, 
                FRONTEND_URL + "/auth/error?message=" + e.getMessage().replace(" ", "+"));
        }
    }
}