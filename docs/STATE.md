# Estado actual

**Fecha**: 2026-09-03
**Fase**: 0 — Planificación
**Código**: nada todavía (la carpeta `bowling-tracker/` se crea al arrancar Fase 1)

## Hecho

- Análisis de viabilidad (ver conversación / resumen en ADR 0002).
- Estructura del repo + documentación base.
- ADR 0001 — proceso de ADR (aceptado)
- ADR 0002 — local-first sin backend en Fase 1 (aceptado)
- ADR 0003 — almacenamiento IndexedDB + persistencia + backup (propuesto)
- ADR 0004 — framework Angular (aceptado)
- REQUIREMENTS.md, PHASES.md, DATA-MODEL.md (borradores)

## Decisiones tomadas 2026-09-03

- **Framework**: Angular → ADR 0004.
- **Nivel de detalle en Fase 1**: L1 + L2 + L3 (incluye pines en pie desde el día 1).
- **Módulos en Fase 1**: núcleo (tracking + estadísticas v1 + backup) +
  Arsenal de bolas + Competiciones básicas + Pantalla de Datos.

## Decisiones 2026-09-03 (segunda tanda)

- Modelo de datos cerrado → **ADR 0005**.
- **Backup mínimo** (descargar/restaurar `.json` completo) SÍ entra en Fase 1,
  como **último bloque**, tras el núcleo y la UX/UI. Export "bueno" → Fase 2.
- **Hosting**: GitHub Pages → **ADR 0006**.
- **i18n desde el inicio** (Transloco, solo `es` en Fase 1) → **ADR 0007**.
- **Nombre visible**: "Bowling Tracker" (por ahora).
- **Repo**: público, personal, sin licencia (público ≠ open-source). Necesario
  para GitHub Pages gratis. Licencia/apertura a decidir si el proyecto crece.

## Decisiones 2026-09-03 (tercera tanda)

- **Estadísticas v1** cerradas → `ESTADISTICAS.md`.
- **CI/CD mínimo** (workflow por defecto de Pages + paso de tests) → **ADR 0008**.
- **Nombres de nivel de detalle**: Total / Por frame / Por tiro (enum interno
  `TOTAL` / `FRAME` / `THROW`).
- **Selector de pinos (nivel Tiro)**: dibujo libre + preconfigurados.
- **Service worker**: se abordará en una **sesión dedicada, con calma**, cuando
  toque el bloque 1. El usuario quiere entenderlo a fondo, no solo que funcione.
- Comprobado `my-knowledge-wiki`: NO tiene manifest ni service worker ni
  `@angular/pwa`; solo favicons + apple-touch-icon. Lo que hizo el móvil fue el
  "añadir a pantalla de inicio" genérico del navegador (icono + ventana
  tipo-app), pero **sin offline**. Esa es justo la diferencia que aporta la PWA.

## Decisiones 2026-09-03 (cuarta tanda — modelo de datos v2)

- Frames y tiros **embebidos en `Game`**; 6 object stores.
- `Throw`: `pinsKnocked` (número, siempre) + `pinsStanding?` (lista, opcional).
- Equipamiento: `primaryBallId` + `spareBallId` por partida; `Throw.ballId?` de excepción.
- `Session.type` explícito (practice/league/tournament/social); valores de enum
  en minúscula por convención (se serializan).
- `result` y puntuaciones nunca se almacenan: derivado.
- `createdAt`/`updatedAt` en todo desde el inicio.
- Sincronización / backup / export → **al final del todo** (ahora no importa
  perder datos, estamos en funcionalidades).
- Idea anotada para Fase 2+: backup a Google Drive / OneDrive (OAuth PKCE en
  cliente, sin backend; es backup a archivo JSON, no sync real).
- Modelo detallado en `DATA-MODEL.md` v2.

## Decisiones 2026-09-03 (quinta tanda)

- Soft-delete: `active: boolean` (antes `retired`).
- `COMPORTAMIENTO-TRANSVERSAL.md` escrito: primer arranque, CRUD histórico,
  fechas, estados vacíos, navegación, errores, actualización PWA.

## Decisiones 2026-09-04 (identidad)

- **Identidad visual cerrada** → `IDENTIDAD.md`.
- Logo: bola + tres bolos en contenedor cuadrado redondeado, fondo `#333E63`.
  Bolo 1 (centro) franjas azules, bolos 2 y 3 franjas ámbar, borde fino `#14101B`.
  Un solo logo para todo (favicon incluido). SVG de referencia en el doc.
- Paleta **Bruma azul, solo modo oscuro** (no hay modo claro en Fase 1):
  bg `#222A44`, surface `#2B3556`, elevado `#333E63`, tinta `#ECEEF5`,
  acento ámbar `#F2A93B`, azul `#8FB6FF`.
- Tipografía: Bricolage Grotesque (titulares) + Hanken Grotesk (texto) +
  DM Mono (datos). Google Fonts.
- Exploración: artefacto Claude "Identidad de Bowling Tracker".

## Fase 0 — CERRADA

Todo lo de arquitectura, modelo de datos, alcance, hosting, i18n, CI y
comportamiento transversal está decidido y documentado.

## Fase 1, bloque 1 — Cimientos (EN CURSO)

- [x] `git init` (rama `main`), commit de la Fase 0
- [x] `ng new bowling-tracker` — Angular 20.3, standalone, SCSS, sin SSR. Commit 89b860e.
- [x] Estructura de carpetas (`core/`, `features/`, `shared/`, `models/`)
- [x] Router con lazy-load + navegación inferior (5 secciones + not-found,
      pantallas con estado vacío) + paleta/tipografía aplicadas. Commit 1216e9e.
