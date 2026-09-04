import { Component, computed, inject, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { ToastService } from '../../core/errors/toast.service';
import { computeStats } from '../../core/stats/stats';
import { Competition, Game, Session, SessionType } from '../../models';

type TypeFilter = SessionType | 'all';

@Component({
  selector: 'app-stats',
  imports: [TranslocoDirective],
  templateUrl: './stats.html',
  styleUrl: './stats.scss',
})
export class Stats {
  private readonly repo = inject(Repository);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  private readonly games = signal<Game[]>([]);
  private readonly sessions = signal<Session[]>([]);
  readonly competitions = signal<Competition[]>([]);

  readonly typeFilter = signal<TypeFilter>('all');
  readonly competitionFilter = signal<string>('all');
  readonly typeOptions: TypeFilter[] = ['all', 'practice', 'league', 'tournament', 'social'];

  private readonly sessionById = computed(() => new Map(this.sessions().map((s) => [s.id, s])));

  private readonly filteredGames = computed(() => {
    const type = this.typeFilter();
    const comp = this.competitionFilter();
    const byId = this.sessionById();
    return this.games().filter((g) => {
      const s = byId.get(g.sessionId);
      if (!s) return false;
      if (type !== 'all' && s.type !== type) return false;
      if (comp !== 'all' && s.competitionId !== comp) return false;
      return true;
    });
  });

  readonly stats = computed(() => computeStats(this.filteredGames()));

  readonly bars = computed(() => {
    const scores = this.stats().evolution.slice(-24);
    if (scores.length === 0) return [];
    const lo = Math.max(0, Math.min(...scores) - 15);
    const hi = Math.max(...scores) + 5;
    const span = Math.max(1, hi - lo);
    return scores.map((s) => Math.max(6, Math.round(((s - lo) / span) * 100)));
  });

  constructor() {
    void this.load();
  }

  selectType(type: TypeFilter): void {
    this.typeFilter.set(type);
    if (type !== 'league' && type !== 'tournament') {
      this.competitionFilter.set('all');
    }
  }

  private async load(): Promise<void> {
    try {
      const [games, sessions, competitions] = await Promise.all([
        this.repo.listGames(),
        this.repo.listSessions(),
        this.repo.listCompetitions({ includeInactive: true }),
      ]);
      this.games.set(games);
      this.sessions.set(sessions);
      this.competitions.set(competitions);
    } catch {
      this.toast.error('No se pudieron cargar las estadísticas.');
    } finally {
      this.loading.set(false);
    }
  }

  pct(value: number | null): string {
    return value === null ? '—' : `${value}%`;
  }
}
