import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { ToastService } from '../../core/errors/toast.service';
import { computeStats, statsByBall } from '../../core/stats/stats';
import { scoreGame } from '../../core/scoring';
import { Ball, Competition, Game, Id, Session, SessionType, Venue } from '../../models';
import { FilterSelect } from '../../shared/components/filter-select/filter-select';
import { FilterSheet } from '../../shared/components/filter-sheet/filter-sheet';
import { FilterTrigger } from '../../shared/components/filter-trigger/filter-trigger';
import { Tile } from '../../shared/components/tile/tile';
import { HorizontalWheelScroll } from '../../shared/directives/horizontal-wheel-scroll.directive';
import { WrapAwareRow } from '../../shared/directives/wrap-aware-row.directive';

type TypeFilter = SessionType | 'all';

interface NamedAverage {
  id: Id;
  name: string;
  average: number;
  games: number;
}

interface BallComparisonRow extends NamedAverage {
  strikePct: number | null;
  strikes: number;
  strikeAttempts: number;
  sparePct: number | null;
  sparesConverted: number;
  spareAttempts: number;
}

/** SVG geometry for the evolution chart (viewBox 0 0 600 `h`, `h` dynamic — see `chartAspect`). */
interface Chart {
  /** Polyline points, most recent last. */
  line: string;
  /** Area path (line closed to the bottom). */
  area: string;
  /** Dots for each game. */
  dots: { x: number; y: number; last: boolean; r: number }[];
  /** Y of the average line. */
  avgY: number;
  lo: number;
  hi: number;
  avg: number;
  /** viewBox height matching the current box's real aspect ratio. */
  h: number;
}

@Component({
  selector: 'app-stats',
  imports: [TranslocoDirective, HorizontalWheelScroll, WrapAwareRow, FilterSheet, FilterSelect, FilterTrigger, Tile],
  templateUrl: './stats.html',
  styleUrl: './stats.scss',
})
export class Stats {
  private readonly repo = inject(Repository);
  private readonly toast = inject(ToastService);

  private readonly chartSvg = viewChild<ElementRef<SVGSVGElement>>('chartSvg');
  /**
   * Real width/height of the chart's own box — measured, not assumed. A
   * fixed `viewBox` ratio can't fit every screen: mobile's box is close to
   * square (~2.6:1) while a wide desktop card is much flatter (~5.4:1);
   * whichever axis the `viewBox` guesses wrong either wastes it as empty
   * padding (`preserveAspectRatio="meet"`) or, the other way round, stops
   * the chart from using the full width it has. Matching the `viewBox`
   * height to the real box every time both axes always resolve to the same
   * scale, so nothing is ever wasted or clipped.
   */
  private readonly chartAspect = signal(600 / 220);
  /**
   * Real pixels-per-`viewBox`-unit of the chart right now (`boxWidth / W`).
   * The dots' radius is defined in on-screen pixels and divided by this to
   * get `viewBox` units — so a fixed pixel target renders the same size on
   * any screen, instead of a fixed `viewBox` radius scaling right along
   * with the box (tiny on a narrow phone card, huge on a wide desktop one:
   * measured 7.7px vs 23px in diameter for the exact same `r`).
   */
  private readonly chartScale = signal(258 / 600);

  readonly loading = signal(true);
  private readonly games = signal<Game[]>([]);
  private readonly sessions = signal<Session[]>([]);
  readonly balls = signal<Ball[]>([]);
  readonly venues = signal<Venue[]>([]);
  readonly competitions = signal<Competition[]>([]);

  readonly typeFilter = signal<TypeFilter>('all');
  readonly competitionFilter = signal<string>('all');
  /** Filters by `Session.venueId` / `Game.primaryBallId` respectively. */
  readonly venueFilter = signal<string>('all');
  readonly ballFilter = signal<string>('all');
  readonly typeOptions: TypeFilter[] = ['all', 'practice', 'league', 'tournament', 'social'];

  /** Bottom sheet holding competition/venue/ball — separate from the always-visible type chips. */
  readonly sheetOpen = signal(false);

  /** How many of the sheet's filters are active; shown as a badge on its trigger. */
  readonly activeFilterCount = computed(
    () =>
      (this.competitionFilter() !== 'all' ? 1 : 0) +
      (this.venueFilter() !== 'all' ? 1 : 0) +
      (this.ballFilter() !== 'all' ? 1 : 0),
  );

  readonly competitionOptions = computed(() => this.competitions().map((c) => ({ id: c.id, name: c.name })));
  readonly venueOptions = computed(() => this.venues().map((v) => ({ id: v.id, name: v.name })));
  readonly ballOptions = computed(() => this.balls().map((b) => ({ id: b.id, name: b.name })));

  private readonly sessionById = computed(() => new Map(this.sessions().map((s) => [s.id, s])));

