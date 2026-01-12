package it.fithub.fithubspring.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import it.fithub.fithubspring.dto.RegisterRequest;
import it.fithub.fithubspring.service.UserService;
import it.fithub.fithubspring.domain.User;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.register(request);

            return ResponseEntity.ok(
                    new AuthResponse("Registration successful", user.getUsername()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred during registration"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request, HttpSession session) {
        try {
            String email = request.get("email");
            String password = request.get("password");

            User user = userService.login(email, password);

            // Store user in session
            session.setAttribute("user", user);

            return ResponseEntity.ok(new AuthResponse("Login successful", user.getUsername()));

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred during login"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(new AuthResponse("Logout successful", null));
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkAuth(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user != null) {
            return ResponseEntity.ok(new AuthResponse("Authenticated", user.getUsername()));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    static class AuthResponse {
        private String message;
        private String username;

        public AuthResponse(String message, String username) {
            this.message = message;
            this.username = username;
        }

        public String getMessage() {
            return message;
        }

        public String getUsername() {
            return username;
        }
    }

    static class ErrorResponse {
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() {
            return error;
        }
    }
}
