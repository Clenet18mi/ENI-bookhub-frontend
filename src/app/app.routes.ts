import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './admin/admin.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/app-shell/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      {
        path: 'catalogue',
        loadComponent: () => import('./catalogue/catalogue.component').then((m) => m.CatalogueComponent),
      },
      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'loans',
        canActivate: [authGuard],
        loadComponent: () => import('./loans/components/loan-component/loans.component').then((m) => m.LoansComponent),
      },
      {
        path: 'reservations',
        canActivate: [authGuard],
        loadComponent: () => import('./reservations/reservations.component').then((m) => m.ReservationsComponent),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('./profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        loadComponent: () => import('./admin/admin.component').then((m) => m.AdminComponent),
      },
    ],
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register-page.component').then((m) => m.RegisterPageComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
