# Bowling Tracker

App web (PWA en camino) para registrar partidas de bowling, equipamiento,
competiciones y estadísticas. **Local-first**: sin cuenta, sin servidor — los
datos viven en IndexedDB, en tu navegador.

- Código en inglés, interfaz en español (ADR 0009).
- Angular 20 (standalone + signals), Dexie, Transloco.
- Documentación del proyecto: [`../docs`](../docs) (ADRs, modelo de datos,
  identidad, estadísticas, estado actual).

## Desarrollo

```bash
npm install
npm start        # ng serve -> http://localhost:4200
npm test         # ng test (Vitest, headless)
npm run build    # build de producción -> dist/bowling-tracker/browser
```

## Despliegue

GitHub Pages vía GitHub Actions (`../.github/workflows/deploy.yml`): cada push a
`main` corre los tests, hace el build de producción (`--base-href
/bowling-tracker/`), genera `404.html` para las rutas de la SPA y publica.

- CSP declarada por `<meta http-equiv>` en `index.html` (Pages no permite
  cabeceras propias; ADR 0006).
- El tema (claro/oscuro) se fija antes de la primera pintura con
  `public/theme-init.js` (archivo aparte para que la CSP sea `script-src 'self'`).
