package it.fithub.fithubspring.service;

import it.fithub.fithubspring.repository.StreakRepository;
import it.fithub.fithubspring.repository.WorkoutPlansRepository;
import it.fithub.fithubspring.dto.workout.StreakDto;
import it.fithub.fithubspring.dto.workout.WorkoutPlanDto;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class WorkoutPlansService {
    private final WorkoutPlansRepository repo;
    private final StreakRepository streakRepo;

    public WorkoutPlansService(WorkoutPlansRepository repo, StreakRepository streakRepo) {
        this.repo = repo;
        this.streakRepo = streakRepo;
    }

    /* Crea un nuovo allenamento facendo check sulle date*/
    public WorkoutPlanDto create(WorkoutPlanDto plan) {
        LocalDate today = LocalDate.now();
        if (plan.getStartDate().isBefore(today)) {
            throw new IllegalArgumentException("startDate must be >= today");
        }
        if (plan.getEndDate().isBefore(plan.getStartDate())) {
            throw new IllegalArgumentException("endDate must be >= startDate");
        }
        return repo.create(plan);
    }

    /* Aggiorna un allenamento esistente facendo check sulle date*/
    /* Permette di aggiornare anche se la data di inizio è in passato/oggi */
    public WorkoutPlanDto update(Long id, WorkoutPlanDto plan) {
        if (plan.getEndDate().isBefore(plan.getStartDate())) {
            throw new IllegalArgumentException("endDate must be >= startDate");
        }
        return repo.update(id, plan);
    }

    /* Restituisce tutti gli allenamenti attivi per un utente */
    public List<WorkoutPlanDto> active(Long userId, LocalDate referenceDate) {
        return repo.findActive(userId, referenceDate);
    }

    /* Restituisce tutti gli allenamenti scaduti per un utente */
    public List<WorkoutPlanDto> expired(Long userId, LocalDate referenceDate) {
        return repo.findExpired(userId, referenceDate);
    }

    /* Elimina un allenamento esistente */
    public void delete(Long planId) {
        repo.delete(planId);
    }

    /* Completa un allenamento e aggiorna lo streak */
    public void completeWorkoutWithStreak(Long userId, Long planId) {
        int weeklyTarget = getWeeklyTargetForUser(userId);
        streakRepo.recordWorkout(userId, weeklyTarget);
    }

    /* Restituisce il target settimanale per l'utente */
    public int getWeeklyTargetForUser(Long userId) {
        List<WorkoutPlanDto> activePlans = repo.findActive(userId, LocalDate.now());
        
        if (activePlans.isEmpty()) {    //default a 3
            return 3;
        }
        //Conta giorni di allenamento per settimana
        WorkoutPlanDto plan = activePlans.get(0);
        if (plan.getItems() == null || plan.getItems().isEmpty()) {
            return 3;
        }
        
        Set<String> uniqueDays = new HashSet<>();
        plan.getItems().forEach(item -> uniqueDays.add(item.dayOfWeek()));
        return uniqueDays.size();
    }

    public StreakDto getStreak(Long userId) {
        int weeklyTarget = getWeeklyTargetForUser(userId);
        return streakRepo.getStreak(userId, weeklyTarget);
    }
}
