package it.fithub.fithubspring.dto.workout;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public class WorkoutPlanDto {
    private Long id;
    private Long userId;
    
    @NotEmpty
    private String title;
    
    @NotNull
    private LocalDate startDate;
    
    @NotNull
    private LocalDate endDate;
    
    @NotNull
    private List<WorkoutItemDto> items;

    public WorkoutPlanDto() {}

    public WorkoutPlanDto(Long id, Long userId, String title, LocalDate startDate, LocalDate endDate, List<WorkoutItemDto> items) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.startDate = startDate;
        this.endDate = endDate;
        this.items = items;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public List<WorkoutItemDto> getItems() { return items; }
    public void setItems(List<WorkoutItemDto> items) { this.items = items; }
}
