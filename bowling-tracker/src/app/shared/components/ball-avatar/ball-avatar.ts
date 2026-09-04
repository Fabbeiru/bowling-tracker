import { Component, effect, input, signal } from '@angular/core';

/**
 * Photo of a ball from the arsenal, or a drawn fallback (same ball glyph as
 * the app logo, see docs/IDENTIDAD.md) when no `imageUrl` is set or it fails
 * to load.
 */
@Component({
  selector: 'app-ball-avatar',
  templateUrl: './ball-avatar.html',
  styleUrl: './ball-avatar.scss',
})
export class BallAvatar {
  readonly imageUrl = input<string | undefined>();
  readonly size = input(40);

  protected readonly loadFailed = signal(false);

  constructor() {
    // A new URL deserves a fresh attempt, even if the previous one failed.
    effect(() => {
      this.imageUrl();
      this.loadFailed.set(false);
    });
  }

  protected onError(): void {
    this.loadFailed.set(true);
  }
}
