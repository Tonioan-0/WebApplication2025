import { Routes } from '@angular/router';
import { MapFinderComponent } from './map-finder/map-finder.component';

export const routes: Routes = [
  {
    path: '',
    component: MapFinderComponent,
    title: 'FitHub - Find Your Spot'
  },
  {
    path: 'map-finder',
    redirectTo: '',
    pathMatch: 'full'
  }
];
