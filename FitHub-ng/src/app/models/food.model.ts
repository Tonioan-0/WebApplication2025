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
