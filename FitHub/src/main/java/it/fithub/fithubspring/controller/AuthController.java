package it.fithub.fithubspring.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import it.fithub.fithubspring.dto.RegisterRequest;
import it.fithub.fithubspring.service.UserService;
import it.fithub.fithubspring.service.AdminService;
import it.fithub.fithubspring.domain.User;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final AdminService adminService;

    public AuthController(UserService userService, AdminService adminService) {
        this.userService = userService;
        this.adminService = adminService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.register(request);

            return ResponseEntity.ok(
                    new AuthResponse("Registration successful", user.getUsername(), user.getId(), false));
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

            //check se l'utete e' bannato
            if (adminService.isEmailBanned(email)) {
                String reason = adminService.getBanReasonByEmail(email);
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(new BannedResponse(true, reason));
            }

            session.setAttribute("user", user);

            return ResponseEntity.ok(new AuthResponse("Login successful", user.getUsername(), user.getId(), 
                    Boolean.TRUE.equals(user.getIsAdmin())));

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
        return ResponseEntity.ok(new AuthResponse("Logout successful", null, null, false));
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkAuth(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user != null) {
            return ResponseEntity.ok(new AuthResponse("Authenticated", user.getUsername(), user.getId(),
                    Boolean.TRUE.equals(user.getIsAdmin())));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    static class AuthResponse {
        private String message;
        private String username;
        private Long userId;
        private Boolean isAdmin;

        public AuthResponse(String message, String username, Long userId, Boolean isAdmin) {
            this.message = message;
            this.username = username;
            this.userId = userId;
            this.isAdmin = isAdmin;
        }

        public String getMessage() {
            return message;
        }

        public String getUsername() {
            return username;
        }

        public Long getUserId() {
            return userId;
        }

        public Boolean getIsAdmin() {
            return isAdmin;
        }
    }

    //classe per la risposta quando un utente e' bannato
    static class BannedResponse {
        private boolean banned;
        private String reason;

        public BannedResponse(boolean banned, String reason) {
            this.banned = banned;
            this.reason = reason;
        }

        public boolean isBanned() {
            return banned;
        }

        public String getReason() {
            return reason;
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
