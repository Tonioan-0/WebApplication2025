package it.fithub.fithubspring.controller.workout;

import it.fithub.fithubspring.dto.workout.WorkoutPlanDto;
import it.fithub.fithubspring.service.WorkoutPlansService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/workout-plans")
@CrossOrigin(origins = "http://localhost:4200")
public class WorkoutPlansController {
    private final WorkoutPlansService service;

    public WorkoutPlansController(WorkoutPlansService service) {
        this.service = service;
    }

    @PostMapping
    public WorkoutPlanDto create(@Valid @RequestBody WorkoutPlanDto plan) {
        return service.create(plan);
    }

    @GetMapping("/active")
    public List<WorkoutPlanDto> active(
            @RequestParam Long userId,
            @RequestParam(required = false) String referenceDate) {
        LocalDate ref = (referenceDate == null || referenceDate.isBlank())
                ? LocalDate.now()
                : LocalDate.parse(referenceDate);
        return service.active(userId, ref);
    }

    @GetMapping("/expired")
    public List<WorkoutPlanDto> expired(@RequestParam Long userId) {
        return service.expired(userId, LocalDate.now());
    }

    @DeleteMapping("/{planId}")
    public void delete(@PathVariable Long planId) {
        service.delete(planId);
    }
}
