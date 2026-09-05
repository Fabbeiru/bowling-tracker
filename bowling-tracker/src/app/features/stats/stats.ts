import { Component, computed, inject, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { ToastService } from '../../core/errors/toast.service';
import { computeStats } from '../../core/stats/stats';
import { scoreGame } from '../../core/scoring';
import { Ball, Competition, Game, Session, SessionType, Venue } from '../../models';

type TypeFilter = SessionType | 'all';

interface NamedAverage {
  name: string;
  average: number;
  games: number;
}

/** SVG geometry for the evolution chart (viewBox 0 0 100 40). */
interface Chart {
  /** Polyline points, most recent last. */
  line: string;
  /** Area path (line closed to the bottom). */
  area: string;
  /** Dots for each game. */
  dots: { x: number; y: number; last: boolean }[];
  /** Y of the average line. */
  avgY: number;
  lo: number;
  hi: number;
  avg: number;
}

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
  private readonly balls = signal<Ball[]>([]);
  private readonly venues = signal<Venue[]>([]);
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

  /** Average final score per ball (primary ball), for balls used in 3+ finished games. */
  readonly byBall = computed<NamedAverage[]>(() =>
    this.averageBy(
      new Map(this.balls().map((b) => [b.id, b.name])),
      (g) => g.primaryBallId,
    ),
  );

  /** Average final score per venue, for venues played in 3+ finished games. */
  readonly byVenue = computed<NamedAverage[]>(() => {
    const byId = this.sessionById();
    return this.averageBy(
      new Map(this.venues().map((v) => [v.id, v.name])),
      (g) => byId.get(g.sessionId)?.venueId,
    );
  });

  private averageBy(names: Map<string, string>, keyOf: (g: Game) => string | undefined): NamedAverage[] {
    const acc = new Map<string, { sum: number; n: number }>();
    for (const g of this.filteredGames()) {
      const key = keyOf(g);
      if (!key) continue;
      const s = scoreGame(g);
      const done = g.detailLevel === 'total' ? g.totalPins !== undefined : s.complete;
      if (!done) continue;
      const cur = acc.get(key) ?? { sum: 0, n: 0 };
      cur.sum += s.total;
      cur.n += 1;
      acc.set(key, cur);
    }
    return [...acc.entries()]
      .filter(([, v]) => v.n >= 3)
      .map(([id, v]) => ({ name: names.get(id) ?? '—', average: Math.round(v.sum / v.n), games: v.n }))
      .sort((a, b) => b.average - a.average);
  }

  readonly chart = computed<Chart | null>(() => {
    const scores = this.stats().evolution.slice(-24);
    if (scores.length < 2) return null;
    const avg = this.stats().summary.average ?? 0;
    const lo = Math.max(0, Math.min(...scores, avg) - 12);
    const hi = Math.min(300, Math.max(...scores, avg) + 12);
    const span = Math.max(1, hi - lo);
    const x = (i: number) => (scores.length === 1 ? 50 : (i / (scores.length - 1)) * 100);
    const y = (s: number) => 40 - ((s - lo) / span) * 40;
    const pts = scores.map((s, i) => ({ x: x(i), y: y(s) }));
    const coords = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`);
    const line = coords.join(' ');
    const first = pts[0];
    const lastP = pts[pts.length - 1];
    const area = `M${first.x.toFixed(1)},40 L${coords.join(' L')} L${lastP.x.toFixed(1)},40 Z`;
    return {
      line,
      area,
      dots: pts.map((p, i) => ({ x: p.x, y: p.y, last: i === pts.length - 1 })),
      avgY: y(avg),
      lo: Math.round(lo),
      hi: Math.round(hi),
      avg: Math.round(avg),
    };
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
      const [games, sessions, competitions, balls, venues] = await Promise.all([
        this.repo.listGames(),
        this.repo.listSessions(),
        this.repo.listCompetitions({ includeInactive: true }),
        this.repo.listBalls({ includeInactive: true }),
        this.repo.listVenues({ includeInactive: true }),
      ]);
      this.games.set(games);
      this.sessions.set(sessions);
      this.competitions.set(competitions);
      this.balls.set(balls);
      this.venues.set(venues);
    } catch {
      this.toast.error('errors.loadStats');
    } finally {
      this.loading.set(false);
    }
  }

  pct(value: number | null): string {
    return value === null ? '—' : `${value}%`;
  }
}
