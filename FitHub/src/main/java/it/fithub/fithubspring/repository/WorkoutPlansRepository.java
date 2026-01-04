package it.fithub.fithubspring.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import it.fithub.fithubspring.dto.workout.WorkoutItemDto;
import it.fithub.fithubspring.dto.workout.WorkoutPlanDto;

import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Repository
public class WorkoutPlansRepository {
    private final JdbcTemplate jdbc;

    public WorkoutPlansRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional
    public WorkoutPlanDto create(WorkoutPlanDto plan) {
        Long planId = jdbc.queryForObject(
                "INSERT INTO workout_plan (user_id, title, start_date, end_date) VALUES (?, ?, ?, ?) RETURNING id",
                Long.class,
                plan.userId(),
                plan.title(),
                Date.valueOf(plan.startDate()),
                Date.valueOf(plan.endDate()));

        for (WorkoutItemDto item : plan.items()) {
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

        return new WorkoutPlanDto(planId, plan.userId(), plan.title(), plan.startDate(), plan.endDate(), plan.items());
    }

    public List<WorkoutPlanDto> findActive(Long userId, LocalDate referenceDate) {
        String sql = """
                  SELECT id, user_id, title, start_date, end_date
                  FROM workout_plan
                  WHERE user_id = ?
                    AND start_date <= ?
                    AND end_date >= ?
                  ORDER BY start_date DESC, id DESC
                """;
        List<Long> planIds = jdbc.query(sql, (rs, i) -> rs.getLong("id"), userId, Date.valueOf(referenceDate),
                Date.valueOf(referenceDate));
        return loadPlansByIds(userId, planIds);
    }

    public List<WorkoutPlanDto> findExpired(Long userId, LocalDate referenceDate) {
        String sql = """
                  SELECT id
                  FROM workout_plan
                  WHERE user_id = ?
                    AND end_date < ?
                  ORDER BY end_date DESC, id DESC
                """;
        List<Long> planIds = jdbc.query(sql, (rs, i) -> rs.getLong("id"), userId, Date.valueOf(referenceDate));
        return loadPlansByIds(userId, planIds);
    }

    public void delete(Long planId) {
        jdbc.update("DELETE FROM workout_plan WHERE id = ?", planId);
    }

    private List<WorkoutPlanDto> loadPlansByIds(Long userId, List<Long> planIds) {
        List<WorkoutPlanDto> out = new ArrayList<>();
        for (Long planId : planIds) {
            var header = jdbc.queryForObject(
                    "SELECT id, user_id, title, start_date, end_date FROM workout_plan WHERE id = ? AND user_id = ?",
                    (rs, i) -> new Object[] {
                            rs.getLong("id"),
                            rs.getLong("user_id"),
                            rs.getString("title"),
                            rs.getDate("start_date").toLocalDate(),
                            rs.getDate("end_date").toLocalDate()
                    },
                    planId, userId);

            String title = (String) header[2];
            LocalDate start = (LocalDate) header[3];
            LocalDate end = (LocalDate) header[4];

            List<WorkoutItemDto> items = jdbc.query(
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

            out.add(new WorkoutPlanDto(planId, userId, title, start, end, items));
        }
        return out;
    }
}
