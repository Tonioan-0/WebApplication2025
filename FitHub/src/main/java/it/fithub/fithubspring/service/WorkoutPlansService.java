package it.fithub.fithubspring.service;

import it.fithub.fithubspring.repository.WorkoutPlansRepository;
import it.fithub.fithubspring.dto.workout.WorkoutPlanDto;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class WorkoutPlansService {
    private final WorkoutPlansRepository repo;

    public WorkoutPlansService(WorkoutPlansRepository repo) {
        this.repo = repo;
    }

    public WorkoutPlanDto create(WorkoutPlanDto plan) {
        LocalDate today = LocalDate.now();
        if (plan.startDate().isBefore(today)) {
            throw new IllegalArgumentException("startDate must be >= today");
        }
        if (plan.endDate().isBefore(plan.startDate())) {
            throw new IllegalArgumentException("endDate must be >= startDate");
        }
        return repo.create(plan);
    }

    public List<WorkoutPlanDto> active(Long userId, LocalDate referenceDate) {
        return repo.findActive(userId, referenceDate);
    }

    public List<WorkoutPlanDto> expired(Long userId, LocalDate referenceDate) {
        return repo.findExpired(userId, referenceDate);
    }

    public void delete(Long planId) {
        repo.delete(planId);
    }
}
