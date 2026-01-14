package it.fithub.fithubspring.controller;

import it.fithub.fithubspring.domain.Blacklist;
import it.fithub.fithubspring.domain.User;
import it.fithub.fithubspring.service.AdminService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // Banna un utente.
    // Body: { "userIdOrEmail": "...", "reason": "..." }
    @PostMapping("/ban")
    public ResponseEntity<?> banUser(@RequestBody Map<String, String> request, HttpSession session) {
        try {
            User admin = getAdminFromSession(session);

            String userIdOrEmail = request.get("userIdOrEmail");
            String reason = request.get("reason");

            if (userIdOrEmail == null || userIdOrEmail.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "ID o email utente richiesto"));
            }
            if (reason == null || reason.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Motivo del ban richiesto"));
            }

            Blacklist blacklist = adminService.banUser(admin.getId(), userIdOrEmail, reason);
            return ResponseEntity.ok(Map.of(
                    "message", "Utente bannato con successo",
                    "userId", blacklist.getUserId(),
                    "email", blacklist.getEmail()
            ));

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Errore durante il ban dell'utente"));
        }
    }

    // Rimuove il ban di un utente.
    @PostMapping("/unban/{userId}")
    public ResponseEntity<?> unbanUser(@PathVariable Long userId, HttpSession session) {
        try {
            getAdminFromSession(session);

            adminService.unbanUser(userId);
            return ResponseEntity.ok(Map.of("message", "Ban rimosso con successo"));

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Errore durante la rimozione del ban"));
        }
    }

    // Ottiene la lista degli utenti bannati.
    @GetMapping("/blacklist")
    public ResponseEntity<?> getBlacklist(HttpSession session) {
        try {
            getAdminFromSession(session);

            List<Blacklist> blacklist = adminService.getBlacklist();
            return ResponseEntity.ok(blacklist);

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Errore durante il recupero della blacklist"));
        }
    }

    // Verifica che l'utente in sessione sia un amministratore.
    private User getAdminFromSession(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new SecurityException("Non autenticato");
        }
        if (!Boolean.TRUE.equals(user.getIsAdmin())) {
            throw new SecurityException("Accesso negato: richiesti privilegi di amministratore");
        }
        return user;
    }
}
