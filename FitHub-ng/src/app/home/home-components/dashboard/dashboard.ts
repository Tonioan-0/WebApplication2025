import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ActiveWorkoutCardComponent } from './active-workout-card/active-workout-card';
import { StreakService } from '../../../services/streak.service';
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
  activeMinutes = 0;
  isLoading = true;

  // Constants for calculations
  private readonly CALORIES_PER_WORKOUT = 300;
  private readonly MINUTES_PER_WORKOUT = 45;

  private streakSubscription?: Subscription;

  constructor(private streakService: StreakService) { }

  ngOnInit(): void {
    // Subscribe to streak data
    this.streakSubscription = this.streakService.streak$.subscribe((streak: Streak) => {
      this.weeklyWorkouts = streak.weeklyWorkoutsDone;
      this.caloriesBurned = this.weeklyWorkouts * this.CALORIES_PER_WORKOUT;
      this.activeMinutes = this.weeklyWorkouts * this.MINUTES_PER_WORKOUT;
      this.isLoading = false;
    });

    // Refresh streak data
    this.streakService.refreshStreak();
  }

  ngOnDestroy(): void {
    this.streakSubscription?.unsubscribe();
  }

  onWorkoutCompleted(): void {
    // Refresh stats when workout is completed
    this.streakService.refreshStreak();
    console.log('Workout completed! Stats refreshed.');
  }
}