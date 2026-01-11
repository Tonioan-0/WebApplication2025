import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  // Landing page (guests only)
  {
    path: '',
    loadComponent: () => import('./landing-page/landing-page.component').then(m => m.LandingPageComponent),
    title: 'FitHub - Your Fitness Journey',
    canActivate: [guestGuard]
  },
  // Auth routes (guests only)
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
  // Home layout with nested routes (auth required)
  {
    path: 'home',
    loadComponent: () => import('./home/home').then(m => m.HomeComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent),
        title: 'FitHub - Dashboard'
      },
      {
        path: 'workouts',
        loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent),
        title: 'FitHub - Workout Hub'
      },
      {
        path: 'map',
        loadComponent: () => import('./components/map-finder/map-finder.component').then(m => m.MapFinderComponent),
        title: 'FitHub - Find Your Spot'
      },
      {
        path: 'map/select',
        loadComponent: () => import('./components/map-finder/map-finder.component').then(m => m.MapFinderComponent),
        title: 'FitHub - Select Location',
        data: { selectionMode: true }
      },
      {
        path: 'nutrition',
        loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent),
        title: 'FitHub - Nutrition Center'
      },
      {
        path: 'community',
        loadComponent: () => import('./community/community.component').then(m => m.CommunityComponent),
        title: 'FitHub - Community & Scheduling'
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent),
        title: 'FitHub - Profile'
      }
    ]
  },
  // Redirect legacy routes
  {
    path: 'dashboard',
    redirectTo: 'home',
    pathMatch: 'prefix'
  },
  {
    path: 'map',
    redirectTo: 'home/map',
    pathMatch: 'full'
  },
  {
    path: 'workouts',
    redirectTo: 'home/workouts',
    pathMatch: 'full'
  },
  // Wildcard catch-all
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];
