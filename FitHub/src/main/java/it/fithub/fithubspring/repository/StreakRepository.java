package it.fithub.fithubspring.repository;

import it.fithub.fithubspring.dto.workout.StreakDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

/*Scrive in app_user dati relativi allo streak */
@Repository
public class StreakRepository {
    private final JdbcTemplate jdbc;

    public StreakRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /*Recupera lo streak di un utente */
    public StreakDto getStreak(Long userId, int weeklyTarget) {
        return jdbc.queryForObject(
            """
            SELECT current_streak, weekly_workouts_done, week_start_date, last_workout_date
            FROM app_user WHERE id = ?
            """,
            (rs, i) -> {
                int currentStreak = rs.getInt("current_streak");
                int weeklyDone = rs.getInt("weekly_workouts_done");
                Date lastWorkoutDate = rs.getDate("last_workout_date");
                String lastWorkoutStr = lastWorkoutDate != null ? lastWorkoutDate.toLocalDate().toString() : null;
                return new StreakDto(currentStreak, weeklyDone, weeklyTarget, lastWorkoutStr);
            },
            userId
        );
    }

    /*
        Registra il completamento di un allenamento e aggiorna la serie (streak).
        Logica:
        - Controlla se siamo in una nuova settimana → resetta il contatore settimanale
        - Incrementa il contatore settimanale
        - Se l'obiettivo settimanale è raggiunto → incrementa la serie, resetta il contatore settimanale
     */
    public void recordWorkout(Long userId, int weeklyTarget) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        /*Recupera i dati dello streak di un utente */
        var data = jdbc.queryForMap(
            "SELECT current_streak, weekly_workouts_done, week_start_date, last_workout_date FROM app_user WHERE id = ?",
            userId
        );

        int currentStreak = data.get("current_streak") != null ? ((Number) data.get("current_streak")).intValue() : 0;
        int weeklyDone = data.get("weekly_workouts_done") != null ? ((Number) data.get("weekly_workouts_done")).intValue() : 0;
        Date storedWeekStart = (Date) data.get("week_start_date");
        Date lastWorkout = (Date) data.get("last_workout_date");

        /*Controlla se siamo in una nuova settimana */
        if (storedWeekStart == null || !storedWeekStart.toLocalDate().equals(weekStart)) {
            if (storedWeekStart != null && weeklyDone < weeklyTarget) {
                currentStreak = 0;
            }
            weeklyDone = 0;
        }

        /*Previene il conteggio dello stesso giorno due volte */
        if (lastWorkout != null && lastWorkout.toLocalDate().equals(today)) {
            return;
        }

        /*Incrementa il contatore settimanale */
        weeklyDone++;

        /*Controlla se l'obiettivo settimanale è raggiunto */
        if (weeklyDone >= weeklyTarget) {
            currentStreak++;
        }

        /*Aggiorna lo streak */
        jdbc.update(
            """
            UPDATE app_user 
            SET current_streak = ?, weekly_workouts_done = ?, week_start_date = ?, last_workout_date = ?
            WHERE id = ?
            """,
            currentStreak, weeklyDone, Date.valueOf(weekStart), Date.valueOf(today), userId
        );
    }

    /*Resetta streak */
    public void resetStreak(Long userId) {
        jdbc.update(
            "UPDATE app_user SET current_streak = 0, weekly_workouts_done = 0 WHERE id = ?",
            userId
        );
    }
}
