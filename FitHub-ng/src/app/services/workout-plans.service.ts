import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkoutPlan } from '../models/workout-plan.model';

@Injectable({ providedIn: 'root' })
export class WorkoutPlansService {
  private apiUrl = 'http://localhost:8081/api/workout-plans';

  constructor(private http: HttpClient) {}

  create(plan: WorkoutPlan): Observable<WorkoutPlan> {
    return this.http.post<WorkoutPlan>(this.apiUrl, plan);
  }

  getActive(userId: number, referenceDate?: string): Observable<WorkoutPlan[]> {
    let params = new HttpParams().set('userId', String(userId));
    if (referenceDate) params = params.set('referenceDate', referenceDate);
    return this.http.get<WorkoutPlan[]>(`${this.apiUrl}/active`, { params });
  }

  getExpired(userId: number): Observable<WorkoutPlan[]> {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.get<WorkoutPlan[]>(`${this.apiUrl}/expired`, { params });
  }

  deletePlan(planId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${planId}`);
  }
}
