package it.fithub.fithubspring.dto.workout;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

public record CompletedWorkoutDto(
        Long id,
        Long planId,
        Long userId,
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate completedDate,
        String dayOfWeek
) {}
