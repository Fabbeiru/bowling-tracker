import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  icon: 'home' | 'games' | 'stats' | 'arsenal' | 'settings';
}

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss',
})
export class BottomNav {
  readonly items: NavItem[] = [
    { path: '/inicio', label: 'Inicio', icon: 'home' },
    { path: '/partidas', label: 'Partidas', icon: 'games' },
    { path: '/estadisticas', label: 'Estadísticas', icon: 'stats' },
    { path: '/arsenal', label: 'Arsenal', icon: 'arsenal' },
    { path: '/ajustes', label: 'Ajustes', icon: 'settings' },
  ];
}
