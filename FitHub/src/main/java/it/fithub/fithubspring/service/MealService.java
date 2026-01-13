package it.fithub.fithubspring.service;

import it.fithub.fithubspring.domain.Meal;
import it.fithub.fithubspring.domain.MealItem;
import it.fithub.fithubspring.dto.MealItemDTO;
import it.fithub.fithubspring.dto.MealRequestDTO;
import it.fithub.fithubspring.repository.MealRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class MealService {

    private final MealRepository mealRepository;

    public MealService(MealRepository mealRepository) {
        this.mealRepository = mealRepository;
    }

    @Transactional
    public Meal saveMeal(Long userId, MealRequestDTO request) {

        Meal meal = new Meal();
        meal.setUserId(userId);
        meal.setName(request.getName());
        meal.setDateEaten(LocalDateTime.now());

        int totalCal = request.getItems().stream().mapToInt(MealItemDTO::getCalories).sum();
        meal.setTotalCalories(totalCal);

        Long newMealId = mealRepository.saveMeal(meal);
        meal.setId(newMealId);
        List<MealItem> savedItems = new ArrayList<>();

        for (MealItemDTO dto : request.getItems()) {
            MealItem item = new MealItem();
            item.setMealId(newMealId);
            item.setFoodName(dto.getName());
            item.setImageUrl(dto.getImage());
            item.setGrams(dto.getGrams());
            item.setCalories(dto.getCalories());
            item.setProteins(dto.getProteins());
            item.setCarbs(dto.getCarbs());
            item.setFats(dto.getFats());

            mealRepository.saveMealItem(item);
            savedItems.add(item);
        }

        meal.setItems(savedItems);
        return meal;
    }

    public List<Meal> getUserHistory(Long userId) {
        return mealRepository.findMealsByUserId(userId);
    }

    @Transactional
    public void updateItem(Long itemId, MealItemDTO dto) {
        if (dto.getGrams() <= 0) {
            throw new IllegalArgumentException("Grams must be positive");
        }
        mealRepository.updateMealItem(itemId, dto);
    }

    @Transactional
    public void deleteItem(Long itemId) {
        mealRepository.deleteMealItem(itemId);
    }

    @Transactional
    public void deleteMeal(Long mealId) {
        mealRepository.deleteMeal(mealId);
    }
}