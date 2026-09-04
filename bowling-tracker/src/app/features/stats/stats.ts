import { Component } from '@angular/core';

@Component({
  selector: 'app-stats',
  template: `
    <section class="screen">
      <header class="screen__head">
        <h1>Estadísticas</h1>
        <p>Media, plenos, semiplenos, splits y evolución.</p>
      </header>

      <div class="empty-state">
        <p class="empty-state__title">Sin datos todavía</p>
        <p class="empty-state__hint">
          Registra algunas partidas para ver tus estadísticas.
        </p>
      </div>
    </section>
  `,
})
export class Stats {}
