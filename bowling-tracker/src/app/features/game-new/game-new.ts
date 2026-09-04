import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { todayLocalIso } from '../../core/util/dates';
import {
  Ball,
  Competition,
  createGame,
  createSession,
  DetailLevel,
  SessionType,
  Venue,
} from '../../models';

@Component({
  selector: 'app-game-new',
  imports: [ReactiveFormsModule, RouterLink, TranslocoDirective],
  templateUrl: './game-new.html',
  styleUrl: './game-new.scss',
})
export class GameNew {
  private readonly fb = inject(FormBuilder);
  private readonly repo = inject(Repository);
  private readonly router = inject(Router);

  readonly sessionTypes: SessionType[] = ['practice', 'league', 'tournament', 'social'];
  readonly detailLevels: DetailLevel[] = ['total', 'frame', 'throw'];
  readonly saving = signal(false);
  readonly balls = signal<Ball[]>([]);
  readonly venues = signal<Venue[]>([]);
  readonly competitions = signal<Competition[]>([]);
  readonly type = signal<SessionType>('practice');

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
    void Promise.all([
      this.repo.listBalls(),
      this.repo.listVenues(),
      this.repo.listCompetitions(),
    ]).then(([balls, venues, competitions]) => {
      this.balls.set(balls);
      this.venues.set(venues);
      this.competitions.set(competitions);
    });
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
    } finally {
      this.saving.set(false);
    }
  }
}
