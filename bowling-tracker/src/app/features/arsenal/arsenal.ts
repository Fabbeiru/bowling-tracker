import { Component } from '@angular/core';

@Component({
  selector: 'app-arsenal',
  template: `
    <section class="screen">
      <header class="screen__head">
        <h1>Arsenal</h1>
        <p>Tus bolas y las boleras donde juegas.</p>
      </header>

      <div class="empty-state">
        <p class="empty-state__title">Añade tu equipamiento</p>
        <p class="empty-state__hint">
          Registra tus bolas para asociarlas a tus partidas y comparar
          resultados.
        </p>
      </div>
    </section>
  `,
})
export class Arsenal {}
