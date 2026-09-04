import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { ToastService } from '../../core/errors/toast.service';
import { Ball, createBall } from '../../models';
import { BackLink } from '../../shared/components/back-link/back-link';
import { BallAvatar } from '../../shared/components/ball-avatar/ball-avatar';

@Component({
  selector: 'app-ball-form',
  imports: [ReactiveFormsModule, TranslocoDirective, BackLink, BallAvatar],
  templateUrl: './ball-form.html',
  styleUrl: './ball-form.scss',
})
export class BallForm {
  private readonly fb = inject(FormBuilder);
  private readonly repo = inject(Repository);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  private existing: Ball | null = null;
  readonly editing = signal(false);
  readonly active = signal(true);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    brand: [''],
    weightLb: this.fb.control<number | null>(null, [Validators.min(6), Validators.max(16)]),
    coverstock: [''],
    layout: [''],
    imageUrl: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
    notes: [''],
  });

  /** Live preview of the image URL field, so a bad link is obvious before saving. */
  readonly imagePreviewError = signal(false);

  constructor() {
    const id = inject(ActivatedRoute).snapshot.paramMap.get('id');
    if (id) void this.load(id);
  }

  private async load(id: string): Promise<void> {
    let ball: Ball | undefined;
    try {
      ball = await this.repo.getBall(id);
    } catch {
      this.toast.error('errors.loadBall');
      return;
    }
    if (!ball) return;
    this.existing = ball;
    this.editing.set(true);
    this.active.set(ball.active);
    this.form.patchValue({
      name: ball.name,
      brand: ball.brand ?? '',
      weightLb: ball.weightLb ?? null,
      coverstock: ball.coverstock ?? '',
      layout: ball.layout ?? '',
      imageUrl: ball.imageUrl ?? '',
      notes: ball.notes ?? '',
    });
  }

  async save(): Promise<void> {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const patch = {
      name: v.name.trim(),
      brand: v.brand.trim() || undefined,
      weightLb: v.weightLb ?? undefined,
      coverstock: v.coverstock.trim() || undefined,
      layout: v.layout.trim() || undefined,
      imageUrl: v.imageUrl.trim() || undefined,
      notes: v.notes.trim() || undefined,
    };
    const ball: Ball = this.existing
      ? { ...this.existing, ...patch }
      : createBall(patch);
    try {
      await this.repo.saveBall(ball);
      await this.router.navigate(['/arsenal']);
    } catch {
      this.toast.error('errors.saveBall');
    }
  }

  async toggleActive(): Promise<void> {
    if (!this.existing) return;
    try {
      if (this.existing.active) {
        await this.repo.deactivateBall(this.existing.id);
      } else {
        await this.repo.saveBall({ ...this.existing, active: true });
      }
      await this.router.navigate(['/arsenal']);
    } catch {
      this.toast.error('errors.updateBall');
    }
  }
}
