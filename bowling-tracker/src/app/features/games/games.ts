import { Component } from '@angular/core';

@Component({
  selector: 'app-games',
  template: `
    <section class="screen">
      <header class="screen__head">
        <h1>Partidas</h1>
        <p>Tu histórico de sesiones y partidas.</p>
      </header>

      <div class="empty-state">
        <p class="empty-state__title">Aún no has registrado ninguna partida</p>
        <p class="empty-state__hint">
          El registro por total, por frame o tiro a tiro llegará en el
          siguiente bloque.
        </p>
      </div>
    </section>
  `,
})
export class Games {}
