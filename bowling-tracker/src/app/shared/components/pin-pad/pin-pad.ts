import { Component, computed, input, output } from '@angular/core';

/** Numeric entry for one ball at "frame" detail. Emits pins knocked (0..max). */
@Component({
  selector: 'app-pin-pad',
  templateUrl: './pin-pad.html',
  styleUrl: './pin-pad.scss',
})
export class PinPad {
  /** Pins standing before this ball. */
  readonly standingCount = input.required<number>();
  /** Whether clearing all standing pins here is a strike (vs. completing a spare). */
  readonly freshRack = input(false);

  readonly pins = output<number>();

  /** Digit buttons that are reachable (1..standing-1). */
  readonly digits = computed(() =>
    Array.from({ length: Math.max(0, this.standingCount() - 1) }, (_, i) => i + 1),
  );

  /** Label for the "knock everything down" button. */
  readonly allLabel = computed(() => (this.freshRack() ? 'Pleno' : 'Semipleno'));

  emit(n: number): void {
    this.pins.emit(n);
  }
}
