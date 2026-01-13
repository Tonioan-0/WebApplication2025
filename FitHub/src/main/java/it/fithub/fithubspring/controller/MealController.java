package it.fithub.fithubspring.controller;

import it.fithub.fithubspring.domain.Meal;
import it.fithub.fithubspring.domain.User;
import it.fithub.fithubspring.dto.MealItemDTO;
import it.fithub.fithubspring.dto.MealRequestDTO;
import it.fithub.fithubspring.service.MealService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meals")
public class MealController {

    private final MealService mealService;

    public MealController(MealService mealService) {
        this.mealService = mealService;
    }

    private Long getUserIdFromSession(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return null;
        }
        return user.getId();
    }

    @PostMapping
    public ResponseEntity<Meal> createMeal(@RequestBody MealRequestDTO request, HttpSession session) {
        Long userId = getUserIdFromSession(session);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Meal savedMeal = mealService.saveMeal(userId, request);
        return ResponseEntity.ok(savedMeal);
    }

    @GetMapping
    public ResponseEntity<List<Meal>> getMyMeals(HttpSession session) {
        Long userId = getUserIdFromSession(session);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(mealService.getUserHistory(userId));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<Void> updateMealItem(@PathVariable Long itemId, @RequestBody MealItemDTO updatedItem, HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        mealService.updateItem(itemId, updatedItem);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> deleteMealItem(@PathVariable Long itemId, HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        mealService.deleteItem(itemId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{mealId}")
    public ResponseEntity<Void> deleteMeal(@PathVariable Long mealId, HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        mealService.deleteMeal(mealId);
        return ResponseEntity.ok().build();
    }
}