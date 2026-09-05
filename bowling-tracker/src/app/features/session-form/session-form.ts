import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { ToastService } from '../../core/errors/toast.service';
import { Competition, Session, SessionType, Venue } from '../../models';
import { BackLink } from '../../shared/components/back-link/back-link';

@Component({
  selector: 'app-session-form',
  imports: [ReactiveFormsModule, TranslocoDirective, BackLink],
  templateUrl: './session-form.html',
  styleUrl: '../ball-form/ball-form.scss',
})
export class SessionForm {
  private readonly fb = inject(FormBuilder);
  private readonly repo = inject(Repository);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  private existing: Session | null = null;
  readonly sessionId = signal<string | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly sessionTypes: SessionType[] = ['practice', 'league', 'tournament', 'social'];
  readonly type = signal<SessionType>('practice');
  readonly venues = signal<Venue[]>([]);
  readonly competitions = signal<Competition[]>([]);

  readonly relevantCompetitions = computed(() => {
    const t = this.type();
    if (t !== 'league' && t !== 'tournament') return [];
    return this.competitions().filter((c) => c.type === t);
  });

  readonly form = this.fb.nonNullable.group({
    date: this.fb.nonNullable.control('', [Validators.required]),
    competitionId: this.fb.nonNullable.control(''),
    venueId: this.fb.nonNullable.control(''),
    lanes: this.fb.nonNullable.control('', [Validators.maxLength(40)]),
    notes: this.fb.nonNullable.control('', [Validators.maxLength(500)]),
  });

  constructor() {
    const id = inject(ActivatedRoute).snapshot.paramMap.get('id');
    if (id) void this.load(id);
    else this.loading.set(false);
  }

  private async load(id: string): Promise<void> {
    try {
      const [session, venues, competitions] = await Promise.all([
        this.repo.getSession(id),
        this.repo.listVenues({ includeInactive: true }),
        this.repo.listCompetitions({ includeInactive: true }),
      ]);
      this.venues.set(venues);
      this.competitions.set(competitions);
      if (!session) return;
      this.existing = session;
      this.sessionId.set(session.id);
      this.type.set(session.type);
      this.form.patchValue({
        date: session.date,
        competitionId: session.competitionId ?? '',
        venueId: session.venueId ?? '',
        lanes: session.lanes ?? '',
        notes: session.notes ?? '',
      });
    } catch {
      this.toast.error('errors.loadSession');
    } finally {
      this.loading.set(false);
    }
  }

  selectType(value: SessionType): void {
    this.type.set(value);
    if (value !== 'league' && value !== 'tournament') {
      this.form.controls.competitionId.setValue('');
    }
  }

  async save(): Promise<void> {
    if (!this.existing || this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    const type = this.type();
    const updated: Session = {
      ...this.existing,
      type,
      date: v.date,
      competitionId:
        (type === 'league' || type === 'tournament') && v.competitionId ? v.competitionId : undefined,
      venueId: v.venueId || undefined,
      lanes: v.lanes.trim() || undefined,
      notes: v.notes.trim() || undefined,
    };
    try {
      await this.repo.saveSession(updated);
      await this.router.navigate(['/sessions', this.existing.id]);
    } catch {
      this.toast.error('errors.saveSession');
    } finally {
      this.saving.set(false);
    }
  }
}
