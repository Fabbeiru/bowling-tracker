import { Component, computed, input, linkedSignal, output } from '@angular/core';

export interface RackDelivery {
  pinsKnocked: number;
  pinsStanding: number[];
}

/** Ten-pin rack for "throw" detail. Tap the pins knocked down on this ball. */
@Component({
  selector: 'app-pin-rack',
  templateUrl: './pin-rack.html',
  styleUrl: './pin-rack.scss',
})
export class PinRack {
  /** Pin numbers (1..10) standing before this ball. */
  readonly standingBefore = input.required<number[]>();
  readonly ball = input.required<number>();

  readonly delivery = output<RackDelivery>();

  /** Pins knocked down on this ball. Resets whenever the standing set changes. */
  private readonly knocked = linkedSignal<number[], Set<number>>({
    source: this.standingBefore,
    computation: () => new Set<number>(),
  });

  readonly rows: readonly number[][] = [
    [7, 8, 9, 10],
    [4, 5, 6],
    [2, 3],
    [1],
  ];

  readonly knockedCount = computed(() => this.knocked().size);
  readonly allLabel = computed(() =>
    this.standingBefore().length === 10 ? 'Pleno' : 'Semipleno',
  );

  /** Quick "leave" shortcuts on the first ball: knock everything but these pins. */
  readonly leavePresets = computed<{ label: string; leave: number[] }[]>(() => {
    if (this.ball() !== 1 || this.standingBefore().length !== 10) return [];
    return [
      { label: '10', leave: [10] },
      { label: '7', leave: [7] },
      { label: '4', leave: [4] },
      { label: '6', leave: [6] },
      { label: '2', leave: [2] },
      { label: '3', leave: [3] },
      { label: '7-10', leave: [7, 10] },
      { label: '4-6', leave: [4, 6] },
      { label: '3-10', leave: [3, 10] },
      { label: '2-7', leave: [2, 7] },
      { label: '5-7', leave: [5, 7] },
      { label: '5-10', leave: [5, 10] },
      { label: '4-7-10', leave: [4, 7, 10] },
      { label: '6-7-10', leave: [6, 7, 10] },
      { label: '4-6-7-10', leave: [4, 6, 7, 10] },
    ];
  });

  leave(pins: number[]): void {
    this.knocked.set(new Set(this.standingBefore().filter((p) => !pins.includes(p))));
  }

  stateOf(pin: number): 'gone' | 'standing' | 'knocked' {
    if (!this.standingBefore().includes(pin)) return 'gone';
    return this.knocked().has(pin) ? 'knocked' : 'standing';
  }

  toggle(pin: number): void {
    if (!this.standingBefore().includes(pin)) return;
    const next = new Set(this.knocked());
    if (next.has(pin)) next.delete(pin);
    else next.add(pin);
    this.knocked.set(next);
  }

  knockAll(): void {
    this.knocked.set(new Set(this.standingBefore()));
  }

  knockNone(): void {
    this.knocked.set(new Set());
  }

  confirm(): void {
    const standing = this.standingBefore().filter((p) => !this.knocked().has(p));
    this.delivery.emit({ pinsKnocked: this.knocked().size, pinsStanding: standing });
  }
}
