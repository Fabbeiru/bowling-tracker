import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { ToastService } from '../../core/errors/toast.service';
import { createVenue, Venue } from '../../models';
import { BackLink } from '../../shared/components/back-link/back-link';

@Component({
  selector: 'app-venue-form',
  imports: [ReactiveFormsModule, TranslocoDirective, BackLink],
  templateUrl: './venue-form.html',
  styleUrl: '../ball-form/ball-form.scss',
})
export class VenueForm {
  private readonly fb = inject(FormBuilder);
  private readonly repo = inject(Repository);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  private existing: Venue | null = null;
  readonly editing = signal(false);
  readonly active = signal(true);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    city: ['', [Validators.maxLength(60)]],
    lanes: this.fb.control<number | null>(null, [Validators.min(1), Validators.max(200)]),
    notes: ['', [Validators.maxLength(500)]],
  });

  constructor() {
    const id = inject(ActivatedRoute).snapshot.paramMap.get('id');
    if (id) void this.load(id);
  }

  private async load(id: string): Promise<void> {
    let venue: Venue | undefined;
    try {
      venue = await this.repo.getVenue(id);
    } catch {
      this.toast.error('errors.loadVenue');
      return;
    }
    if (!venue) return;
    this.existing = venue;
    this.editing.set(true);
    this.active.set(venue.active);
    this.form.patchValue({
      name: venue.name,
      city: venue.city ?? '',
      lanes: venue.lanes ?? null,
      notes: venue.notes ?? '',
    });
  }

  async save(): Promise<void> {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const patch = {
      name: v.name.trim(),
      city: v.city.trim() || undefined,
      lanes: v.lanes ?? undefined,
      notes: v.notes.trim() || undefined,
    };
    const venue: Venue = this.existing ? { ...this.existing, ...patch } : createVenue(patch);
    try {
      await this.repo.saveVenue(venue);
      await this.router.navigate(['/venues']);
    } catch {
      this.toast.error('errors.saveVenue');
    }
  }

  async toggleActive(): Promise<void> {
    if (!this.existing) return;
    try {
      if (this.existing.active) await this.repo.deactivateVenue(this.existing.id);
      else await this.repo.saveVenue({ ...this.existing, active: true });
      await this.router.navigate(['/venues']);
    } catch {
      this.toast.error('errors.updateVenue');
    }
  }
}
