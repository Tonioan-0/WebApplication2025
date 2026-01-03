package it.fithub.fithubspring.dto.workout;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record WorkoutPlanDto(
                Long id,

                @NotNull @Min(1) Long userId,

                @NotNull LocalDate startDate,

                @NotNull LocalDate endDate,

                @NotEmpty List<WorkoutDayDto> days) {
}
