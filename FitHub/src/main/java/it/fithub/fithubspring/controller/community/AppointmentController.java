package it.fithub.fithubspring.controller.community;

import it.fithub.fithubspring.domain.User;

import it.fithub.fithubspring.dto.community.AppointmentDTO;
import it.fithub.fithubspring.dto.community.AppointmentRequest;
import it.fithub.fithubspring.service.community.AppointmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    private Long getUserIdFromSession(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return null;
        }
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<List<AppointmentDTO>> getMyAppointments(HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(appointmentService.getUserAppointments(userId));
    }

    @PostMapping
    public ResponseEntity<Void> createAppointment(@RequestBody AppointmentRequest request, HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        appointmentService.createAppointment(userId, request.title(), request.type(), request.location(),
                request.dateTime());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateAppointment(@PathVariable Long id, @RequestBody AppointmentRequest request,
            HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        appointmentService.updateAppointment(id, userId, request.title(), request.type(), request.location(),
                request.dateTime());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id, HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        appointmentService.deleteAppointment(id, userId);
        return ResponseEntity.ok().build();
    }
}
