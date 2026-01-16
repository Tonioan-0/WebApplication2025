package it.fithub.fithubspring.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import it.fithub.fithubspring.domain.proxy.WorkoutPlanProxy;
import it.fithub.fithubspring.dto.workout.WorkoutItemDto;
import it.fithub.fithubspring.dto.workout.WorkoutPlanDto;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

@Repository
public class WorkoutPlansRepository {
    private final JdbcTemplate jdbc;

    public WorkoutPlansRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }
    /*Crea un nuovo workout plan */
    @Transactional
    public WorkoutPlanDto create(WorkoutPlanDto plan) {
        Long planId = jdbc.queryForObject(
                "INSERT INTO workout_plan (user_id, title, start_date, end_date) VALUES (?, ?, ?, ?) RETURNING id",
                Long.class,
                plan.getUserId(),
                plan.getTitle(),
                Date.valueOf(plan.getStartDate()),
                Date.valueOf(plan.getEndDate()));

        insertItems(planId, plan.getItems());

        return new WorkoutPlanDto(planId, plan.getUserId(), plan.getTitle(), plan.getStartDate(), plan.getEndDate(), plan.getItems());
    }

    /*Aggiorna un workout plan esistente */
    @Transactional
    public WorkoutPlanDto update(Long planId, WorkoutPlanDto plan) {
        jdbc.update(
                "UPDATE workout_plan SET title = ?, start_date = ?, end_date = ? WHERE id = ?",
                plan.getTitle(),
                Date.valueOf(plan.getStartDate()),
                Date.valueOf(plan.getEndDate()),
                planId);

        jdbc.update("DELETE FROM workout_item WHERE plan_id = ?", planId);
        insertItems(planId, plan.getItems());

        return new WorkoutPlanDto(planId, plan.getUserId(), plan.getTitle(), plan.getStartDate(), plan.getEndDate(), plan.getItems());
    }

    /*Inserisce gli item di un workout plan */
    private void insertItems(Long planId, List<WorkoutItemDto> items) {
        for (WorkoutItemDto item : items) {
            jdbc.update(
                    "INSERT INTO workout_item (plan_id, exercise_id, day_of_week, position, sets, reps, note) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    planId,
                    item.exerciseId(),
                    item.dayOfWeek(),
                    item.position(),
                    item.sets(),
                    item.reps(),
                    item.note());
        }
    }

    // PROXY PATTERN: Carica i piani attivi con lazy loading degli items
    public List<WorkoutPlanDto> findActive(Long userId, LocalDate referenceDate) {
        // System.out.println(">>> SCHEDE: Caricamento schede ATTIVE per user ID: " + userId);
        String sql = """
                  SELECT id, user_id, title, start_date, end_date
                  FROM workout_plan
                  WHERE user_id = ?
                    AND start_date <= ?
                    AND end_date >= ?
                  ORDER BY start_date DESC, id DESC
                """;
        return jdbc.query(sql, (rs, i) -> {
            Long planId = rs.getLong("id");
            Long planUserId = rs.getLong("user_id");
            String title = rs.getString("title");
            LocalDate startDate = rs.getDate("start_date").toLocalDate();
            LocalDate endDate = rs.getDate("end_date").toLocalDate();
            
            // Crea il proxy con lazy loading: gli items vengono caricati solo quando richiesti
            return new WorkoutPlanProxy(planId, planUserId, title, startDate, endDate,
                    () -> findItemsByPlanId(planId));
        }, userId, Date.valueOf(referenceDate), Date.valueOf(referenceDate));
    }

    // Carica gli items di un piano specifico
    public List<WorkoutItemDto> findItemsByPlanId(Long planId) {
        return jdbc.query(
                """
                SELECT id, exercise_id, day_of_week, position, sets, reps, note
                FROM workout_item
                WHERE plan_id = ?
                ORDER BY day_of_week, position ASC
                """,
                (rs, i) -> new WorkoutItemDto(
                        rs.getLong("id"),
                        rs.getLong("exercise_id"),
                        rs.getString("day_of_week"),
                        rs.getInt("position"),
                        rs.getInt("sets"),
                        rs.getInt("reps"),
                        rs.getString("note")),
                planId);
    }

    // PROXY PATTERN: Carica i piani scaduti con lazy loading degli items
    public List<WorkoutPlanDto> findExpired(Long userId, LocalDate referenceDate) {
        // System.out.println(">>> SCHEDE: Caricamento schede SCADUTE per user ID: " + userId);
        String sql = """
                  SELECT id, user_id, title, start_date, end_date
                  FROM workout_plan
                  WHERE user_id = ?
                    AND end_date < ?
                  ORDER BY end_date DESC, id DESC
                """;
        return jdbc.query(sql, (rs, i) -> {
            Long planId = rs.getLong("id");
            Long planUserId = rs.getLong("user_id");
            String title = rs.getString("title");
            LocalDate startDate = rs.getDate("start_date").toLocalDate();
            LocalDate endDate = rs.getDate("end_date").toLocalDate();
            
            // Crea il proxy con lazy loading
            return new WorkoutPlanProxy(planId, planUserId, title, startDate, endDate,
                    () -> findItemsByPlanId(planId));
        }, userId, Date.valueOf(referenceDate));
    }

    /*Elimina un allenamento esistente */
    public void delete(Long planId) {
        jdbc.update("DELETE FROM workout_plan WHERE id = ?", planId);
    }


}
