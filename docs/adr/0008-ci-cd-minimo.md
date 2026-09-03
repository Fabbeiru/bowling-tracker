# ADR 0008 — CI/CD mínimo

- **Estado**: aceptado
- **Fecha**: 2026-09-03

## Contexto

El proyecto arranca como personal. No necesita una tubería elaborada. Los otros
proyectos del workspace usan el flujo por defecto que GitHub genera al activar
Pages.

## Decisión

Mismo enfoque que el resto del workspace:

- Al activar **GitHub Pages** con "GitHub Actions" como fuente, GitHub propone un
  workflow de build + deploy de Angular. Se parte de ese.
- Se le añade un **paso de tests** (`ng test` en modo headless / CI) que debe
  pasar antes del deploy.
- Disparadores: push a `main` (build + test + deploy) y pull request
  (build + test, sin deploy).
- Sin Lighthouse CI, sin análisis de bundle automatizado, sin entornos de
  preview por ahora. Se revisa el tamaño del bundle a mano con los *budgets* de
  `angular.json`.

## Consecuencias

- Si `ng test` falla, no se despliega. Es la red mínima para "que los números
  no se rompan".
- Ampliar la tubería (Lighthouse, budgets como *check*, dependabot) es aditivo y
  tendrá su propio ADR si el proyecto lo justifica.
