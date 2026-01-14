import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import { ExercisesService } from '../../../services/exercises.service';
import { WorkoutPlansService } from '../../../services/workout-plans.service';
import { WorkoutUtilsService } from '../../../services/workout-utils.service';
import { AuthService } from '../../../services/authService';
import { ExercisePreset } from '../../../models/exercise.model';
import { DayOfWeek, WorkoutPlan, WorkoutPlanItem } from '../../../models/workout-plan.model';

@Component({
  selector: 'app-workout-plans',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './workout-plans.html',
  styleUrl: './workout-plans.css'
})
export class WorkoutPlans implements OnInit {
  userId: number = 0;

  // preset esercizi
  presets: ExercisePreset[] = [];
  presetQuery = '';

  // UI piano
  selectedDay: DayOfWeek = 'MONDAY';
  planTitle = '';
  startDate = '';
  endDate = '';

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
  detailPlanId: number | null = null;
  editingPlanId: number | null = null;

  saving = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private exercisesService: ExercisesService,
    private workoutPlansService: WorkoutPlansService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    public utils: WorkoutUtilsService
  ) {}

  ngOnInit(): void {
    this.startDate = this.utils.todayISO();
    this.endDate = this.utils.todayISO();
    this.loadPresets();
    this.loadPlans();
  }

  // ---------- LOAD ESERCIZI----------
  loadPresets() {
    this.exercisesService.getPresets().subscribe({
      next: (data: ExercisePreset[]) => {
        this.presets = data;
        this.cdr.detectChanges();
      },
      error: () => (this.errorMsg = 'Errore nel caricamento esercizi preimpostati.')
    });
  }

  // ---------- LOAD SCHEDE ATTIVE/SCADUTE----------
  loadPlans() {
    this.workoutPlansService.getActive(this.utils.todayISO()).subscribe({
      next: (p: WorkoutPlan[]) => (this.activePlans = p),
      error: () => (this.errorMsg = 'Errore nel caricamento schede attive.')
    });

    this.workoutPlansService.getExpired().subscribe({
      next: (p: WorkoutPlan[]) => (this.expiredPlans = p),
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
    return this.utils.getDayLabel(day);
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
    this.utils.reindexItems(items);
  }

  // ---------- IMMAGINI ESERCIZI ----------
  getExerciseImage(exercise: ExercisePreset): string {
    return this.utils.getExerciseImageUrl(exercise);
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
      this.utils.reindexItems(items);
      return;
    }

    moveItemInArray(this.currentDayItems, event.previousIndex, event.currentIndex);
    this.utils.reindexItems(this.currentDayItems);
  }

  // ---------- COUNTERS ESERCIZI (+/-)----------
  incSets(item: WorkoutPlanItem) { item.sets = Math.min(99, item.sets + 1); }
  decSets(item: WorkoutPlanItem) { item.sets = Math.max(1, item.sets - 1); }
  incReps(item: WorkoutPlanItem) { item.reps = Math.min(999, item.reps + 1); }
  decReps(item: WorkoutPlanItem) { item.reps = Math.max(1, item.reps - 1); }

  removeItem(index: number) {
    this.currentDayItems.splice(index, 1);
    this.utils.reindexItems(this.currentDayItems);
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

    for (const day of this.utils.dayOrder) {
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

    const request$ = this.editingPlanId
      ? this.workoutPlansService.update(this.editingPlanId, plan)
      : this.workoutPlansService.create(plan);

    request$.subscribe({
      next: () => {
        this.saving = false;
        alert(this.editingPlanId ? '✅ Scheda aggiornata!' : '✅ Scheda salvata!');
        window.location.reload();
      },
      error: (err: any) => {
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
  isDateRangeValid(): boolean {
    const today = this.utils.todayISO();
    return this.startDate >= today && this.endDate >= this.startDate;
  }

  // ---------- HELPER per visualizzazione schede salvate ----------
  getItemsByDay(plan: WorkoutPlan, day: DayOfWeek): WorkoutPlanItem[] {
    return this.utils.getItemsByDay(plan, day);
  }

  getDaysWithItems(plan: WorkoutPlan): DayOfWeek[] {
    return this.utils.getDaysWithItems(plan);
  }

  // ---------- MODIFICA SCHEDA ATTIVA ----------
  editPlan(plan: WorkoutPlan) {
    this.editingPlanId = plan.id!;
    this.planTitle = plan.title;
    this.startDate = plan.startDate;
    this.endDate = plan.endDate;

    // Reset e popola i giorni
    this.utils.dayOrder.forEach(d => (this.dayItemsMap[d] = []));

    for (const item of plan.items) {
      const exercise = this.presets.find(p => p.id === item.exerciseId);
      this.dayItemsMap[item.dayOfWeek].push({
        ...item,
        exercise: exercise
      });
    }

    this.tab = 'EDITOR';
    this.selectedDay = this.getDaysWithItems(plan)[0] || 'MONDAY';
  }

  // ---------- DETTAGLI SCHEDA SCADUTA ----------
  toggleDetails(planId: number) {
    this.detailPlanId = this.detailPlanId === planId ? null : planId;
  }

  // ---------- HELPER IMMAGINE PER ITEM ----------
  getItemImage(item: WorkoutPlanItem): string {
    return this.utils.getItemImageUrl(item, this.presets);
  }

  getItemName(item: WorkoutPlanItem): string {
    return this.utils.getItemName(item, this.presets);
  }
}
