import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import { ExercisesService } from '../services/exercises.service';
import { WorkoutPlansService } from '../services/workout-plans.service';
import { ExercisePreset } from '../models/exercise.model';
import { DayOfWeek, WorkoutPlan, WorkoutPlanItem } from '../models/workout-plan.model';

@Component({
  selector: 'app-workout-plans',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './workout-plans.html',
  styleUrl: './workout-plans.css'
})
export class WorkoutPlans implements OnInit {
  userId = 1;

  // preset esercizi
  presets: ExercisePreset[] = [];
  presetQuery = '';

  // UI piano
  selectedDay: DayOfWeek = 'MONDAY';
  planTitle = 'Scheda Allenamento';
  startDate = this.todayISO();
  endDate = this.todayISO();

  // items per giorno (editor locale)
  dayItemsMap: Record<DayOfWeek, WorkoutPlanItem[]> = {
    MONDAY: [],
    TUESDAY: [],
    WEDNESDAY: [],
    THURSDAY: [],
    FRIDAY: [],
    SATURDAY: [],
    SUNDAY: [],
  };

  // liste DB
  activePlans: WorkoutPlan[] = [];
  expiredPlans: WorkoutPlan[] = [];
  tab: 'EDITOR' | 'ACTIVE' | 'EXPIRED' = 'EDITOR';

  // Stato modifica/dettagli
  detailPlanId: number | null = null;   // scheda scaduta con dettagli aperti

