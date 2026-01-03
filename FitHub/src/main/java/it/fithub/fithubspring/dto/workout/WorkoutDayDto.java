package it.fithub.fithubspring.dto.workout;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record WorkoutDayDto(
        @NotNull String dayOfWeek, // MONDAY...
        @NotEmpty String title,
        @NotNull List<WorkoutItemDto> items) {
}