  private readonly filteredGames = computed(() => {
    const type = this.typeFilter();
    const comp = this.competitionFilter();
    const venue = this.venueFilter();
    const ball = this.ballFilter();
    const byId = this.sessionById();
    return this.games().filter((g) => {
      const s = byId.get(g.sessionId);
      if (!s) return false;
      if (type !== 'all' && s.type !== type) return false;
      if (comp !== 'all' && s.competitionId !== comp) return false;
      if (venue !== 'all' && s.venueId !== venue) return false;
      if (ball !== 'all' && g.primaryBallId !== ball) return false;
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

  /** `byBall`, plus strike% / spare-conversion% attributed per delivery (throw/frame detail). */
  readonly ballComparison = computed<BallComparisonRow[]>(() => {
    const perBall = statsByBall(this.filteredGames());
    return this.byBall().map((row) => {
      const b = perBall.get(row.id);
      return {
        ...row,
        strikePct: b?.strikePct ?? null,
        strikes: b?.strikes ?? 0,
        strikeAttempts: b?.strikeAttempts ?? 0,
        sparePct: b?.sparePct ?? null,
        sparesConverted: b?.sparesConverted ?? 0,
        spareAttempts: b?.spareAttempts ?? 0,
      };
    });
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
      .map(([id, v]) => ({ id, name: names.get(id) ?? '—', average: Math.round(v.sum / v.n), games: v.n }))
      .sort((a, b) => b.average - a.average);
  }

  readonly chart = computed<Chart | null>(() => {
    const scores = this.stats().evolution.slice(-13);
    if (scores.length < 2) return null;
    // `viewBox` alto = ancho / relación-de-aspecto REAL medida (ver
    // `chartAspect`) — nunca un número fijo: el mismo fijo que rellenaba
    // bien en móvil dejaba sin usar buena parte del ancho en un card de
    // escritorio, y viceversa.
    const W = 600;
    const H = Math.round(W / this.chartAspect());
    // Radio en unidades del `viewBox`, a partir de un tamaño EN PANTALLA
    // fijo (unos 5px/9px de diámetro) dividido entre la escala real
    // (`chartScale`, px reales por unidad) — así el punto se ve del mismo
    // tamaño aproximado en cualquier ancho, en vez de estirarse en
    // proporción a lo grande que sea el gráfico (que es justo lo que hacía
    // que se vieran diminutos en móvil y enormes en un card de escritorio).
    const scale = this.chartScale();
    const dotR = 2.5 / scale;
    const lastDotR = 4.5 / scale;
    const avg = this.stats().summary.average ?? 0;
    const lo = Math.max(0, Math.min(...scores, avg) - 12);
    const hi = Math.min(300, Math.max(...scores, avg) + 12);
    const span = Math.max(1, hi - lo);
    const x = (i: number) => (i / (scores.length - 1)) * W;
    const y = (s: number) => H - ((s - lo) / span) * H;
    const pts = scores.map((s, i) => ({ x: x(i), y: y(s) }));
    const coords = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`);
    const line = coords.join(' ');
    const first = pts[0];
    const lastP = pts[pts.length - 1];
    const area = `M${first.x.toFixed(1)},${H} L${coords.join(' L')} L${lastP.x.toFixed(1)},${H} Z`;
    return {
      line,
      area,
      dots: pts.map((p, i) => ({ x: p.x, y: p.y, last: i === pts.length - 1, r: i === pts.length - 1 ? lastDotR : dotR })),
      avgY: y(avg),
      lo: Math.round(lo),
      hi: Math.round(hi),
      avg: Math.round(avg),
      h: H,
    };
  });

  constructor() {
    void this.load();

    // El `<svg>` solo existe en el DOM mientras `chart()` no es null (vive
    // dentro de un `@if`) — un `ngAfterViewInit` de toda la vida se
    // ejecuta una sola vez y se lo perdería si el gráfico aparece más
    // tarde (nada más cargar, antes de tener datos, `chart()` es null).
    // `effect()` sobre la señal de `viewChild` sí vuelve a reaccionar cada
    // vez que el elemento aparece o desaparece — y `onCleanup` ya
    // desconecta el `ResizeObserver` de la ejecución anterior antes de la
    // siguiente (y al destruirse el componente), así que no hace falta
    // guardarlo en un campo aparte ni un `ngOnDestroy` propio.
    effect((onCleanup) => {
      const svg = this.chartSvg()?.nativeElement;
      if (!svg) return;
      const update = () => {
        const box = svg.getBoundingClientRect();
        if (box.width > 0 && box.height > 0) {
          this.chartAspect.set(box.width / box.height);
          this.chartScale.set(box.width / 600);
        }
      };
      update();
      const ro = new ResizeObserver(update);
      ro.observe(svg);
      onCleanup(() => ro.disconnect());
    });
  }

  selectType(type: TypeFilter): void {
    this.typeFilter.set(type);
    if (type !== 'league' && type !== 'tournament') {
      this.competitionFilter.set('all');
    }
  }

  openSheet(): void {
    this.sheetOpen.set(true);
  }

  closeSheet(): void {
    this.sheetOpen.set(false);
  }

  clearSheetFilters(): void {
    this.competitionFilter.set('all');
    this.venueFilter.set('all');
    this.ballFilter.set('all');
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
