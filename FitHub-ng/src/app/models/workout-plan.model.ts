import { ExercisePreset } from './exercise.model';

export type DayOfWeek =
  | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY'
  | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface WorkoutPlanItem {
  id?: number;                 // id nel DB (opzionale)
  exerciseId: number;
  exercise?: ExercisePreset;   // valorizzato lato UI
  position: number;            // ordine nella giornata
  sets: number;                // serie
  reps: number;                // ripetizioni
  note?: string;               // post-it
}

export interface WorkoutDayPlan {
  dayOfWeek: DayOfWeek;
  title: string;
  items: WorkoutPlanItem[];
}

export interface WorkoutPlan {
  id?: number;
  userId: number;              // per ora obbligatorio (anche fisso a 1)
  startDate: string;           // YYYY-MM-DD
  endDate: string;             // YYYY-MM-DD
  days: WorkoutDayPlan[];
  createdAt?: string;
}
