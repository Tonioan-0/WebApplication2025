import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkoutPlan } from '../models/workout-plan.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WorkoutPlansService {
  private apiUrl = `${environment.apiUrl}/workout-plans`;

  constructor(private http: HttpClient) {}

  // ---------- CREATE ----------
  create(plan: WorkoutPlan): Observable<WorkoutPlan> {
    return this.http.post<WorkoutPlan>(this.apiUrl, plan, { withCredentials: true });
  }

  // ---------- UPDATE ----------
  update(id: number, plan: WorkoutPlan): Observable<WorkoutPlan> {
    return this.http.put<WorkoutPlan>(`${this.apiUrl}/${id}`, plan, { withCredentials: true });
  }

  // ---------- GET ACTIVE ----------
  getActive(referenceDate?: string): Observable<WorkoutPlan[]> {
    let params = new HttpParams();
    if (referenceDate) params = params.set('referenceDate', referenceDate);
    return this.http.get<WorkoutPlan[]>(`${this.apiUrl}/active`, { params, withCredentials: true });
  }

  // ---------- GET EXPIRED ----------

  getExpired(): Observable<WorkoutPlan[]> {
    return this.http.get<WorkoutPlan[]>(`${this.apiUrl}/expired`, { withCredentials: true });
  }

  // ---------- DELETE ----------
  deletePlan(planId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${planId}`, { withCredentials: true });
  }

  // ---------- COMPLETE ----------
  completeWorkout(planId: number, completedDate: string, dayOfWeek: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${planId}/complete`,
      { planId, completedDate, dayOfWeek },
      { withCredentials: true }
    );
  }
}
