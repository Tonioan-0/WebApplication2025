package it.fithub.fithubspring.controller;

import it.fithub.fithubspring.dto.UserProfileDTO;
import it.fithub.fithubspring.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:4200")
public class UserProfileController {

    private final UserRepository userRepository;

    public UserProfileController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDTO> getProfile(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> new UserProfileDTO(
                        user.getUsername(),
                        user.getEmail(),
                        user.getIsPublic() != null && user.getIsPublic()
                ))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/visibility")
    public ResponseEntity<Void> updateVisibility(@PathVariable Long id, @RequestBody boolean isPublic) {
        userRepository.updateVisibility(id, isPublic);
        return ResponseEntity.ok().build();
    }
}