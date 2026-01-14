import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorkoutPlansService } from '../../../../services/workout-plans.service';
import { StreakService } from '../../../../services/streak.service';
import { ExercisesService } from '../../../../services/exercises.service';
import { WorkoutUtilsService } from '../../../../services/workout-utils.service';
import { WorkoutPlan, WorkoutPlanItem, DayOfWeek } from '../../../../models/workout-plan.model';
import { ExercisePreset } from '../../../../models/exercise.model';

type WorkoutState = 'loading' | 'idle' | 'in-progress' | 'completed' | 'no-plan';

interface DayExercises {
  dayOfWeek: DayOfWeek;
  dayLabel: string;
  items: WorkoutPlanItem[];
}

@Component({
  selector: 'app-active-workout-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './active-workout-card.html',
  styleUrl: './active-workout-card.css'
})
export class ActiveWorkoutCardComponent implements OnInit {
  @Output() workoutCompleted = new EventEmitter<void>();

  // Active plan and exercises
  activePlan: WorkoutPlan | null = null;
  todaysWorkout: DayExercises | null = null;
  exercisesMap: Map<number, ExercisePreset> = new Map();

  // Workout state
  workoutState: WorkoutState = 'loading';
  currentExerciseIndex = 0;
  completedExercises: Set<number> = new Set();

  constructor(
    private workoutService: WorkoutPlansService,
    private exercisesService: ExercisesService,
    private cdr: ChangeDetectorRef,
    public utils: WorkoutUtilsService,
    private streakService: StreakService
  ) {}

  ngOnInit(): void {
    this.loadExercises();
    this.loadActivePlan();
  }

  /*Scarica la lsita di tutti gli esercizi e li mappa per id */
  private loadExercises(): void {
    this.exercisesService.getPresets().subscribe({
      next: (exercises) => {
        exercises.forEach(ex => this.exercisesMap.set(ex.id, ex));
        if (this.activePlan) {
          this.enrichExercises();
        }
        this.cdr.detectChanges();
      }
    });
  }
  /*Scarica il piano di allenamento attivo*/
  private loadActivePlan(): void {
    this.workoutService.getActive().subscribe({
      next: (plans) => {
        if (plans.length > 0) {
          this.activePlan = plans[0];
          this.enrichExercises();
          this.findTodaysWorkout();
          this.workoutState = 'idle';
        } else {
          this.workoutState = 'no-plan';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.workoutState = 'no-plan';
        this.cdr.detectChanges();
      }
    });
  }

  /*Aggiugne dettagli alla scheda per allenamento*/
  /*activePlan da solo id esercizio conterrà tutti i dettagli */
  private enrichExercises(): void {
    if (!this.activePlan) return;
    this.activePlan.items.forEach(item => {
      item.exercise = this.exercisesMap.get(item.exerciseId);
    });
  }
  /*Trovare le esercizi per oggi, altrimenti il prossimo più vicino */
  /*todaysWorkout -> contiene activePlan realtivi ad oggi (tutti i dati)*/
  private findTodaysWorkout(): void {
    if (!this.activePlan) return;

    const currentDayIndex = this.utils.getCurrentDayIndex();
    const todayKey = this.utils.getCurrentDayKey();
    const itemsByDay = this.utils.groupItemsByDay(this.activePlan.items);

    // Cerca le esercizi per oggi
    if (itemsByDay.has(todayKey) && itemsByDay.get(todayKey)!.length > 0) {
      this.todaysWorkout = {
        dayOfWeek: todayKey,
        dayLabel: this.utils.getDayLabel(todayKey),
        items: itemsByDay.get(todayKey)!
      };
      return;
    }

    // Trova il prossimo giorno con esercizi
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (currentDayIndex + i) % 7;
      const nextDayKey = this.utils.dayOrder[nextDayIndex];
      if (itemsByDay.has(nextDayKey) && itemsByDay.get(nextDayKey)!.length > 0) {
        this.todaysWorkout = {
          dayOfWeek: nextDayKey,
          dayLabel: this.utils.getDayLabel(nextDayKey),
          items: itemsByDay.get(nextDayKey)!
        };
        return;
      }
    }

    this.workoutState = 'no-plan';
  }

  startWorkout(): void {
    this.workoutState = 'in-progress';
    this.currentExerciseIndex = 0;
    this.completedExercises.clear();
  }

  get currentExercise(): WorkoutPlanItem | null {
    if (!this.todaysWorkout || this.currentExerciseIndex >= this.todaysWorkout.items.length) {
      return null;
    }
    return this.todaysWorkout.items[this.currentExerciseIndex];
  }

  /*Progess bar */
  get progressPercentage(): number {
    if (!this.todaysWorkout || this.todaysWorkout.items.length === 0) return 0;
    return Math.round((this.completedExercises.size / this.todaysWorkout.items.length) * 100);
  }

  /*Completa l'esercizio corrente e passa al successivo */
  completeExercise(): void {
    if (!this.currentExercise) return;

    this.completedExercises.add(this.currentExerciseIndex);

    if (this.currentExerciseIndex < this.todaysWorkout!.items.length - 1) {
      this.currentExerciseIndex++;
    } else {
      this.finishWorkout();
    }
  }

  private finishWorkout(): void {
    if (!this.activePlan || !this.todaysWorkout) return;

    this.workoutService.completeWorkout(
      this.activePlan.id!,
      this.utils.todayISO(),
      this.todaysWorkout.dayOfWeek
    ).subscribe({
      next: () => {
        this.workoutState = 'completed';
        this.workoutCompleted.emit();
        this.streakService.refreshStreak(); // Trigger per aggiornaemnto streak
      },
      error: () => {
        this.workoutState = 'completed';
        this.workoutCompleted.emit();
        this.streakService.refreshStreak(); // Trigger per aggiornamento streak
      }
    });
  }

  resetWorkout(): void {
    this.workoutState = 'idle';
    this.currentExerciseIndex = 0;
    this.completedExercises.clear();
  }

  getExerciseImage(item: WorkoutPlanItem): string {
    return this.utils.getItemImageUrl(item);
  }

  isToday(): boolean {
    return this.todaysWorkout ? this.utils.isToday(this.todaysWorkout.dayOfWeek) : false;
  }
}
