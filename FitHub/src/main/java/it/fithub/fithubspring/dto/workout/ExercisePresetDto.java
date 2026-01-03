package it.fithub.fithubspring.dto.workout;

public record ExercisePresetDto(
        Long id,
        String name,
        String muscleGroup,
        String equipment) {
}