  saving = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private exercisesService: ExercisesService,
    private workoutPlansService: WorkoutPlansService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadPresets();
    this.loadPlans();
  }

  // ---------- LOAD ----------
  loadPresets() {
    this.exercisesService.getPresets().subscribe({
      next: (data) => {
        this.presets = data;
        this.cdr.detectChanges();
      },
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
  get currentDayItems(): WorkoutPlanItem[] {
    return this.dayItemsMap[this.selectedDay];
  }

  get filteredPresets(): ExercisePreset[] {
    const q = this.presetQuery.trim().toLowerCase();
    if (!q) return this.presets;
    return this.presets.filter(p => p.name.toLowerCase().includes(q));
  }

  getDayLabel(day: DayOfWeek): string {
    const labels: Record<DayOfWeek, string> = {
      MONDAY: 'Lunedì',
      TUESDAY: 'Martedì',
      WEDNESDAY: 'Mercoledì',
      THURSDAY: 'Giovedì',
      FRIDAY: 'Venerdì',
      SATURDAY: 'Sabato',
      SUNDAY: 'Domenica'
    };
    return labels[day];
  }

  // ---------- ADD (click) ----------
  addPresetToDay(preset: ExercisePreset) {
    const items = this.currentDayItems;
    items.push({
      exerciseId: preset.id,
      exercise: preset,
      dayOfWeek: this.selectedDay,
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
    if (event.previousContainer !== event.container) {
      const preset = event.previousContainer.data[event.previousIndex] as ExercisePreset;
      const newItem: WorkoutPlanItem = {
        exerciseId: preset.id,
        exercise: preset,
        dayOfWeek: this.selectedDay,
        position: event.currentIndex,
        sets: 3,
        reps: 10,
        note: ''
      };

      const items = this.currentDayItems;
      items.splice(event.currentIndex, 0, newItem);
      this.reindex(items);
      return;
    }

    moveItemInArray(this.currentDayItems, event.previousIndex, event.currentIndex);
    this.reindex(this.currentDayItems);
  }

  // ---------- COUNTERS ----------
  incSets(item: WorkoutPlanItem) { item.sets = Math.min(99, item.sets + 1); }
  decSets(item: WorkoutPlanItem) { item.sets = Math.max(1, item.sets - 1); }
  incReps(item: WorkoutPlanItem) { item.reps = Math.min(999, item.reps + 1); }
  decReps(item: WorkoutPlanItem) { item.reps = Math.max(1, item.reps - 1); }

  removeItem(index: number) {
    this.currentDayItems.splice(index, 1);
    this.reindex(this.currentDayItems);
  }

  // ---------- SAVE ----------
  savePlan() {
    this.errorMsg = '';

    if (!this.planTitle.trim()) {
      this.errorMsg = 'Inserisci un titolo per la scheda.';
      return;
    }

    if (!this.isDateRangeValid()) {
      this.errorMsg = "Intervallo date non valido: la fine deve essere >= inizio e l'inizio >= oggi.";
      return;
    }

    // Raccogli tutti gli items da tutti i giorni
    const allItems: WorkoutPlanItem[] = [];
    const days: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    for (const day of days) {
      const dayItems = this.dayItemsMap[day];
      for (let i = 0; i < dayItems.length; i++) {
        allItems.push({
          exerciseId: dayItems[i].exerciseId,
          dayOfWeek: day,
          position: i,
          sets: dayItems[i].sets,
          reps: dayItems[i].reps,
          note: dayItems[i].note ?? ''
        });
      }
    }

    if (allItems.length === 0) {
      this.errorMsg = 'Aggiungi almeno un esercizio a una giornata.';
      return;
    }

    const plan: WorkoutPlan = {
      userId: this.userId,
      title: this.planTitle,
      startDate: this.startDate,
      endDate: this.endDate,
      items: allItems
    };

    console.log('Saving plan:', JSON.stringify(plan, null, 2));

    this.saving = true;
    this.workoutPlansService.create(plan).subscribe({
      next: () => {
        this.saving = false;
        alert('✅ Scheda salvata con successo!');
        window.location.reload();
      },
      error: (err) => {
        this.saving = false;
        console.error('Save error:', err);
        this.errorMsg = err?.error?.message || err?.message || 'Errore nel salvataggio della scheda.';
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



  // ---------- HELPER per visualizzazione schede salvate ----------
  getItemsByDay(plan: WorkoutPlan, day: DayOfWeek): WorkoutPlanItem[] {
    return plan.items.filter(item => item.dayOfWeek === day);
  }

  getDaysWithItems(plan: WorkoutPlan): DayOfWeek[] {
    const days = new Set<DayOfWeek>();
    plan.items.forEach(item => days.add(item.dayOfWeek));
    // Ordina i giorni
    const order: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    return order.filter(d => days.has(d));
  }

  // ---------- MODIFICA SCHEDA ATTIVA ----------
  editPlan(plan: WorkoutPlan) {
    // Carica i dati della scheda nell'editor
    this.planTitle = plan.title;
    this.startDate = plan.startDate;
    this.endDate = plan.endDate;

    // Reset e popola i giorni
    const days: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    days.forEach(d => (this.dayItemsMap[d] = []));

    for (const item of plan.items) {
      const exercise = this.presets.find(p => p.id === item.exerciseId);
      this.dayItemsMap[item.dayOfWeek].push({
        ...item,
        exercise: exercise
      });
    }

    // Vai all'editor
    this.tab = 'EDITOR';
    this.selectedDay = this.getDaysWithItems(plan)[0] || 'MONDAY';
  }



  // ---------- DETTAGLI SCHEDA SCADUTA ----------
  toggleDetails(planId: number) {
    if (this.detailPlanId === planId) {
      this.detailPlanId = null;
    } else {
      this.detailPlanId = planId;
    }
  }

  // ---------- HELPER IMMAGINE PER ITEM ----------
  getItemImage(item: WorkoutPlanItem): string {
    // Se l'item ha già l'esercizio caricato
    if (item.exercise) {
      return this.getExerciseImage(item.exercise);
    }
    // Altrimenti cerca nei presets
    const preset = this.presets.find(p => p.id === item.exerciseId);
    if (preset) {
      return this.getExerciseImage(preset);
    }
    return 'assets/exercises/default.png';
  }

  getItemName(item: WorkoutPlanItem): string {
    if (item.exercise) {
      return item.exercise.name;
    }
    const preset = this.presets.find(p => p.id === item.exerciseId);
    return preset?.name || `Esercizio #${item.exerciseId}`;
  }
}

