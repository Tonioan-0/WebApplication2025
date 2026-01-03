import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExercisePreset } from '../models/exercise.model';

@Injectable({ providedIn: 'root' })
export class ExercisesService {
  private apiUrl = 'http://localhost:8081/api/exercises';

  constructor(private http: HttpClient) {}

  getPresets(): Observable<ExercisePreset[]> {
    return this.http.get<ExercisePreset[]>(this.apiUrl);
  }
}
