# ADR 0009 — Inglés en el código, español en la interfaz

- **Estado**: aceptado
- **Fecha**: 2026-09-04

## Contexto

La app se usa en español y todos los documentos del proyecto están en español.
Pero mezclar español en identificadores de código dificulta la lectura para
cualquier desarrollador y rompe convenciones del ecosistema.

## Decisión

- **En inglés**: nombres de clases, funciones, variables, archivos y carpetas;
  rutas y `path` del router; claves de configuración; nombres de object stores,
  colecciones y campos del modelo de datos; mensajes de commit de código
  (los de documentación pueden ir en español, como el resto de docs).
- **En español**: todo texto visible para la persona usuaria; se gestiona con
  Transloco (`docs/adr/0007`), con las claves de traducción en inglés
  (`nav.home`, `home.emptyTitle`…) y los valores en `es.json`.
- Los `title` de ruta (pestaña del navegador) son texto visible → español,
  como literales en `app.routes.ts` por ahora.

## Consecuencias

- Rutas: `/home`, `/games`, `/stats`, `/arsenal`, `/settings` (no `/inicio`…).
- El modelo de datos de `DATA-MODEL.md` ya está en inglés; se mantiene.
- Un futuro segundo idioma solo añade un archivo de traducción.
