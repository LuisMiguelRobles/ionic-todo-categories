import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tasks',
    loadComponent: () => import('./features/tasks/pages/tasks.page').then((m) => m.TasksPage),
  },
  {
    path: 'categories',
    loadComponent: () => import('./features/categories/pages/categories.page').then((m) => m.CategoriesPage),
  },
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full',
  },
];
