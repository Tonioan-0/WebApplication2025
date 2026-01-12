import { ExercisePreset } from './exercise.model';

export type DayOfWeek =
  | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY'
  | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface WorkoutPlanItem {
  id?: number;
  exerciseId: number;
  exercise?: ExercisePreset;   // valorizzato lato UI
  dayOfWeek: DayOfWeek;        // giorno della settimana
  position: number;            // ordine nel giorno
  sets: number;                // serie
  reps: number;                // ripetizioni
  note?: string;               // post-it
}

export interface WorkoutPlan {
  id?: number;
  userId: number;
  title: string;               // titolo della scheda
  startDate: string;           // YYYY-MM-DD
  endDate: string;             // YYYY-MM-DD
  items: WorkoutPlanItem[];    // tutti gli esercizi
  createdAt?: string;
}
