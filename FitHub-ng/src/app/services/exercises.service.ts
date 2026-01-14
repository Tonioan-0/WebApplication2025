import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExercisePreset } from '../models/exercise.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExercisesService {
  private apiUrl = `${environment.apiUrl}/exercises`;

  constructor(private http: HttpClient) {}

  getPresets(): Observable<ExercisePreset[]> {
    return this.http.get<ExercisePreset[]>(this.apiUrl, { withCredentials: true });
  }
}
