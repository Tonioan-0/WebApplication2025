package it.fithub.fithubspring.controller.workout;

import it.fithub.fithubspring.domain.User;
import it.fithub.fithubspring.dto.workout.WorkoutPlanDto;
import it.fithub.fithubspring.service.WorkoutPlansService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/workout-plans")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class WorkoutPlansController {
    private final WorkoutPlansService service;

    public WorkoutPlansController(WorkoutPlansService service) {
        this.service = service;
    }

    /**
     * Estrae l'userId dalla sessione HTTP
     */
    private Long getUserIdFromSession(HttpSession session) {
        User user = (User) session.getAttribute("user");
        return user != null ? user.getId() : null;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody WorkoutPlanDto plan, HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }
        // Sovrascrivi userId con quello della sessione (più sicuro)
        plan.setUserId(userId);
        return ResponseEntity.ok(service.create(plan));
    }

    @GetMapping("/active")
    public ResponseEntity<?> active(
            @RequestParam(required = false) String referenceDate,
            HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }
        LocalDate ref = (referenceDate == null || referenceDate.isBlank())
                ? LocalDate.now()
                : LocalDate.parse(referenceDate);
        return ResponseEntity.ok(service.active(userId, ref));
    }

    @GetMapping("/expired")
    public ResponseEntity<?> expired(HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }
        return ResponseEntity.ok(service.expired(userId, LocalDate.now()));
    }

    @DeleteMapping("/{planId}")
    public ResponseEntity<?> delete(@PathVariable Long planId, HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }
        service.delete(planId);
        return ResponseEntity.ok().build();
    }
}
