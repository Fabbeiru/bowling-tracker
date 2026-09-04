import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  {
    path: 'inicio',
    title: 'Inicio · Bowling Tracker',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'partidas',
    title: 'Partidas · Bowling Tracker',
    loadComponent: () => import('./features/games/games').then((m) => m.Games),
  },
  {
    path: 'estadisticas',
    title: 'Estadísticas · Bowling Tracker',
    loadComponent: () => import('./features/stats/stats').then((m) => m.Stats),
  },
  {
    path: 'arsenal',
    title: 'Arsenal · Bowling Tracker',
    loadComponent: () => import('./features/arsenal/arsenal').then((m) => m.Arsenal),
  },
  {
    path: 'ajustes',
    title: 'Ajustes · Bowling Tracker',
    loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
  },
  {
    path: '**',
    title: 'No encontrado · Bowling Tracker',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
