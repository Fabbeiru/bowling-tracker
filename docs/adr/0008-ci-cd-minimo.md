# ADR 0008 — CI/CD mínimo y test runner

- **Estado**: aceptado
- **Fecha**: 2026-09-03 (revisado 2026-09-04)

## Contexto

El proyecto arranca como personal. No necesita una tubería elaborada.

Sobre tests: la propuesta inicial era **Karma** (por defecto de Angular), que
corre en un navegador real. Inconvenientes: no hay navegador en el entorno de
desarrollo actual y CI tendría que instalar Chrome. El grueso de los tests de
este proyecto es lógica pura (motor de scoring, estadísticas).

## Decisión

**Test runner: Vitest** (soporte experimental de Angular 20 vía el builder
`@angular/build:unit-test`).

- Corre en Node con `jsdom`; sin navegador.
- `fake-indexeddb` (en `src/test-setup.ts`) da IndexedDB a los tests del
  repositorio Dexie.
- Config en `angular.json` → target `test` con `runner: "vitest"`.
- Se eliminan Karma y Jasmine de las dependencias.
- Coste asumido: el builder es "experimental" en Angular 20 (estable en 21).

**CI/CD:**

- Al activar GitHub Pages con "GitHub Actions", se parte del workflow de build +
  deploy de Angular.
- Se le añade un paso `ng test` (Vitest, headless por defecto) que debe pasar
  antes del deploy.
- Disparadores: push a `main` (build + test + deploy) y PR (build + test).
- Sin Lighthouse CI ni análisis de bundle automatizado por ahora.

## Consecuencias

- Si `ng test` falla, no se despliega.
- Ampliar la tubería (Lighthouse, budgets como check, Dependabot) es aditivo y
  tendrá su propio ADR si el proyecto lo justifica.
- Si el soporte de Vitest diera problemas antes de estabilizarse, volver a Karma
  es un cambio de config acotado.
