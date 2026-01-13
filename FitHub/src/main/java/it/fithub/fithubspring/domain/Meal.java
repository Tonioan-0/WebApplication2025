package it.fithub.fithubspring.domain;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class Meal {
    private Long id;
    private Long userId;
    private String name;
    private Integer totalCalories;
    private LocalDateTime dateEaten;
    private List<MealItem> items = new ArrayList<>();
}