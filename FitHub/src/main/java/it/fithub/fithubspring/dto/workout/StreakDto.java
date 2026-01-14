package it.fithub.fithubspring.dto.workout;

public record StreakDto(
    int currentStreak,
    int weeklyWorkoutsDone,
    int weeklyTarget,
    String lastWorkoutDate
) {}
