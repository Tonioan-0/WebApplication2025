export interface FoodProduct {
  name: string;
  image?: string;
  nutriments: {
    calories: number;      // energy-kcal_100g
    proteins: number;      // proteins_100g
    carbohydrates: number; // carbohydrates_100g
    fats: number;          // fat_100g
  };
}

export interface SavedMealItem {
  id: number;
  foodName: string;
  imageUrl?: string;
  grams: number;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
}

export interface SavedMeal {
  id: number;
  name: string;
  totalCalories: number;
  dateEaten: string;
  items: SavedMealItem[];
}
