import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="screen">
      <div class="empty-state">
        <p class="empty-state__title">Página no encontrada</p>
        <p class="empty-state__hint">La ruta que buscabas no existe.</p>
        <a routerLink="/inicio" class="back">Volver al inicio</a>
      </div>
    </section>
  `,
  styles: `
    .back {
      margin-top: 0.5rem;
      color: var(--secondary);
      text-decoration: none;
      font-weight: 600;
    }
  `,
})
export class NotFound {}
