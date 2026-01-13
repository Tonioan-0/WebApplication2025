import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FoodService } from '../../../services/food.service';
import { FoodProduct, SavedMeal } from '../../../models/food.model';
import { MealService } from '../../../services/meal.service';

@Component({
  selector: 'app-nutrition-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nutrition-planner.component.html',
  styleUrl: './nutrition-planner.component.css'
})
export class NutritionPlannerComponent implements OnInit {

  searchQuery: string = '';
  searchResults: FoodProduct[] = [];
  isLoading: boolean = false;

  selectedFood: FoodProduct | null = null;
  inputGrams: number = 100;
  myMeal: any[] = [];
  totals = { calories: 0, proteins: 0, carbs: 0, fats: 0 };
  mealHistory: SavedMeal[] = [];

  expandedMealId: number | null = null;
  editingItemId: number | null = null;

  showDeleteModal: boolean = false;
  mealIdToDelete: number | null = null;
  showDeleteItemModal: boolean = false;
  itemIdToDelete: number | null = null;
  showSaveModal: boolean = false;
  mealNameInput: string = "Champion's Lunch"; //default view
  alertMessage: string | null = null;
  alertType: 'success' | 'error' | 'warning' = 'success';

  private searchRequest: Subscription | null = null;

  constructor(
    private foodService: FoodService,
    private mealService: MealService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() { this.loadHistory(); }

  loadHistory() {
    this.mealService.getMyMeals().subscribe({
      next: (data) => {
        this.mealHistory = data;
        this.cd.detectChanges();
      },
      error: () => console.error()
    });
  }

  openSaveModal() {
    if (this.myMeal.length === 0) {
      this.showAlert('Your plate is empty! Add some food first.', 'warning');
      return;
    }
    this.showSaveModal = true;
  }

  confirmSaveMeal() {
    if (!this.mealNameInput.trim()) return;

    const requestData = {
      name: this.mealNameInput,
      items: this.myMeal
    };

    this.mealService.saveMeal(requestData).subscribe({
      next: () => {
        this.showSaveModal = false;
        this.showAlert('Meal saved successfully!', 'success');

        // Reset
        this.myMeal = [];
        this.mealNameInput = "Champion's Lunch";
        this.updateTotals();
        this.loadHistory();
      },
      error: () => {
        this.showSaveModal = false;
        this.showAlert('Error saving meal. Is the backend running?', 'error');
      }
    });
  }

  askDeleteItem(itemId: number) {
    this.itemIdToDelete = itemId;
    this.showDeleteItemModal = true;
  }

  confirmDeleteItem() {
    if (this.itemIdToDelete) {
      this.mealService.deleteItem(this.itemIdToDelete).subscribe({
        next: () => {
          this.loadHistory();
          this.closeModal();
        },
        error: () => this.showAlert('Error deleting item', 'error')
      });
    }
  }


  askDeleteConfirmation(mealId: number) {
    this.mealIdToDelete = mealId;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (this.mealIdToDelete !== null) {
      this.mealService.deleteMeal(this.mealIdToDelete).subscribe({
        next: () => {
          this.loadHistory();
          this.closeModal();
          this.showAlert('Meal deleted successfully', 'success');
        },
        error: () => {
          this.closeModal();
          this.showAlert('Error deleting meal', 'error');
        }
      });
    }
  }


  updateItemInBackend(item: any, newGrams: number) {
    if(!newGrams || newGrams <= 0) return;

    const oldGrams = item.grams;
    const factor = newGrams / oldGrams;

    const updatedDTO = {
      grams: newGrams,
      calories: Math.round(item.calories * factor),
      proteins: item.proteins * factor,
      carbs: item.carbs * factor,
      fats: item.fats * factor
    };

    this.mealService.updateItem(item.id, updatedDTO).subscribe({
      next: () => {
        this.loadHistory();
        this.editingItemId = null;
      },
      error: () => this.showAlert("Error updating item", 'error')
    });
  }


  closeModal() {
    this.showDeleteModal = false;
    this.showDeleteItemModal = false;
    this.showSaveModal = false;
    this.mealIdToDelete = null;
    this.itemIdToDelete = null;
  }

  showAlert(message: string, type: 'success' | 'error' | 'warning') {
    this.alertMessage = message;
    this.alertType = type;

  }

  closeAlert() {
    this.alertMessage = null;
  }


  closeSearch() {
    this.searchResults = [];
  }

  searchFood() {
    if (!this.searchQuery || this.searchQuery.trim().length < 2) {
      this.isLoading = false;
      return;
    }
    if (this.searchRequest) this.searchRequest.unsubscribe();

    this.isLoading = true;
    this.searchResults = [];

    this.searchRequest = this.foodService.searchFood(this.searchQuery)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.searchRequest = null;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: (results) => this.searchResults = results,
        error: () => this.isLoading = false
      });
  }

  selectFood(food: FoodProduct) {
    this.selectedFood = food;
    this.inputGrams = 100;
    this.searchResults = [];
    this.searchQuery = '';
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

  toggleDetails(mealId: number) {
    if (this.expandedMealId === mealId) {
      this.expandedMealId = null;
    } else {
      this.expandedMealId = mealId;
      this.editingItemId = null;
    }
  }

  startEditing(item: any) {
    this.editingItemId = item.id;
  }
}
