package it.fithub.fithubspring.repository;

import it.fithub.fithubspring.dto.workout.CompletedWorkoutDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

@Repository
public class CompletedWorkoutRepository {
    private final JdbcTemplate jdbc;

    public CompletedWorkoutRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }
    /*Salva un workout completato */
    public CompletedWorkoutDto save(Long userId, Long planId, LocalDate completedDate, String dayOfWeek) {
        /*Controlla se esiste già */
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM completed_workout WHERE user_id = ? AND plan_id = ? AND completed_date = ? AND day_of_week = ?",
            Integer.class,
            userId, planId, Date.valueOf(completedDate), dayOfWeek
        );
        
        if (count != null && count > 0) {
            /*Se esiste già, restituisce l'oggetto esistente (ottieni l'id) */
            Long existingId = jdbc.queryForObject(
                "SELECT id FROM completed_workout WHERE user_id = ? AND plan_id = ? AND completed_date = ? AND day_of_week = ?",
                Long.class,
                userId, planId, Date.valueOf(completedDate), dayOfWeek
            );
            return new CompletedWorkoutDto(existingId, planId, userId, completedDate, dayOfWeek);
        }
        
        /*Inserisci un nuovo record */
        Long id = jdbc.queryForObject(
            "INSERT INTO completed_workout (plan_id, user_id, completed_date, day_of_week) VALUES (?, ?, ?, ?) RETURNING id",
            Long.class,
            planId, userId, Date.valueOf(completedDate), dayOfWeek
        );
        return new CompletedWorkoutDto(id, planId, userId, completedDate, dayOfWeek);
    }

    /*Tutti i workout completati da un utente in un range di date */
    public List<CompletedWorkoutDto> findByUserAndDateRange(Long userId, LocalDate from, LocalDate to) {
        return jdbc.query(
            """
            SELECT id, plan_id, user_id, completed_date, day_of_week
            FROM completed_workout
            WHERE user_id = ? AND completed_date BETWEEN ? AND ?
            ORDER BY completed_date DESC
            """,
            (rs, i) -> new CompletedWorkoutDto(
                rs.getLong("id"),
                rs.getLong("plan_id"),
                rs.getLong("user_id"),
                rs.getDate("completed_date").toLocalDate(),
                rs.getString("day_of_week")
            ),
            userId, Date.valueOf(from), Date.valueOf(to)
        );
    }
    
    /*Controlla se esiste già un workout completato per una data specifica */
    public boolean existsForDate(Long userId, Long planId, LocalDate date, String dayOfWeek) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM completed_workout WHERE user_id = ? AND plan_id = ? AND completed_date = ? AND day_of_week = ?",
            Integer.class,
            userId, planId, Date.valueOf(date), dayOfWeek
        );
        return count != null && count > 0;
    }

    /*Tutte le date di completamento di un utente */
    public List<LocalDate> getCompletedDates(Long userId) {
        return jdbc.query(
            """
            SELECT DISTINCT completed_date 
            FROM completed_workout 
            WHERE user_id = ? 
            ORDER BY completed_date DESC
            """,
            (rs, i) -> rs.getDate("completed_date").toLocalDate(),
            userId
        );
    }

    /*Ultima data di completamento di un utente */ 
    public LocalDate getLastCompletedDate(Long userId) {
        List<LocalDate> dates = jdbc.query(
            """
            SELECT completed_date 
            FROM completed_workout 
            WHERE user_id = ? 
            ORDER BY completed_date DESC 
            LIMIT 1
            """,
            (rs, i) -> rs.getDate("completed_date").toLocalDate(),
            userId
        );
        return dates.isEmpty() ? null : dates.get(0);
    }

    /*Conteggio totale dei workout completati da un utente */
    public int countTotalWorkouts(Long userId) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM completed_workout WHERE user_id = ?",
            Integer.class,
            userId
        );
        return count != null ? count : 0;
    }
}

