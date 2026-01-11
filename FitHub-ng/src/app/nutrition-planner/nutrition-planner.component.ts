import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FoodService } from '../services/food.service';
import { FoodProduct } from '../models/food.model';

@Component({
  selector: 'app-nutrition-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nutrition-planner.component.html',
  styleUrl: './nutrition-planner.component.css'
})
export class NutritionPlannerComponent {

  searchQuery: string = '';
  searchResults: FoodProduct[] = [];
  isLoading: boolean = false;

  selectedFood: FoodProduct | null = null;
  inputGrams: number = 100;
  myMeal: any[] = [];

  totals = { calories: 0, proteins: 0, carbs: 0, fats: 0 };

  private searchRequest: Subscription | null = null;

  constructor(
    private foodService: FoodService,
    private cd: ChangeDetectorRef
  ) {}

  closeSearch() {
    this.searchResults = [];
    this.cd.detectChanges();
  }

  onInputChange() {
    if (this.isLoading) {
      this.isLoading = false;
    }
  }

  searchFood() {
    if (!this.searchQuery || this.searchQuery.trim().length < 2) {
      this.isLoading = false;
      return;
    }

    if (this.searchRequest) {
      this.searchRequest.unsubscribe();
    }

    this.isLoading = true;
    this.searchResults = [];

    this.searchRequest = this.foodService.searchFood(this.searchQuery)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.searchRequest = null;
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: (results) => {
          this.searchResults = results;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('API Error:', err);
          this.isLoading = false;
          this.cd.detectChanges();
        }
      });
  }


  selectFood(food: FoodProduct) {
    this.selectedFood = food;
    this.inputGrams = 100;
    this.searchResults = []; // Chiude la lista dopo la selezione
    this.searchQuery = '';
    this.cd.detectChanges(); // Aggiorna vista
  }

  addToMeal() {
    if (this.selectedFood) {
      const multiplier = this.inputGrams / 100;
      const calculatedItem = {
        name: this.selectedFood.name,
        grams: this.inputGrams,
        image: this.selectedFood.image || 'https://placehold.co/300x200/png?text=No+Image',
        calories: Math.round(this.selectedFood.nutriments.calories * multiplier),
        proteins: Math.round(this.selectedFood.nutriments.proteins * multiplier),
        carbs: Math.round(this.selectedFood.nutriments.carbohydrates * multiplier),
        fats: Math.round(this.selectedFood.nutriments.fats * multiplier)
      };
      this.myMeal.push(calculatedItem);
      this.updateTotals();
      this.selectedFood = null;
    }
  }

  removeFromMeal(index: number) {
    this.myMeal.splice(index, 1);
    this.updateTotals();
  }

  updateTotals() {
    this.totals = { calories: 0, proteins: 0, carbs: 0, fats: 0 };
    for (let item of this.myMeal) {
      this.totals.calories += item.calories;
      this.totals.proteins += item.proteins;
      this.totals.carbs += item.carbs;
      this.totals.fats += item.fats;
    }
  }
}
