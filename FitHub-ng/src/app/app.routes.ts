import { Routes } from '@angular/router';
import { MapFinderComponent } from './map-finder/map-finder.component';
import {WorkoutPlans} from './workout-plans/workout-plans';

export const routes: Routes = [
  {
    path: '',
    component: WorkoutPlans,
    title: 'FitHub - Find Your Spot'
  },
  {
    path: 'map-finder',
    component: MapFinderComponent,
    pathMatch: 'full'
  },
  {
    path: 'workout-plan',
    component: WorkoutPlans,
    pathMatch: 'full'
  }
];
