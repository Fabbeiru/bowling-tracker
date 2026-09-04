import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  template: `
    <section class="screen">
      <header class="screen__head">
        <h1>Ajustes</h1>
        <p>Datos, almacenamiento y preferencias.</p>
      </header>

      <div class="empty-state">
        <p class="empty-state__title">En construcción</p>
        <p class="empty-state__hint">
          Aquí irán el uso de almacenamiento, la copia de seguridad y la
          opción de ocultar el máximo posible.
        </p>
      </div>
    </section>
  `,
})
export class Settings {}
