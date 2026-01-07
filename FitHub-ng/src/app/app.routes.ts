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
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent),
    title: 'FitHub - Login'
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register').then(m => m.RegisterComponent),
    title: 'FitHub - Join Now'
  },
  {
    path: 'map-finder',
    redirectTo: 'map',
    pathMatch: 'full'
  }
];
