import { Component, input } from '@angular/core';

import { FrameScore } from '../../../core/scoring';

@Component({
  selector: 'app-scoresheet',
  templateUrl: './scoresheet.html',
  styleUrl: './scoresheet.scss',
})
export class Scoresheet {
  readonly frames = input.required<FrameScore[]>();
  /** 1..10 of the frame currently being entered, if any. */
  readonly currentFrame = input<number | null>(null);

  marksFor(f: FrameScore): string[] {
    if (f.mark === 'pending' && f.rolls.length === 0) {
      return f.index === 10 ? ['', '', ''] : ['', ''];
    }
    if (f.index < 10) {
      if (f.mark === 'strike') return ['', 'X'];
      if (f.mark === 'spare') return [pin(f.rolls[0]), '/'];
      return [pin(f.rolls[0]), pin(f.rolls[1])];
    }
    return f.rolls.map((_, i) => tenthMark(f.rolls, i));
  }
}

function pin(n: number | undefined): string {
  if (n === undefined) return '';
  return n === 0 ? '-' : String(n);
}

function tenthMark(rolls: number[], i: number): string {
  const v = rolls[i];
  if (v === 10) return 'X';
  if (i === 1 && rolls[0] !== 10 && rolls[0] + v === 10) return '/';
  if (i === 2 && rolls[1] !== 10 && rolls[1] + v === 10) return '/';
  return pin(v);
}
