import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { FoodProduct } from '../models/food.model';

@Injectable({
  providedIn: 'root'
})
export class FoodService {

  //URL base di OpenFoodFacts per la ricerca testuale
  private apiUrl = 'https://world.openfoodfacts.org/cgi/search.pl';

  constructor(private http: HttpClient) { }

  searchFood(query: string): Observable<FoodProduct[]> {
    const url = `${this.apiUrl}?search_terms=${query}&search_simple=1&action=process&json=1`;

    return this.http.get<any>(url).pipe(
      map(response => {
        //OpenFoodFacts restituisce un oggetto con dentro un array "products".
        //Se non trova nulla, products potrebbe essere vuoto o undefined.
        if (!response.products) return [];

        return response.products.map((item: any) => ({
          name: item.product_name || 'Sconosciuto',
          image: item.image_url, //A volte può essere null
          nutriments: {
            calories: item.nutriments?.['energy-kcal_100g'] ?? 0,
            proteins: item.nutriments?.proteins_100g ?? 0,
            carbohydrates: item.nutriments?.carbohydrates_100g ?? 0,
            fats: item.nutriments?.fat_100g ?? 0
          }
        }));
      })
    );
  }
}
