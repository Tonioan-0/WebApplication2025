package it.fithub.fithubspring.controller.workout;

import it.fithub.fithubspring.domain.User;
import it.fithub.fithubspring.dto.workout.StreakDto;
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

    /* Estrae l'userId dalla sessione HTTP */
    private Long getUserIdFromSession(HttpSession session) {
        User user = (User) session.getAttribute("user");
        return user != null ? user.getId() : null;
    }

    @PostMapping    /* Crea un nuovo allenamento */
    public ResponseEntity<?> create(@Valid @RequestBody WorkoutPlanDto plan, HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }
        // Sovrascrivi userId con quello della sessione (più sicuro)
        plan.setUserId(userId);
        return ResponseEntity.ok(service.create(plan));
    }

    @PutMapping("/{planId}")    /* Aggiorna un allenamento esistente */
    public ResponseEntity<?> update(
            @PathVariable Long planId,
            @Valid @RequestBody WorkoutPlanDto plan,
            HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }
        plan.setUserId(userId);
        // Ensure ID matches path variable if needed, or service handles it knowing planId
        return ResponseEntity.ok(service.update(planId, plan));
    }

    @GetMapping("/active")    /* Estrae l'allenamento attivo per la giornata di oggi*/
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

    @GetMapping("/expired")    /* Estrae tutti i allenamento scaduti */
    public ResponseEntity<?> expired(HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }
        return ResponseEntity.ok(service.expired(userId, LocalDate.now()));
    }

    @DeleteMapping("/{planId}")    /* Elimina un allenamento */
    public ResponseEntity<?> delete(@PathVariable Long planId, HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }
        service.delete(planId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{planId}/complete")    /* Completa un allenamento */
    public ResponseEntity<?> completeWorkout(
            @PathVariable Long planId,
            HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }
        try {
            service.completeWorkoutWithStreak(userId, planId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/streak")    /* Restituisce i dati dello stack */
    public ResponseEntity<?> getStreak(HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }
        try {
            StreakDto streak = service.getStreak(userId);
            return ResponseEntity.ok(streak);
        } catch (Exception e) {
            return ResponseEntity.ok(new StreakDto(0, 0, 3, null));
        }
    }
}
