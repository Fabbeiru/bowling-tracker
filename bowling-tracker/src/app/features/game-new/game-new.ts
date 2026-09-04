import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { todayLocalIso } from '../../core/util/dates';
import { Ball, createGame, createSession, DetailLevel, SessionType, Venue } from '../../models';

@Component({
  selector: 'app-game-new',
  imports: [ReactiveFormsModule, TranslocoDirective],
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

  readonly form = this.fb.nonNullable.group({
    type: this.fb.nonNullable.control<SessionType>('practice'),
    date: this.fb.nonNullable.control(todayLocalIso()),
    detailLevel: this.fb.nonNullable.control<DetailLevel>('frame'),
    venueId: this.fb.nonNullable.control(''),
    primaryBallId: this.fb.nonNullable.control(''),
    spareBallId: this.fb.nonNullable.control(''),
  });

  constructor() {
    void Promise.all([this.repo.listBalls(), this.repo.listVenues()]).then(([balls, venues]) => {
      this.balls.set(balls);
      this.venues.set(venues);
    });
  }

  select<K extends 'type' | 'detailLevel'>(key: K, value: string): void {
    this.form.controls[key].setValue(value as never);
  }

  async start(): Promise<void> {
    if (this.saving()) return;
    this.saving.set(true);
    try {
      const v = this.form.getRawValue();
      const session = createSession({
        type: v.type,
        date: v.date,
        defaultDetailLevel: v.detailLevel,
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
