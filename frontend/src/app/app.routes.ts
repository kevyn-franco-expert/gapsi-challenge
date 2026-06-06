import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { loginGuard } from './core/login.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'issues',
        loadChildren: () => import('./features/issues/issues.routes').then(m => m.ISSUES_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
