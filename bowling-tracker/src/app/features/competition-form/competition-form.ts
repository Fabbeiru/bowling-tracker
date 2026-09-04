import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { Competition, CompetitionType, createCompetition } from '../../models';

@Component({
  selector: 'app-competition-form',
  imports: [ReactiveFormsModule, TranslocoDirective],
  templateUrl: './competition-form.html',
  styleUrl: '../ball-form/ball-form.scss',
})
export class CompetitionForm {
  private readonly fb = inject(FormBuilder);
  private readonly repo = inject(Repository);
  private readonly router = inject(Router);

  private existing: Competition | null = null;
  readonly editing = signal(false);
  readonly active = signal(true);
  readonly types: CompetitionType[] = ['league', 'tournament'];

  readonly form = this.fb.nonNullable.group({
    type: this.fb.nonNullable.control<CompetitionType>('league'),
    name: ['', [Validators.required, Validators.maxLength(80)]],
    season: [''],
    startDate: [''],
    endDate: [''],
    notes: [''],
  });

  constructor() {
    const id = inject(ActivatedRoute).snapshot.paramMap.get('id');
    if (id) void this.load(id);
  }

  private async load(id: string): Promise<void> {
    const c = await this.repo.getCompetition(id);
    if (!c) return;
    this.existing = c;
    this.editing.set(true);
    this.active.set(c.active);
    this.form.patchValue({
      type: c.type,
      name: c.name,
      season: c.season ?? '',
      startDate: c.startDate ?? '',
      endDate: c.endDate ?? '',
      notes: c.notes ?? '',
    });
  }

  setType(type: CompetitionType): void {
    this.form.controls.type.setValue(type);
  }

  async save(): Promise<void> {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const patch = {
      type: v.type,
      name: v.name.trim(),
      season: v.season.trim() || undefined,
      startDate: v.startDate || undefined,
      endDate: v.endDate || undefined,
      notes: v.notes.trim() || undefined,
    };
    const competition: Competition = this.existing
      ? { ...this.existing, ...patch }
      : createCompetition(patch);
    await this.repo.saveCompetition(competition);
    await this.router.navigate(['/arsenal']);
  }

  async toggleActive(): Promise<void> {
    if (!this.existing) return;
    if (this.existing.active) await this.repo.deactivateCompetition(this.existing.id);
    else await this.repo.saveCompetition({ ...this.existing, active: true });
    await this.router.navigate(['/arsenal']);
  }
}
