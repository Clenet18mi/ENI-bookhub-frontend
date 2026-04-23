import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/app-shell/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'catalogue',
      },
      {
        path: 'catalogue',
        loadComponent: () => import('./catalogue/catalogue.component').then((m) => m.CatalogueComponent),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register-page.component').then((m) => m.RegisterPageComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
