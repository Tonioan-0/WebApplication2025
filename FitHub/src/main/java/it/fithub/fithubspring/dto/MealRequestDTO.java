package it.fithub.fithubspring.dto;

import lombok.Data;
import java.util.List;

@Data
public class MealRequestDTO {
    private String name;
    private List<MealItemDTO> items;
}