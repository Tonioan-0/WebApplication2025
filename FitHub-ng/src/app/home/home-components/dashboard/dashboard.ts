import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActiveWorkoutCardComponent } from './active-workout-card/active-workout-card';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, ActiveWorkoutCardComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  // Dashboard stats can be loaded here in the future
  
  onWorkoutCompleted(): void {
    // Handle workout completion event
    // Could refresh stats, show notification, etc.
    console.log('Workout completed!');
  }
}