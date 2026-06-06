import { Routes } from '@angular/router';

export const ISSUES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/issues-list.component').then(m => m.IssuesListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./create/issue-create.component').then(m => m.IssueCreateComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./edit/issue-edit.component').then(m => m.IssueEditComponent)
  }
];
