package it.fithub.fithubspring.dto;

import lombok.Data;

@Data
public class MealItemDTO {
    private String name;
    private String image;
    private Integer grams;
    private Integer calories;
    private Double proteins;
    private Double carbs;
    private Double fats;
}