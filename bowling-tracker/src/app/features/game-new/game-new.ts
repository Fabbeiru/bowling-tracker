import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { ToastService } from '../../core/errors/toast.service';
import { todayLocalIso } from '../../core/util/dates';
import {
  Ball,
  Competition,
  CompetitionType,
  createCompetition,
  createGame,
  createSession,
  DetailLevel,
  SessionType,
  Venue,
} from '../../models';
import { BackLink } from '../../shared/components/back-link/back-link';

@Component({
  selector: 'app-game-new',
  imports: [ReactiveFormsModule, FormsModule, TranslocoDirective, BackLink],
  templateUrl: './game-new.html',
  styleUrl: './game-new.scss',
})
export class GameNew {
  private readonly fb = inject(FormBuilder);
  private readonly repo = inject(Repository);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly sessionTypes: SessionType[] = ['practice', 'league', 'tournament', 'social'];
  readonly detailLevels: DetailLevel[] = ['total', 'frame', 'throw'];
  readonly saving = signal(false);
  readonly balls = signal<Ball[]>([]);
  readonly venues = signal<Venue[]>([]);
  readonly competitions = signal<Competition[]>([]);
  readonly type = signal<SessionType>('practice');

  readonly showQuickCreate = signal(false);
  readonly quickName = signal('');
  readonly quickSeason = signal('');
  readonly creatingCompetition = signal(false);

  readonly relevantCompetitions = computed(() => {
    const t = this.type();
    if (t !== 'league' && t !== 'tournament') return [];
    return this.competitions().filter((c) => c.type === t);
  });

  readonly form = this.fb.nonNullable.group({
    date: this.fb.nonNullable.control(todayLocalIso()),
    detailLevel: this.fb.nonNullable.control<DetailLevel>('frame'),
    competitionId: this.fb.nonNullable.control(''),
    venueId: this.fb.nonNullable.control(''),
    primaryBallId: this.fb.nonNullable.control(''),
    spareBallId: this.fb.nonNullable.control(''),
  });

  constructor() {
    void this.loadPickers();
  }

  private async loadPickers(): Promise<void> {
    try {
      const [balls, venues, competitions] = await Promise.all([
        this.repo.listBalls(),
        this.repo.listVenues(),
        this.repo.listCompetitions(),
      ]);
      this.balls.set(balls);
      this.venues.set(venues);
      this.competitions.set(competitions);
    } catch {
      this.toast.error('errors.loadPickers');
    }
  }

  selectType(value: SessionType): void {
    this.type.set(value);
    if (value !== 'league' && value !== 'tournament') {
      this.form.controls.competitionId.setValue('');
    }
  }

  selectLevel(value: DetailLevel): void {
    this.form.controls.detailLevel.setValue(value);
  }

  openQuickCreate(): void {
    this.quickName.set('');
    this.quickSeason.set('');
    this.showQuickCreate.set(true);
  }

  async quickCreateCompetition(): Promise<void> {
    const name = this.quickName().trim();
    const type = this.type();
    if (!name || (type !== 'league' && type !== 'tournament') || this.creatingCompetition()) return;
    this.creatingCompetition.set(true);
    try {
      const competition = createCompetition({
        type: type as CompetitionType,
        name,
        season: this.quickSeason().trim() || undefined,
      });
      await this.repo.saveCompetition(competition);
      this.competitions.update((list) => [...list, competition]);
      this.form.controls.competitionId.setValue(competition.id);
      this.showQuickCreate.set(false);
    } catch {
      this.toast.error('errors.createCompetition');
    } finally {
      this.creatingCompetition.set(false);
    }
  }

  async start(): Promise<void> {
    if (this.saving()) return;
    this.saving.set(true);
    try {
      const v = this.form.getRawValue();
      const session = createSession({
        type: this.type(),
        date: v.date,
        defaultDetailLevel: v.detailLevel,
        competitionId: v.competitionId || undefined,
        venueId: v.venueId || undefined,
      });
      await this.repo.saveSession(session);

      const game = createGame({
        sessionId: session.id,
        index: 1,
        detailLevel: v.detailLevel,
        primaryBallId: v.primaryBallId || undefined,
        spareBallId: v.spareBallId || undefined,
      });
      await this.repo.saveGame(game);

      await this.router.navigate(['/games', game.id]);
    } catch {
      this.toast.error('errors.createGame');
    } finally {
      this.saving.set(false);
    }
  }
}
