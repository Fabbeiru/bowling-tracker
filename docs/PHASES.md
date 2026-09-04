# Fases del proyecto

## Fase 0 — Planificación (actual)

- [x] Análisis de viabilidad
- [x] Estructura del repo y documentación
- [x] ADR 0001 (proceso), 0002 (local-first)
- [x] Decidir stack / framework → ADR 0004 (Angular)
- [x] Alcance de la Fase 1: detalle L1+L2+L3; módulos núcleo + Arsenal +
      Competiciones básicas + Pantalla de Datos
- [ ] Cerrar modelo de datos (ADR 0005 + DATA-MODEL.md)
- [ ] Desglose fino de la Fase 1 (ver nota abajo)
- [ ] Paleta, nombre visible, logo, identidad
- [ ] Decidir hosting (ADR 0006)

> **Nota sobre alcance vs orden**: L1 + L2 + L3 y los tres módulos (Arsenal,
> Competiciones básicas, Pantalla de Datos) están **dentro** de la Fase 1. Eso
> no se recorta sin acordarlo aquí. Lo único que decidiremos al construir es el
> **orden** de los bloques (qué se entrega antes), no qué entra.

## Fase 1 — MVP local, usable en liga

Objetivo: **poder usarlo de verdad la próxima jornada**, con backup fiable.

Bloques (orden aproximado de entrega; el alcance no se recorta):

1. **Cimientos**: proyecto Angular (standalone), PWA (service worker, manifest,
   instalable, offline, estrategia de actualización con *prompt*), i18n
   (Transloco, `es`), capa de datos (IndexedDB + repositorio + migraciones),
   primer arranque (`persist()` + aviso de datos locales).
2. **Motor de scoring**: ✅ `core/scoring/` — módulo puro (sin Angular).
   `scoreRolls`, `maxPossibleFromRolls`, `gameToRolls`, `scoreGame`. 31 tests
   (perfect 300, carta clásica 133, turkey, 10º frame, partida en curso, máximo
   posible). Los 3 niveles de detalle. Foul = 0.
3. **Registro de partida** (EN CURSO): bocetos hechos (artefacto Claude).
   ✅ Vertical slice: `Nueva partida` (tipo + fecha + nivel) → crea Session+Game
   → `Entrada` con scoresheet + puntuación/máximo en vivo → guarda → lista en
   Partidas. Nivel `total` funcional. **Falta**: entrada `por frame` (teclado) y
   `por tiro` (rack de pinos), décimo frame, anotaciones, equipamiento, toggle
   de ocultar máximo.
4. **Arsenal**: ✅ alta/edición de bolas (`ball-form`), soft-delete
   ("retirar del arsenal"). Wired en `game-new` (bola principal / de spare).
5. **Boleras**: ✅ alta/edición de Venue (`venue-form`). Wired en `game-new`.
6. **Competiciones (básico)**: crear jornada/torneo y asociar partidas.
7. **Histórico**: listar, editar y borrar sesiones/partidas.
8. **Estadísticas v1** (parcial): `core/stats/computeStats` (puro) + pantalla.
   Resumen (partidas, media, mejor), evolución (sparkline), por frame (% plenos,
   % semiplenos convertidos, % aperturas, % marca, media 1ª bola, clean games,
   300). Umbral de muestra mínima (5). Home muestra media/mejor/última. Falta:
   filtros, splits, carry, pinos problemáticos, por equipamiento.
9. **Identidad**: ✅ cerrada 2026-09-04 → `IDENTIDAD.md` (logo bola+3 bolos,
   paleta Bruma azul modo-oscuro, Bricolage/Hanken/DM Mono). Falta al implementar:
   exportar iconos PNG del manifest + favicon + apple-touch-icon, y `theme-color`.
10. **Pantalla de Datos + backup mínimo**: uso/disponibilidad de almacenamiento
    (`storage.estimate()`), descargar/restaurar `.json` completo. **Último
    bloque de la fase.**

## Fase 2 — Profundidad

- Sincronización / cuenta (decisión de arquitectura propia).
- Export "bueno": formato versionado + CSV para hoja de cálculo.
- Backup a Google Drive / OneDrive: OAuth PKCE en cliente, sin backend. Sube un
  JSON a una carpeta propia de la app y lo recupera. Es backup a archivo
  (último que guarda gana), no sincronización registro a registro.
- Detalle L3 completo: precisión 1ª bola, conversión de semiplenos, splits,
  fouls.
- Bola a nivel de tirada + análisis por equipamiento.
- Competiciones: vistas de resultados, clasificaciones.
- i18n.

## Fase 3 — Extras

- OCR de capturas de la pantalla de la bolera.
- Lo que surja.
