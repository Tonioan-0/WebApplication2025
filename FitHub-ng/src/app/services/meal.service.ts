import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MealService {

  private apiUrl = `${environment.apiUrl}/meals`;

  constructor(private http: HttpClient) { }

  saveMeal(mealData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, mealData);
  }

  getMyMeals(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  updateItem(itemId: number, itemData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/items/${itemId}`, itemData, { withCredentials: true });
  }

  deleteItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/items/${itemId}`, { withCredentials: true });
  }

  deleteMeal(mealId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${mealId}`, { withCredentials: true });
  }
}
