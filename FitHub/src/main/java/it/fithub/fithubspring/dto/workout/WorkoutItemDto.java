package it.fithub.fithubspring.dto.workout;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record WorkoutItemDto(
        Long id,

        @NotNull @Min(1) Long exerciseId,

        @NotNull String dayOfWeek,

        @NotNull @Min(0) Integer position,

        @NotNull @Min(1) Integer sets,

        @NotNull @Min(1) Integer reps,

        String note) {
}
