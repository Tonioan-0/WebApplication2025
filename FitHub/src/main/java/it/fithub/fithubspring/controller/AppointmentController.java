package it.fithub.fithubspring.controller;

import it.fithub.fithubspring.dto.AppointmentDTO;
import it.fithub.fithubspring.dto.AppointmentRequest;
import it.fithub.fithubspring.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public ResponseEntity<List<AppointmentDTO>> getMyAppointments() {
        // TODO: Get userId from security context
        Long userId = 1L;
        return ResponseEntity.ok(appointmentService.getUserAppointments(userId));
    }

    @PostMapping
    public ResponseEntity<Void> createAppointment(@RequestBody AppointmentRequest request) {
        // TODO: Get userId from security context
        Long userId = 1L;
        appointmentService.createAppointment(userId, request.title(), request.type(), request.location(),
                request.dateTime());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateAppointment(@PathVariable Long id, @RequestBody AppointmentRequest request) {
        // TODO: Get userId from security context
        Long userId = 1L;
        appointmentService.updateAppointment(id, userId, request.title(), request.type(), request.location(),
                request.dateTime());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        // TODO: Get userId from security context
        Long userId = 1L;
        appointmentService.deleteAppointment(id, userId);
        return ResponseEntity.ok().build();
    }
}