- [x] Rutas en inglés + Transloco 8 (loader que empaqueta `es.json`, un idioma).
      Textos en `src/app/core/i18n/es.json`. `PlaceholderScreen` compartido.
      → ADR 0009 (inglés en código, español en interfaz). Commit 13f774d.
- [x] **Modelo de datos** en `models/` (Ball, Venue, Competition, Session, Game
      + Frame/Throw, AppMeta) + helpers `newId`, `nowLocalIso`, `todayLocalIso`.
- [x] **Dexie**: `AppDb` (6 stores, versión 1) tras `APP_DB` token; `Repository`
      abstracto + `DexieRepository`; `provideRepository()`. Spec de repo escrito
      (usa una BD desechable por test — corre en Karma).
- [x] **Primer arranque**: `StorageService` (`persist()`, `estimate()`) +
      `providePersistenceRequest()` como app initializer. Aviso de datos locales
      ya estaba en Inicio.
- [x] **Test runner: Vitest** (ADR 0008 revisado). `angular.json` target `test`
      con `@angular/build:unit-test` + `runner: vitest`; `src/test-setup.ts` con
      `fake-indexeddb`; Karma/Jasmine eliminados. `docs/TESTING.md` con la
      estrategia. **9 tests pasan** (`ng test`, ~3,5 s, sin navegador).
- [ ] `ng add @angular/pwa` + `ngsw-config.json` → **sesión dedicada al SW**

**Bloque 1 completo** salvo el PWA (sesión aparte).

## Fase 1, bloque 2 — Motor de scoring (HECHO)

- `core/scoring/` — módulo puro, sin dependencias de Angular.
  - `roll-scoring.ts`: `scoreRolls(rolls)` (por-frame: mark, points, cumulative),
    `maxPossibleFromRolls(rolls)`.
  - `game-scoring.ts`: `gameToRolls(game)` (normaliza los 3 niveles de detalle;
    strike = un solo 10; foul = 0), `scoreGame(game)` → `GameScore`.
  - `types.ts`: `FrameScore`, `GameScore`.
- **40 tests pasan** (`ng test`, ~4 s): 20 roll-scoring + 11 game-scoring + 7
  repo + 2 app. Cubre 300, carta clásica de 133, turkey, 10º frame en sus
  variantes, partida en curso, máximo posible, los 3 niveles de detalle.

Comprobado: `ng build` y `ng test` pasan. `npm audit`: 2 vulnerabilidades
moderadas (transitivas de dev) por revisar.

## Fase 1, bloque 3 — Registro de partida (EN CURSO)

- Bocetos: artefacto Claude "Registro de partida" (4 pantallas). Confirmados.
- ✅ Vertical slice funcionando de punta a punta:
  - `models/factories.ts` — `createSession`, `createGame`.
  - `features/game-new/` — form (tipo de sesión + fecha + nivel de detalle) →
    crea Session + Game vía Repository → navega a la entrada.
  - `features/game-entry/` — carga la partida, `Scoresheet` compartido,
    puntuación + máximo posible en vivo (motor de scoring). Nivel `total`:
    input numérico que guarda. Niveles `frame`/`throw`: stub "próximamente".
  - `features/games/` — lista real de sesiones con sus partidas y puntuación;
    botón "Nueva partida". Inicio con botón "Registrar partida".
  - Rutas: `/games/new`, `/games/:id`. i18n ampliado.
- ✅ **`core/scoring/game-builder.ts`** — lógica de entrada pura:
  `entryPosition(game)` (frame, bola, `standingCount`, `standingBefore`),
  `applyDelivery(game, delivery)` (inmutable, valida, foul=0),
  `undoLastDelivery`, `isComplete`. Reutiliza `framePins`.
- ✅ **Entrada `por frame` funcional**: `shared/components/pin-pad/` (teclado
  0-9 + "Pleno"/"Semipleno" según posición) integrado en `game-entry`. Cada
  tirada se guarda al momento. Scoresheet resalta el frame actual. Botón
  deshacer. Probado con Playwright (7/ X 9- → 48, sin errores).
- 62 tests pasan (`game-builder.spec.ts` con 10º frame, undo, throw-detail).
- ✅ **Entrada `por tiro` (rack de pinos)**: `shared/components/pin-rack/`
  (triángulo de 10, 3 estados: en pie / derribado ahora / ya caído; presets
  Pleno/Semipleno/Fallo; `linkedSignal` para resetear al cambiar de bola;
  emite `{pinsKnocked, pinsStanding}`). En `game-entry`: usa rack para nivel
  `throw`; si `standingBefore` es null (tiro anterior por conteo) o el usuario
  pulsa "solo el número", cae al `pin-pad`. Probado con Playwright (deja 7-10,
  convierte el 7 → 9 abierto, sin errores).
- ✅ **Flecos**: `SettingsStore` (meta) + toggle "ocultar máximo posible" en la
  tarjeta (persiste); anotaciones de partida (textarea → `game.notes`);
  **borrar partida** con `shared/components/confirm-dialog` (modal propio, nunca
  `confirm()` nativo). Editar = entrar a la partida y seguir/corregir tiros
  (ya funciona via `applyDelivery`/`undo`).
- **Falta del bloque 3**: 10º frame afinado en UI, equipamiento (bola por
  partida — necesita Arsenal), presets de splits comunes en el rack, borrar
  sesión entera desde la lista.

## Siguiente: Bloque 4 — Arsenal (bolas + boleras)

**Nota Node**: instalado v22.17.1. Angular 20 va bien; el CLI 21 (`@latest`)
pide Node ≥ 22.22.3 — conviene actualizar Node en algún momento.

## Preguntas abiertas para el usuario

- Ninguna. Listos para arrancar la Fase 1 cuando quieras.

## Preguntas abiertas del modelo de datos

Ver sección final de DATA-MODEL.md.
