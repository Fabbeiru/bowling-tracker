import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { ToastService } from '../../core/errors/toast.service';
import { computeStats, sessionTotals } from '../../core/stats/stats';
import { Competition, Game, Session, Venue } from '../../models';
import { BackLink } from '../../shared/components/back-link/back-link';

interface SessionRow {
  session: Session;
  venueName?: string;
  series: number;
  average: number | null;
}

@Component({
  selector: 'app-competition-detail',
  imports: [RouterLink, TranslocoDirective, BackLink],
  templateUrl: './competition-detail.html',
  styleUrl: './competition-detail.scss',
})
export class CompetitionDetail {
  private readonly repo = inject(Repository);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly competition = signal<Competition | null>(null);
  private readonly sessions = signal<Session[]>([]);
  private readonly games = signal<Game[]>([]);
  private readonly venueNames = signal<Map<string, string>>(new Map());

  readonly stats = computed(() => computeStats(this.games()));

  readonly rows = computed<SessionRow[]>(() => {
    const gamesBySession = new Map<string, Game[]>();
    for (const g of this.games()) {
      const list = gamesBySession.get(g.sessionId) ?? [];
      list.push(g);
      gamesBySession.set(g.sessionId, list);
    }
    return [...this.sessions()]
      .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))
      .map((session) => {
        const totals = sessionTotals(gamesBySession.get(session.id) ?? []);
        return {
          session,
          venueName: session.venueId ? this.venueNames().get(session.venueId) : undefined,
          series: totals.series,
          average: totals.average,
        };
      });
  });

  /** Sessions with a handicap on record, oldest first — the "progress" view. */
  readonly handicapRows = computed(() => this.rows().filter((r) => r.session.handicap !== undefined));

  constructor() {
    const id = inject(ActivatedRoute).snapshot.paramMap.get('id');
    if (id) void this.load(id);
    else this.loading.set(false);
  }

  private async load(id: string): Promise<void> {
    try {
      const [competition, allSessions, allGames, venues] = await Promise.all([
        this.repo.getCompetition(id),
        this.repo.listSessions(),
        this.repo.listGames(),
        this.repo.listVenues({ includeInactive: true }),
      ]);
      this.competition.set(competition ?? null);
      const sessions = allSessions.filter((s) => s.competitionId === id);
      const sessionIds = new Set(sessions.map((s) => s.id));
      this.sessions.set(sessions);
      this.games.set(allGames.filter((g) => sessionIds.has(g.sessionId)));
      this.venueNames.set(new Map(venues.map((v) => [v.id, v.name])));
    } catch {
      this.toast.error('errors.loadCompetition');
    } finally {
      this.loading.set(false);
    }
  }
}
