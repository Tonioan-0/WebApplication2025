import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SVG_ICONS } from '../shared/constants/svg-icons.constants';
import { AuthService } from '../services/authService';

interface WorkoutPlan {
  id: number;
  title: string;
  type: 'Strength' | 'Cardio' | 'Core' | 'Full Body';
  duration: string;
  exercises: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  readonly icons = SVG_ICONS;
  sidebarCollapsed = false;

  workoutPlans: WorkoutPlan[] = [
    {
      id: 1,
      title: 'Upper Body Strength',
      type: 'Strength',
      duration: '45 min',
      exercises: 8,
      level: 'Intermediate',
      color: '#ff6b6b' // Orange/Red
    },
    {
      id: 2,
      title: 'HIIT Cardio Blast',
      type: 'Cardio',
      duration: '30 min',
      exercises: 6,
      level: 'Advanced',
      color: '#ff9f43' // Orange
    },
    {
      id: 3,
      title: 'Core & Abs',
      type: 'Core',
      duration: '20 min',
      exercises: 10,
      level: 'Beginner',
      color: '#ffa502' // Dark Yellow/Orange
    },
    {
      id: 4,
      title: 'Full Body Circuit',
      type: 'Full Body',
      duration: '50 min',
      exercises: 12,
      level: 'Intermediate',
      color: '#ff7f50' // Coral
    }
  ];

  constructor(private authService: AuthService) { }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
