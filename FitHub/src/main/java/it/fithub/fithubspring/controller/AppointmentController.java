package it.fithub.fithubspring.controller;

import it.fithub.fithubspring.dto.AppointmentRequest;
import it.fithub.fithubspring.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:4200")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<Void> createAppointment(@RequestBody AppointmentRequest request) {
        // In a real app, you'd get the user's ID from the security context
        Long userId = 1L; // Placeholder for the current user's ID
        appointmentService.createAppointment(userId, request.location(), request.dateTime());
        return ResponseEntity.ok().build();
    }
}
