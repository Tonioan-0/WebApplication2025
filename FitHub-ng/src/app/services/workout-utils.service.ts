import { Injectable } from '@angular/core';
import { DayOfWeek, WorkoutPlanItem, WorkoutPlan } from '../models/workout-plan.model';
import { ExercisePreset } from '../models/exercise.model';

@Injectable({ providedIn: 'root' })
export class WorkoutUtilsService {
  
  readonly dayOrder: DayOfWeek[] = [
    'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
  ];

  readonly dayLabels: Record<DayOfWeek, string> = {
    'MONDAY': 'Lunedì',
    'TUESDAY': 'Martedì',
    'WEDNESDAY': 'Mercoledì',
    'THURSDAY': 'Giovedì',
    'FRIDAY': 'Venerdì',
    'SATURDAY': 'Sabato',
    'SUNDAY': 'Domenica'
  };

  /*Mappa per immagini degli esercizi */
  private readonly exerciseImageMap: Record<string, string> = {
    'panca piana': 'panca-piana',
    'squat': 'squat',
    'stacco da terra': 'stacco-da-terra',
    'lat machine': 'lat-machine',
    'curl manubri': 'curl-manubri',
    'military press': 'military-press',
    'leg press': 'leg-press',
    'plank': 'plank',
    'push up': 'push-ups',
    'push ups': 'push-ups',
    'piegamenti': 'push-ups',
    'pull up': 'pull-ups',
    'pull ups': 'pull-ups',
    'trazioni': 'pull-ups',
    'dips': 'dips',
    'parallele': 'dips',
    'affondi': 'affondi',
    'lunges': 'affondi',
    'croci manubri': 'croci-manubri',
    'croci': 'croci-manubri',
    'rematore': 'rematore',
    'rematore bilanciere': 'rematore',
    'barbell row': 'rematore',
    'alzate laterali': 'alzate-laterali',
    'lateral raise': 'alzate-laterali',
    'french press': 'french-press',
    'skull crusher': 'french-press',
    'calf raise': 'calf-raises',
    'calf raises': 'calf-raises',
    'polpacci': 'calf-raises',
    'leg curl': 'leg-curl',
    'leg extension': 'leg-extension',
    'crunch': 'crunch',
    'addominali': 'crunch'
  };

  // ==================== Data ====================

  /*Restituisce la data di oggi in formato ISO */
  todayISO(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  /*Restituisce l'indice del giorno corrente (0 = Monday, 6 = Sunday) */
  getCurrentDayIndex(): number {
    const today = new Date();
    return today.getDay() === 0 ? 6 : today.getDay() - 1;
  }

  /*Restituisce la chiave del giorno corrente */
  getCurrentDayKey(): DayOfWeek {
    return this.dayOrder[this.getCurrentDayIndex()];
  }

  // ==================== Giorni ====================

  /** Gets the Italian label for a day */
  getDayLabel(day: DayOfWeek): string {
    return this.dayLabels[day];
  }

  /** Checks if a given day is today */
  isToday(day: DayOfWeek): boolean {
    return day === this.getCurrentDayKey();
  }

  // ==================== Workout Plan ====================

  /*Raggruppa gli esercizi per giorno*/
  groupItemsByDay(items: WorkoutPlanItem[]): Map<DayOfWeek, WorkoutPlanItem[]> {
    const map = new Map<DayOfWeek, WorkoutPlanItem[]>();
    
    items.forEach(item => {
      if (!map.has(item.dayOfWeek)) {
        map.set(item.dayOfWeek, []);
      }
      map.get(item.dayOfWeek)!.push(item);
    });

    map.forEach(dayItems => dayItems.sort((a, b) => a.position - b.position));
    
    return map;
  }

  /*Restituisce gli esercizi per un giorno specifico*/
  getItemsByDay(plan: WorkoutPlan, day: DayOfWeek): WorkoutPlanItem[] {
    return plan.items
      .filter(item => item.dayOfWeek === day)
      .sort((a, b) => a.position - b.position);
  }

  /*Restituisce i giorni che hanno esercizi in un piano (ordinati)*/
  getDaysWithItems(plan: WorkoutPlan): DayOfWeek[] {
    const days = new Set<DayOfWeek>();
    plan.items.forEach(item => days.add(item.dayOfWeek));
    return this.dayOrder.filter(d => days.has(d));
  }

  /** Reindexes item positions after reordering */
  reindexItems(items: WorkoutPlanItem[]): void {
    items.forEach((item, idx) => item.position = idx);
  }

  // ==================== IMMAGINI ESERCIZI ====================

  getExerciseImageUrl(exercise: ExercisePreset | undefined): string {
    if (!exercise) {
      return '/assets/exercises/default.png';
    }

    // Se il path è direttamente memorizzato nel database
    if (exercise.path) {
      let path = exercise.path;
      // Gestisce i percorsi relativi
      if (path.startsWith('../')) {
        path = path.replace(/^(\.\.\/)+/, '');
      }
      // Se il path non inizia con '/' o 'http', lo aggiunge
      if (!path.startsWith('/') && !path.startsWith('http')) {
        path = '/' + path;
      }
      return path;
    }

    // Mappa per le immagini degli esercizi
    const key = exercise.name.toLowerCase();
    const filename = this.exerciseImageMap[key] || 'default';
    return `/assets/exercises/${filename}.png`;
  }

  /*Restituisce l'URL dell'immagine per un esercizio*/
  getItemImageUrl(item: WorkoutPlanItem, presets?: ExercisePreset[]): string {
    if (item.exercise) {
      return this.getExerciseImageUrl(item.exercise);
    }
    
    if (presets) {
      const preset = presets.find(p => p.id === item.exerciseId);
      return this.getExerciseImageUrl(preset);
    }
    
    return '/assets/exercises/default.png';
  }

  /*Restituisce il nome per un esercizio*/
  getItemName(item: WorkoutPlanItem, presets?: ExercisePreset[]): string {
    if (item.exercise) {
      return item.exercise.name;
    }
    
    if (presets) {
      const preset = presets.find(p => p.id === item.exerciseId);
      if (preset) return preset.name;
    }
    
    return `Esercizio #${item.exerciseId}`;
  }
}
