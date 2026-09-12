import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/**
 * Claro/oscuro, con el mismo mecanismo que fabbeiru.github.io/Portfolio
 * (atributo `data-theme` en `<html>` + `localStorage`). El tema inicial ya
 * lo fija un script inline en `index.html` antes de que Angular arranque,
 * para no parpadear con el tema equivocado; este servicio solo retoma ese
 * valor y permite cambiarlo desde Ajustes.
 *
 * Por defecto siempre claro (no se detecta el tema del sistema) hasta que
 * el usuario elija uno explícitamente en Ajustes — a partir de ahí se
 * recuerda tal cual en `localStorage`, sin volver a mirar el sistema.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<Theme>(this.readInitial());
  readonly theme = this._theme.asReadonly();

  private readInitial(): Theme {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light' || attr === 'dark') return attr;
    return 'light';
  }

  set(theme: Theme): void {
    this._theme.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Almacenamiento no disponible (privado/restringido): el tema sigue
      // aplicado en esta sesión, solo no se recuerda entre visitas.
    }
  }

}
