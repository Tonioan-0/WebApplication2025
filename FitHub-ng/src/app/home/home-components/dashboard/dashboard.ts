import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ActiveWorkoutCardComponent } from './active-workout-card/active-workout-card';
import { StreakService } from '../../../services/streak.service';
import { MealService } from '../../../services/meal.service';
import { Streak } from '../../../models/streak.model';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, ActiveWorkoutCardComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Dashboard stats
  weeklyWorkouts = 0;
  caloriesBurned = 0;
  dailyCaloriesConsumed = 0;
  isLoading = true;

  // Constants for calculations
  private readonly CALORIES_PER_WORKOUT = 300;

  private streakSubscription?: Subscription;

  constructor(
    private streakService: StreakService,
    private mealService: MealService
  ) { }

  ngOnInit(): void {
    // Subscribe to streak data
    this.streakSubscription = this.streakService.streak$.subscribe((streak: Streak) => {
      this.weeklyWorkouts = streak.weeklyWorkoutsDone;
      this.caloriesBurned = this.weeklyWorkouts * this.CALORIES_PER_WORKOUT;
      this.isLoading = false;
    });

    // Refresh streak data
    this.streakService.refreshStreak();

    // Load today's calories from meals
    this.loadDailyCalories();
  }

  ngOnDestroy(): void {
    this.streakSubscription?.unsubscribe();
  }

  onWorkoutCompleted(): void {
    // Refresh stats when workout is completed
    this.streakService.refreshStreak();
    console.log('Workout completed! Stats refreshed.');
  }

  private loadDailyCalories(): void {
    this.mealService.getMyMeals().subscribe({
      next: (meals) => {
        const today = new Date().toISOString().split('T')[0];
        this.dailyCaloriesConsumed = meals
          .filter(meal => meal.dateEaten?.startsWith(today))
          .reduce((total, meal) => total + (meal.totalCalories || 0), 0);
      },
      error: (err) => {
        console.error('Error loading meals:', err);
        this.dailyCaloriesConsumed = 0;
      }
    });
  }
}
