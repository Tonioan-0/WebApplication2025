package it.fithub.fithubspring.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import it.fithub.fithubspring.dto.workout.WorkoutDayDto;
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
                "INSERT INTO workout_plan (user_id, start_date, end_date) VALUES (?, ?, ?) RETURNING id",
                Long.class,
                plan.userId(),
                Date.valueOf(plan.startDate()),
                Date.valueOf(plan.endDate()));

        for (WorkoutDayDto day : plan.days()) {
            Long dayId = jdbc.queryForObject(
                    "INSERT INTO workout_day (plan_id, day_of_week, title) VALUES (?, ?, ?) RETURNING id",
                    Long.class,
                    planId,
                    day.dayOfWeek(),
                    day.title());

            for (WorkoutItemDto item : day.items()) {
                jdbc.update(
                        "INSERT INTO workout_item (day_id, exercise_id, position, sets, reps, note) VALUES (?, ?, ?, ?, ?, ?)",
                        dayId,
                        item.exerciseId(),
                        item.position(),
                        item.sets(),
                        item.reps(),
                        item.note());
            }
        }

        return new WorkoutPlanDto(planId, plan.userId(), plan.startDate(), plan.endDate(), plan.days());
    }

    public List<WorkoutPlanDto> findActive(Long userId, LocalDate referenceDate) {
        String sql = """
                  SELECT id, user_id, start_date, end_date
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
                    "SELECT id, user_id, start_date, end_date FROM workout_plan WHERE id = ? AND user_id = ?",
                    (rs, i) -> new Object[] {
                            rs.getLong("id"),
                            rs.getLong("user_id"),
                            rs.getDate("start_date").toLocalDate(),
                            rs.getDate("end_date").toLocalDate()
                    },
                    planId, userId);

            @SuppressWarnings("unchecked")
            LocalDate start = (LocalDate) header[2];
            LocalDate end = (LocalDate) header[3];

            List<WorkoutDayDto> days = jdbc.query(
                    "SELECT id, day_of_week, title FROM workout_day WHERE plan_id = ? ORDER BY id ASC",
                    (rs, i) -> {
                        long dayId = rs.getLong("id");
                        String dow = rs.getString("day_of_week");
                        String title = rs.getString("title");

                        List<WorkoutItemDto> items = jdbc.query(
                                """
                                        SELECT id, exercise_id, position, sets, reps, note
                                        FROM workout_item
                                        WHERE day_id = ?
                                        ORDER BY position ASC
                                        """,
                                (rsi, j) -> new WorkoutItemDto(
                                        rsi.getLong("id"),
                                        rsi.getLong("exercise_id"),
                                        rsi.getInt("position"),
                                        rsi.getInt("sets"),
                                        rsi.getInt("reps"),
                                        rsi.getString("note")),
                                dayId);

                        return new WorkoutDayDto(dow, title, items);
                    },
                    planId);

            out.add(new WorkoutPlanDto(planId, userId, start, end, days));
        }
        return out;
    }
}
