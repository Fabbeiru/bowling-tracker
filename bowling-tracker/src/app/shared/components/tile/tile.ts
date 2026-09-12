import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type TileAccent = 'default' | 'blue' | 'soft';

/**
 * The label-on-top / big-number tile used across Home, Estadísticas,
 * Competición, Sesión and la partida en curso — one box, one place to
 * change it. `to` makes it a link (Home's tiles navigate); omit it for a
 * plain, non-interactive tile (everywhere else).
 */
@Component({
  selector: 'app-tile',
  imports: [RouterLink],
  templateUrl: './tile.html',
  styleUrl: './tile.scss',
})
export class Tile {
  readonly label = input.required<string>();
  /** `null`/`undefined` render as "—" (e.g. an average with no games yet). */
  readonly value = input.required<string | number | null | undefined>();
  readonly accent = input<TileAccent>('default');
  readonly to = input<string | unknown[] | null>(null);
}
