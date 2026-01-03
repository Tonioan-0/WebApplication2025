package it.fithub.fithubspring.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import it.fithub.fithubspring.dto.workout.ExercisePresetDto;

import java.util.List;

@Repository
public class ExercisesRepository {
    private final JdbcTemplate jdbc;

    public ExercisesRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<ExercisePresetDto> findAll() {
        String sql = """
                  SELECT id, name, muscle_group, equipment, path
                  FROM exercise_preset
                  ORDER BY name ASC
                """;

        return jdbc.query(sql, (rs, i) -> new ExercisePresetDto(
                rs.getLong("id"),
                rs.getString("name"),
                rs.getString("muscle_group"),
                rs.getString("equipment"),
                rs.getString("path")));
    }
}
