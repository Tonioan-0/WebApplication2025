import { Routes } from '@angular/router';
import { MapFinderComponent } from './map-finder/map-finder.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing-page/landing-page.component').then(m => m.LandingPageComponent),
    title: 'FitHub - Your Fitness Journey',
    canActivate: [guestGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./home/home').then(m => m.HomeComponent),
    title: 'FitHub - Workout Hub',
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/community',
    loadComponent: () => import('./community/community.component').then(m => m.CommunityComponent),
    title: 'FitHub - Community & Scheduling',
    canActivate: [authGuard]
  },
  {
    path: 'map',
    component: MapFinderComponent,
    title: 'FitHub - Find Your Spot'
  },
  {
    path: 'map/select',
    component: MapFinderComponent,
    title: 'FitHub - Select Location',
    data: { selectionMode: true }
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent),
    title: 'FitHub - Login',
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register').then(m => m.RegisterComponent),
    title: 'FitHub - Join Now',
    canActivate: [guestGuard]
  },
  {
    path: 'map-finder',
    redirectTo: 'map',
    pathMatch: 'full'
  }
];
