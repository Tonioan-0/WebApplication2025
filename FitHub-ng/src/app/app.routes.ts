import { Routes } from '@angular/router';
import { MapFinderComponent } from './map-finder/map-finder.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing-page/landing-page.component').then(m => m.LandingPageComponent),
    title: 'FitHub - Your Fitness Journey'
  },
  {
    path: 'map',
    component: MapFinderComponent,
    title: 'FitHub - Find Your Spot'
  },
  {
    path: 'map-finder',
    redirectTo: 'map',
    pathMatch: 'full'
  }
];
