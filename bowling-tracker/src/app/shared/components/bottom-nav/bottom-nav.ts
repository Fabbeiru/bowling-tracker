import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { filter, map, startWith } from 'rxjs';

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
  private readonly router = inject(Router);

  readonly items: NavItem[] = [
    { path: '/home', labelKey: 'nav.home', icon: 'home' },
    { path: '/games', labelKey: 'nav.games', icon: 'games' },
    { path: '/stats', labelKey: 'nav.stats', icon: 'stats' },
    { path: '/arsenal', labelKey: 'nav.arsenal', icon: 'arsenal' },
    { path: '/settings', labelKey: 'nav.settings', icon: 'settings' },
  ];

  /** Drives the sliding indicator — which slot it sits under. */
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly activeIndex = computed(() => {
    const url = this.currentUrl();
    const idx = this.items.findIndex((item) => url.startsWith(item.path));
    return idx === -1 ? 0 : idx;
  });
}
