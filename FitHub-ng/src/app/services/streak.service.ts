import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Streak } from '../models/streak.model';

@Injectable({ providedIn: 'root' })
export class StreakService {
  private readonly apiUrl = `${environment.apiUrl}/workout-plans`;

  private streakSubject = new BehaviorSubject<Streak>({
    currentStreak: 0,
    weeklyWorkoutsDone: 0,
    weeklyTarget: 3,
    lastWorkoutDate: null
  });

  public streak$ = this.streakSubject.asObservable();

  constructor(private http: HttpClient) {}

  /*Aggiorna lo stato del streak*/ 
  refreshStreak(): void {
    this.http.get<Streak>(`${this.apiUrl}/streak`, { withCredentials: true })
      .pipe(
        catchError(() => of({ currentStreak: 0, weeklyWorkoutsDone: 0, weeklyTarget: 3, lastWorkoutDate: null }))
      )
      .subscribe(data => {
        this.streakSubject.next(data);
      });
  }

  // Per testing (path Simone)
  // /Library/PostgreSQL/18/bin/psql -U postgres -d FitHub -c "UPDATE app_user SET current_streak = VALORE_STERAK;"
  
  /*Imposta Icona e Testo */
  getStreakIcon(streak: number): 'frozen' | 'fire-small' | 'fire-medium' | 'fire-large' | 'star' | 'trophy' {
    if (streak === 0) return 'frozen';
    if (streak <= 4) return 'fire-small';
    if (streak <= 9) return 'fire-medium';
    if (streak <= 24) return 'fire-large';
    if (streak <= 49) return 'star';
    return 'trophy';
  }
  getStreakLabel(streak: number): string {
    if (streak === 0) return 'Inizia oggi!';
    if (streak === 1) return '1 allenamento';
    return `${streak} allenamenti`;
  }
}
