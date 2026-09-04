import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <section class="screen">
      <header class="screen__head">
        <h1>Bowling Tracker</h1>
        <p>Registra tus partidas y mira cómo evolucionas.</p>
      </header>

      <p class="local-note">
        Tus datos se guardan solo en este dispositivo. Haz copias de seguridad
        desde Ajustes.
      </p>

      <div class="empty-state">
        <p class="empty-state__title">Aún no hay partidas</p>
        <p class="empty-state__hint">
          Cuando registres tu primera partida verás aquí tu media y tu evolución.
        </p>
      </div>
    </section>
  `,
  styles: `
    .local-note {
      background: var(--surface-2);
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      padding: 0.75rem 0.9rem;
      font-size: 0.85rem;
      color: var(--ink-soft);
    }
  `,
})
export class Home {}
