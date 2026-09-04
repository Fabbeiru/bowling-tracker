import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

type NavIcon = 'home' | 'games' | 'stats' | 'arsenal' | 'settings';

interface NavItem {
  path: string;
  labelKey: string;
  icon: NavIcon;
}

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive, TranslocoDirective],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss',
})
export class BottomNav {
  readonly items: NavItem[] = [
    { path: '/home', labelKey: 'nav.home', icon: 'home' },
    { path: '/games', labelKey: 'nav.games', icon: 'games' },
    { path: '/stats', labelKey: 'nav.stats', icon: 'stats' },
    { path: '/arsenal', labelKey: 'nav.arsenal', icon: 'arsenal' },
    { path: '/settings', labelKey: 'nav.settings', icon: 'settings' },
  ];
}
