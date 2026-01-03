/*import { Component } from '@angular/core';

@Component({
  selector: 'app-workout-plan',
  imports: [],
  templateUrl: './workout-plans.html',
  styleUrl: './workout-plans.css',
})
export class WorkoutPlans {

}*/

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import { ExercisesService } from '../services/exercises.service';
import { WorkoutPlansService } from '../services/workout-plans.service';
import { ExercisePreset } from '../models/exercise.model';
import { DayOfWeek, WorkoutPlan, WorkoutPlanItem, WorkoutDayPlan } from '../models/workout-plan.model';

@Component({
  selector: 'app-workout-plans',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './workout-plans.html',
  styleUrl: './workout-plans.css'
})
export class WorkoutPlans implements OnInit {
  // demo: se nel tuo progetto hai auth, sostituisci con utente reale
  userId = 1;

  // preset esercizi
  presets: ExercisePreset[] = [];
  presetQuery = '';

  // UI piano
  selectedDay: DayOfWeek = 'MONDAY';
  planTitle = 'Allenamento';
  startDate = this.todayISO();
  endDate = this.todayISO();

  // editor giornata
  dayPlanMap: Record<DayOfWeek, WorkoutDayPlan> = {
    MONDAY: { dayOfWeek: 'MONDAY', title: 'Lunedì', items: [] },
    TUESDAY: { dayOfWeek: 'TUESDAY', title: 'Martedì', items: [] },
    WEDNESDAY: { dayOfWeek: 'WEDNESDAY', title: 'Mercoledì', items: [] },
    THURSDAY: { dayOfWeek: 'THURSDAY', title: 'Giovedì', items: [] },
    FRIDAY: { dayOfWeek: 'FRIDAY', title: 'Venerdì', items: [] },
    SATURDAY: { dayOfWeek: 'SATURDAY', title: 'Sabato', items: [] },
    SUNDAY: { dayOfWeek: 'SUNDAY', title: 'Domenica', items: [] },
  };

  // liste DB
  activePlans: WorkoutPlan[] = [];
  expiredPlans: WorkoutPlan[] = [];
  tab: 'EDITOR' | 'ACTIVE' | 'EXPIRED' = 'EDITOR';

  saving = false;
  errorMsg = '';

  constructor(
    private exercisesService: ExercisesService,
    private workoutPlansService: WorkoutPlansService
  ) { }

  ngOnInit(): void {
    this.loadPresets();
    this.loadPlans();
  }

  // ---------- LOAD ----------
  loadPresets() {
    this.exercisesService.getPresets().subscribe({
      next: (data) => (this.presets = data),
      error: () => (this.errorMsg = 'Errore nel caricamento esercizi preimpostati.')
    });
  }

  loadPlans() {
    this.workoutPlansService.getActive(this.userId, this.todayISO()).subscribe({
      next: (p) => (this.activePlans = p),
      error: () => (this.errorMsg = 'Errore nel caricamento schede attive.')
    });

    this.workoutPlansService.getExpired(this.userId).subscribe({
      next: (p) => (this.expiredPlans = p),
      error: () => (this.errorMsg = 'Errore nel caricamento schede scadute.')
    });
  }

  // ---------- UI HELPERS ----------
  get currentDayPlan(): WorkoutDayPlan {
    return this.dayPlanMap[this.selectedDay];
  }

  get filteredPresets(): ExercisePreset[] {
    const q = this.presetQuery.trim().toLowerCase();
    if (!q) return this.presets;
    return this.presets.filter(p => p.name.toLowerCase().includes(q));
  }

  // ---------- ADD (click) ----------
  addPresetToDay(preset: ExercisePreset) {
    const items = this.currentDayPlan.items;
    items.push({
      exerciseId: preset.id,
      exercise: preset,
      position: items.length,
      sets: 3,
      reps: 10,
      note: ''
    });
    this.reindex(items);
  }

  // ---------- EXERCISE IMAGES ----------
  getExerciseImage(exercise: ExercisePreset): string {
    if (exercise.path) {
      return exercise.path;
    }

    const nameMap: Record<string, string> = {
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
    const key = exercise.name.toLowerCase();
    const filename = nameMap[key] || 'default';
    return `assets/exercises/${filename}.png`;
  }

  // ---------- DRAG & DROP ----------
  dropToDay(event: CdkDragDrop<any[]>) {
    // left list -> right list
    if (event.previousContainer !== event.container) {
      const preset = event.previousContainer.data[event.previousIndex] as ExercisePreset;
      const newItem: WorkoutPlanItem = {
        exerciseId: preset.id,
        exercise: preset,
        position: event.currentIndex,
        sets: 3,
        reps: 10,
        note: ''
      };

      const items = this.currentDayPlan.items;
      items.splice(event.currentIndex, 0, newItem);
      this.reindex(items);
      return;
    }

    // reorder within day list
    moveItemInArray(this.currentDayPlan.items, event.previousIndex, event.currentIndex);
    this.reindex(this.currentDayPlan.items);
  }

  // ---------- COUNTERS ----------
  incSets(item: WorkoutPlanItem) { item.sets = Math.min(99, item.sets + 1); }
  decSets(item: WorkoutPlanItem) { item.sets = Math.max(1, item.sets - 1); }
  incReps(item: WorkoutPlanItem) { item.reps = Math.min(999, item.reps + 1); }
  decReps(item: WorkoutPlanItem) { item.reps = Math.max(1, item.reps - 1); }

  removeItem(index: number) {
    this.currentDayPlan.items.splice(index, 1);
    this.reindex(this.currentDayPlan.items);
  }

  // ---------- SAVE ----------
  savePlan() {
    this.errorMsg = '';

    if (!this.isDateRangeValid()) {
      this.errorMsg = 'Intervallo date non valido: la fine deve essere >= inizio e l’inizio >= oggi.';
      return;
    }

    // costruisco payload completo (tutte le giornate)
    const days: WorkoutDayPlan[] = (Object.keys(this.dayPlanMap) as DayOfWeek[])
      .map(d => ({
        dayOfWeek: d,
        title: this.dayPlanMap[d].title,
        items: this.dayPlanMap[d].items.map((it, idx) => ({
          exerciseId: it.exerciseId,
          position: idx,
          sets: it.sets,
          reps: it.reps,
          note: it.note ?? ''
        }))
      }));

    const plan: WorkoutPlan = {
      userId: this.userId,
      startDate: this.startDate,
      endDate: this.endDate,
      days
    };

    this.saving = true;
    this.workoutPlansService.create(plan).subscribe({
      next: () => {
        this.saving = false;
        this.resetEditor();
        this.loadPlans();
        this.tab = 'ACTIVE';
      },
      error: () => {
        this.saving = false;
        this.errorMsg = 'Errore nel salvataggio della scheda.';
      }
    });
  }

  deletePlan(planId: number) {
    this.workoutPlansService.deletePlan(planId).subscribe({
      next: () => this.loadPlans(),
      error: () => (this.errorMsg = 'Errore eliminazione scheda.')
    });
  }

  // ---------- VALIDATION / UTILS ----------
  todayISO(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  isDateRangeValid(): boolean {
    const today = this.todayISO();
    return this.startDate >= today && this.endDate >= this.startDate;
  }

  reindex(items: WorkoutPlanItem[]) {
    items.forEach((it, idx) => (it.position = idx));
  }

  resetEditor() {
    this.startDate = this.todayISO();
    this.endDate = this.todayISO();
    // pulisco tutte le giornate
    (Object.keys(this.dayPlanMap) as DayOfWeek[]).forEach(d => (this.dayPlanMap[d].items = []));
  }
}
