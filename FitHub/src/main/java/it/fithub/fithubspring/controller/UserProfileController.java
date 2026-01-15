package it.fithub.fithubspring.controller;

import it.fithub.fithubspring.dto.ChangePasswordRequest;
import it.fithub.fithubspring.dto.UserProfileDTO;
import it.fithub.fithubspring.repository.UserRepository;
import it.fithub.fithubspring.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:4200")
public class UserProfileController {

    private final UserRepository userRepository;
    private  final UserService userService;

    public UserProfileController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDTO> getProfile(@PathVariable Long id) {
        return userRepository.getUserProfile(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/visibility")
    public ResponseEntity<Void> updateVisibility(@PathVariable Long id, @RequestBody boolean isPublic) {
        userRepository.updateVisibility(id, isPublic);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestBody String newStatus) {
        String cleanStatus = newStatus != null ? newStatus.replace("\"", "") : "";
        userRepository.updateStatusMessage(id, cleanStatus);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(id, request);
            return ResponseEntity.ok().body(Map.of("message", "Password aggiornata con successo"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}