package it.fithub.fithubspring.domain;

import lombok.Data;

@Data
public class MealItem {
    private Long id;
    private Long mealId;
    private String foodName;
    private String imageUrl;
    private Integer grams;
    private Integer calories;
    private Double proteins;
    private Double carbs;
    private Double fats;
}