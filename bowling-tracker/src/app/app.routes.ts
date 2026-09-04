import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    title: 'Inicio · Bowling Tracker',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'games',
    title: 'Partidas · Bowling Tracker',
    loadComponent: () => import('./features/games/games').then((m) => m.Games),
  },
  {
    path: 'games/new',
    title: 'Nueva partida · Bowling Tracker',
    loadComponent: () => import('./features/game-new/game-new').then((m) => m.GameNew),
  },
  {
    path: 'games/:id',
    title: 'Partida · Bowling Tracker',
    loadComponent: () => import('./features/game-entry/game-entry').then((m) => m.GameEntry),
  },
  {
    path: 'stats',
    title: 'Estadísticas · Bowling Tracker',
    loadComponent: () => import('./features/stats/stats').then((m) => m.Stats),
  },
  {
    path: 'arsenal',
    title: 'Arsenal · Bowling Tracker',
    loadComponent: () => import('./features/arsenal/arsenal').then((m) => m.Arsenal),
  },
  {
    path: 'settings',
    title: 'Ajustes · Bowling Tracker',
    loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
  },
  {
    path: '**',
    title: 'No encontrado · Bowling Tracker',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
