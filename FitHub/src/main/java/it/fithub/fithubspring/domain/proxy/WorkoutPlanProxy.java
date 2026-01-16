package it.fithub.fithubspring.domain.proxy;

import it.fithub.fithubspring.dto.workout.WorkoutItemDto;
import it.fithub.fithubspring.dto.workout.WorkoutPlanDto;

import java.time.LocalDate;
import java.util.List;
import java.util.function.Supplier;

// chiamati con getItems() (proxy pattern)
public class WorkoutPlanProxy extends WorkoutPlanDto {

    private final Supplier<List<WorkoutItemDto>> itemsLoader;
    private boolean itemsLoaded = false;

    public WorkoutPlanProxy(Long id, Long userId, String title,
            LocalDate startDate, LocalDate endDate,
            Supplier<List<WorkoutItemDto>> itemsLoader) {
        super(id, userId, title, startDate, endDate, null);
        this.itemsLoader = itemsLoader;
    }

    @Override
    public List<WorkoutItemDto> getItems() {
        if (!itemsLoaded) {
            // per test proxy
            // System.out.println(">>> PROXY: Caricamento items per plan ID: " + getId());
            List<WorkoutItemDto> items = itemsLoader.get();
            super.setItems(items);
            itemsLoaded = true;
        }
        return super.getItems();
    }

    public boolean isItemsLoaded() {
        return itemsLoaded;
    }
}
