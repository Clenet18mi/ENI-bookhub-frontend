import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './admin/admin.guard';      // ← NOUVEAU

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/app-shell/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'catalogue',
        loadComponent: () => import('./catalogue/catalogue.component').then((m) => m.CatalogueComponent),
      },
      {
        path: 'loans',
        loadComponent: () => import('./loans/loans.component').then((m) => m.LoansComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],                     // ← guard de rôle
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
