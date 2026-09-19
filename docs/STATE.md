# Estado actual

**Fecha**: 2026-09-11 · **Versión**: v0.2.0 (desplegada) + trabajo sin taggear encima

## Al día — leer esto primero

- **Desplegada** en https://fabbeiru.github.io/bowling-tracker/ (GitHub Pages vía
  Actions en cada push a `main`). Repo: `github.com/Fabbeiru/bowling-tracker`.
  Instalable en iPhone (manifest, abre standalone). **Sin service worker aún.**
- Tags `v0.1.0` (primera versión pública) y `v0.2.0` (gestión de datos). Desde
  entonces, sin taggear todavía: pantalla de competición + hándicap por sesión,
  comparativa de bolas (% plenos/semiplenos por bola) y **filtros de
  bolera/bola en Estadísticas y Partidas** (ver detalle en "2026-09-11" más abajo).
- **152 tests**, verde. Node v22.17.1.
- **IMPORTANTE — importar datos REEMPLAZA todo**: "Ajustes → Importar copia" no
  es aditivo, borra los datos actuales antes de cargar el fichero (con diálogo
  de confirmación). Exportar antes si hay algo que no se quiera perder.
- **Funciona**: registro de partidas (total / frame / tiro), sesiones con varias
  partidas + serie + hándicap (liga/torneo), arsenal (bolas con tipo
  strike/spare, boleras, competiciones) con alta/edición/retirar/borrar,
  **bola usada por tiro**, pantalla de competición con progreso de hándicap,
  estadísticas (media, plenos, semiplenos, splits, evolución, comparativa de
  bolas con % y conteos reales, media por bolera) con **filtros de
  competición/bolera/bola en hoja inferior** — mismo componente compartido
  reutilizado en Partidas —, tema claro/oscuro, exportar/importar/borrar datos.
- **Siguiente**: v0.3 = PWA (ver sección "Siguiente" al final). Luego v1.0 = pulido.
- Este fichero es un log largo; el detalle reciente está en las secciones con
  fecha (busca "2026-09-11"). Revisiones puntuales en `docs/revisiones/`.

## Hecho (histórico)

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

## Fase 1, bloque 4 — Arsenal (HECHO en su base)

- `features/arsenal/` — hub con lista de bolas y de boleras (activas + retiradas
  atenuadas), botones de alta.
- `features/ball-form/` y `features/venue-form/` — alta y edición; botón
  retirar/devolver (soft-delete vía `active`).
- `models/factories.ts`: `createBall`, `createVenue`, `createCompetition`.
- Rutas `/arsenal/balls/new|:id`, `/arsenal/venues/new|:id`.
- `game-new` muestra selectores de bolera y bola principal / de spare cuando
  existen. Probado con Playwright (crear bola + bolera → aparecen en game-new).
- **Falta**: competiciones (crear liga/torneo + asociar sesión), bola a nivel de
  tiro en el rack, análisis por bola (bloque de stats).

## Fase 1, bloque 8 — Estadísticas v1 (parcial)

- `core/stats/stats.ts` — `computeStats(games)` puro: `summary` (partidas,
  sesiones, media, mejor, peor), `frames` (% plenos/semiplenos/aperturas/marca,
  media 1ª bola, clean games, 300; ocultas bajo 5 partidas por frame),
  `evolution` (scores cronológicos). 7 tests.
- `features/stats/` — tiles de resumen, sparkline de evolución (escala al rango),
  lista de métricas por frame.
- `features/home/` — muestra media / mejor / última con enlaces.
- **69 tests pasan.**

Nota operativa: el dev server (esbuild watch) a veces no detecta archivos nuevos
→ reiniciar `ng serve` cuando se añaden componentes.

## Bloque 6 — Competiciones (HECHO)

- `competition-form` (liga/torneo, temporada, fechas) + archivar. Sección en
  Arsenal. `game-new` muestra selector de competición para sesiones de
  liga/torneo. `games` muestra el nombre de competición y bolera en la tarjeta.

## Pulido (HECHO)

- **10º frame** en el scoresheet: 3 marcas + acumulado sin recortes; cabecera
  scrollable si hace falta.
- **Presets de resto** en el rack (bola 1): "Deja 10 / 7 / 7-10 / 4-6".
- **Filtros de estadísticas**: chips por tipo de sesión + selector de
  competición; `computeStats` sobre partidas filtradas.

## Pruebas en el móvil (2026-09-04, commit 9f5fa55)

Servidor expuesto en LAN (`ng serve --host 0.0.0.0`) para probar desde el
móvil. Aparecieron varios problemas reales, todos corregidos:

- **Bug de puntuación**: el teclado marcaba "Pleno" en la 2ª bola tras fallar
  la 1ª (0 bolos), cuando derribar el resto ahí es un semipleno.
  `EntryPosition` gana `freshRack` (solo verdadero cuando la bola parte de un
  rack limpio) y el teclado usa ese campo, no `standingCount === 10`.
- **Bug crítico de guardado en el móvil**: `crypto.randomUUID()` no existe en
  contextos no seguros (HTTP a una IP de LAN). Sin id no se guardaba nada y no
  había ningún aviso. `newId()` ahora cae a `crypto.getRandomValues` si
  `randomUUID` no está disponible. Verificado forzando su ausencia con
  Playwright.
- **Feedback de errores**: `ToastService` + `<app-toast>` montado en `App`;
  todas las escrituras de las pantallas quedan con `try/catch` y aviso visible
  (COMPORTAMIENTO-TRANSVERSAL §6, antes pendiente).
- **Navegación**: `BackLink` compartido ("‹ volver") en todas las pantallas
  secundarias (antes solo había bottom nav).
- **Competiciones**: alta rápida en modal desde `game-new` (sin salir del
  formulario); gestión movida de Arsenal a `/competitions`, enlazada desde
  Partidas.
- **Partidas**: botón "+ Añadir otra partida a esta sesión" en `game-entry`
  (resuelve que antes cada partida nueva creaba siempre una sesión de 1);
  chips de filtro por tipo en la lista.
- **Estadísticas**: el selector de competición solo aparece con el filtro
  Liga/Torneo.
- Placeholders en los formularios de arsenal/competición; tarjeta
  "Puntuación" redundante quitada en nivel `total`.
- `isComplete()` para nivel `total` corregido (exige `totalPins` definido).

**75 tests pasan** (nuevos: `id.spec.ts`, `freshRack` e `isComplete` en
`game-builder.spec.ts`).

**Pendiente / backlog anotado**: paginación de la lista de partidas (no urge
con el volumen actual), presets de splits comunes en el rack.

## Pantalla de sesión (2026-09-05)

Ya forma parte de la v1 a publicar. Añadido:
- `features/session-detail/` (`/sessions/:id`) — serie (suma), media, lista de
  partidas enlazadas a `/games/:id`, "+ añadir partida" (usa
  `defaultDetailLevel` de la sesión, que deja de estar sin uso), y **borrar
  sesión** con `confirm-dialog` → `Repository.deleteSession()` (ya existía,
  ahora tiene UI).
- `features/session-form/` (`/sessions/:id/edit`) — editar tipo/fecha/
  competición/bolera/pistas/notas, populado con los datos actuales (patrón de
  bola/bolera). La creación sigue en `game-new`.
- Lista de Partidas: la tarjeta de sesión entera enlaza a `/sessions/:id`; las
  partidas ya no se tocan individualmente desde ahí.
- `game-entry`: el "volver" apunta a la sesión cuando la hay.
- `core/stats/stats.ts`: `sessionTotals(games)` (serie + media), con tests.

### Borrar bola / bolera / competición (2026-09-05)

- `Repository`: `deleteBall` / `deleteVenue` / `deleteCompetition` (hard delete).
- Los formularios comprueban al cargar si hay partidas/sesiones asociadas:
  - **sin** historial → botón "Borrar …" (rojo) + modal `confirm-dialog` →
    borrado real.
  - **con** historial → botón de retirar/ocultar/archivar + modal que explica
    que es un soft-delete y se puede revertir.
- Listado de partidas: enlaces sin subrayado (regla global en `styles.scss`),
  chevron `›` a la derecha de cada cabecera de sesión (el total de la serie se
  ve entrando a la sesión), distintivo limpia/300 sin emoji centrado entre nº de
  partida y resultado — sólido, con la fila apenas teñida para que contraste.
  La fila de partida (`.game*`) vive una sola vez en `styles.scss`, idéntica en
  el listado y en la pantalla de sesión.

### Navegación (2026-09-05)

- `core/nav/games-nav.state.ts`: servicio `providedIn: 'root'` que recuerda
  página y filtro del listado de Partidas, así entrar a una sesión y volver no
  reinicia a la página 1.
- `game-entry`: al terminar o borrar una partida vuelve a **su sesión** (antes
  siempre al listado).

## Despliegue (2026-09-05)

- `.github/workflows/deploy.yml`: push a `main` → `npm ci` + `npm test` + build
  de producción + `404.html` (copia de `index.html`) + deploy a Pages. Los PR
  solo corren build + test.
- `angular.json` prod: `baseHref: /bowling-tracker/`, `optimization.styles.
  inlineCritical: false` (beasties metía un `<link ... onload="...">` que la CSP
  `script-src 'self'` bloqueaba).
- `index.html`: meta CSP + el script de tema movido a `public/theme-init.js`.
- `public/.nojekyll`.
- **Pendiente de activar por el usuario**: repo Settings → Pages → Source =
  "GitHub Actions". URL final: `https://fabbeiru.github.io/bowling-tracker/`.
- Verificado en local sirviendo el build de prod: sin violaciones de CSP, tema y
  fuentes OK, rutas profundas vía `404.html`.

### Manifest / instalable (2026-09-05)

- `public/manifest.webmanifest` (`display: standalone`, `scope`/`start_url` = la
  carpeta de la app) + `<link rel="manifest">` y metas `apple-mobile-web-app-*`
  en `index.html`. **Sin service worker todavía** (eso es la PWA completa).
- Motivo: en iOS, al "Añadir a pantalla de inicio" sin manifest, iOS deduce el
  ámbito de la app de la URL exacta desde la que se añadió. Como las rutas son
  hermanas planas (`/home`, `/games`, …), navegar de una a otra se salía del
  ámbito y iOS abría la barra del navegador incrustado. El `scope` del manifest
  lo arregla. (`manifest-src 'self'` ya estaba en la CSP.)
- Los iconos PNG siguen pendientes de regenerar desde el logo recentrado.

### Bola usada en cada tiro (2026-09-05)

- **Se guarda con qué bola se lanzó cada tiro** — `Throw.ballId` (nivel "por
  tiro") y `Frame.firstBallId/secondBallId/thirdBallId` (nivel "por frame").
  Sin migración: son campos opcionales de objetos embebidos.
- **`Ball.role`** (`'strike' | 'spare'`, `undefined` = strike): segmentado
  "Tipo" en el formulario de bola, etiqueta "SPARE" en la lista del arsenal.
- **game-new** pre-selecciona la primera bola de strike como principal y la
  primera de spare como bola de spare.
- **Valor por defecto por tiro** (`resolveDefaultBall`): < 5 bolos en pie → bola
  de spare; 5 o más (rack completo incluido) → principal. Cadena de respaldo:
  bola de la partida → la otra → primera del arsenal. El usuario lo cambia con
  un desplegable en la fila "Frame n · Tiro n · Bola:" (con `<optgroup>` strike
  / spare). El override dura hasta el siguiente tiro.
- **Pendiente / siguiente paso**: estadísticas por bola reales (spares
  convertidos con la de spare, plenos por bola…) — ahora con datos de verdad.
  Las partidas anteriores a esto no tienen `ballId`.
- `game-entry.spec.ts` nuevo: cubre la auto-selección (era lógica de componente
  sin test).

### Gestión de datos — export / import / borrar (v0.2, 2026-09-05)

- **`core/data/data-transfer.ts`**: funciones puras `serializeExport` /
  `parseImport`. El import valida en capas (archivo → contenido → formato →
  registro → integridad referencial) y **reconstruye cada registro campo a
  campo** (whitelist, inmune a prototype pollution). Nada toca la BD hasta que
  todo pasa. 18 tests.
- **`Repository`**: `exportData` / `replaceData` (transacción atómica: borra +
  bulkAdd) / `clearData` (`meta` se conserva).
- **Ajustes → "Tus datos"**: Exportar copia (`navigator.share` en iOS, descarga
  en escritorio), Importar copia (selector de archivo → diálogo con el resumen →
  reemplaza), Borrar todos mis datos (diálogo rojo con botón "Exportar antes").
- `confirm-dialog` admite una acción terciaria opcional (`tertiaryLabel`).
- Tras import/clear: `navigateByUrl('/home')` + `location.reload()` para tirar
  todo el estado en memoria.
- **Nit conocido**: el resumen dice "1 sesiones / 1 partidas" (sin plural). Se
  arregla con el plugin de plurales de Transloco si molesta.

### Pantalla de competición + hándicap (2026-09-11)

- **`Session.handicap?: number`** — campo opcional, sin migración. Nadie lo
  calcula (cada liga usa su propia fórmula): el usuario lo escribe a mano en
  `session-form` (solo visible si el tipo es Liga/Torneo). `data-transfer.ts`
  actualizado (export/import lo respetan, con su rango validado).
- **`/competitions/:id` → `CompetitionDetail`** (nuevo, reemplaza el enlace
  directo a editar): identidad + `computeStats` de las partidas de esa
  competición (partidas/media/mejor/mejor serie, reutilizado tal cual) +
  progreso de hándicap (lista cronológica) + lista de sesiones (fecha, bolera,
  serie, hándicap) enlazadas a `/sessions/:id`.
- **`/competitions/:id/edit` → `CompetitionForm`** (edición, movida desde
  `/competitions/:id`; mismo patrón que sesión/partida). Guardar y
  retirar/reactivar redirigen ya al detalle, no a la lista.
- `session-detail` muestra una 3ª tarjeta "Hándicap" si la sesión lo tiene.
- 135 tests.

### Revisión de prioridades (2026-09-10/11)

- **PWA pospuesta**: sin service worker, "una vez abierta funciona offline"
  es solo parcialmente cierto (caché HTTP normal, nada garantizado — falla
  justo cuando más importa: llegar a la bolera sin haber abierto la app en
  un rato y sin señal). Aun así, se pospone a propósito; no bloquea nada.
- **Fechas**: se quedan en ISO (`2026-09-05`) a propósito, no se cambia a
  `Intl` — el usuario prefiere el formato estándar y consistente.
- **Editar tiradas de una partida ya cerrada**: pospuesto (el deshacer ya
  cubre el caso real, que es mientras se registra).
- **Buscador de histórico / exportar partida como imagen**: descartados por
  ahora (filtros + paginación bastan; una captura nativa ya sirve para
  compartir).

## Siguiente

- `--accent` (#f2a93b) usado como color de TEXTO pequeño sobre fondo claro
  da ~2:1 de contraste (falla incluso el 3:1 de WCAG para texto grande) —
  ya corregido en la barra de navegación con el token nuevo `--accent-text`
  (ver más abajo). Quedan dos sitios más con el mismo patrón, sin tocar
  todavía porque no se pidió: `game-entry.scss:33` (`color: var(--accent)`
  en un texto de 1.7rem — grande, pero 2:1 sigue sin llegar a 3:1) y
  `game-new.scss:171` (`border-color: var(--accent)`, un borde, umbral más
  bajo — menos urgente). Revisar y aplicar `--accent-text` donde corresponda.
- Más adelante, sin prisa: PWA, pulido (CSS duplicado restante — `.seg` ×3,
  modal ×2 —, README raíz, degradado del scoresheet, decidir `AppMeta` /
  `Game.startedAt`).
- **Pendiente (anotado 2026-09-17): formato de versionado/tags y de commits.**
  - Formatear correctamente el versionado/tags del proyecto: convención clara
    (semver o similar), y una plantilla legible y reutilizable para el mensaje
    de cada tag/release que explique bien qué se cambia, qué se mejora y qué
    se corrige (secciones tipo Added/Changed/Fixed).
  - Establecer un formato de commits (p. ej. Conventional Commits) a partir de
    ahora, y valorar reescribir el historial existente para ajustar solo los
    *mensajes* de los commits al nuevo formato (sin tocar el contenido/diff de
    cada commit).

### Puntos del gráfico: tamaño constante en pantalla, no en el dibujo (2026-09-12)

- Efecto secundario del ajuste de ancho dinámico (commit anterior): el
  radio de los puntos era fijo en unidades del `viewBox`, y como el
  `viewBox` ahora escala mucho más en un card ancho de escritorio para
  llenarlo, ese radio fijo se traducía en tamaños en pantalla muy distintos
  — 7.7px de diámetro en móvil, **23px en PC**, medido con Playwright.
  Corregido calculando el radio AL REVÉS: se fija el tamaño deseado EN
  PANTALLA (5px normal, 9px el último) y se divide entre la escala real
  medida (`chartScale`, px reales por unidad de `viewBox`) para sacar el
  radio en unidades de dibujo — así el punto sale del mismo tamaño
  aproximado sea cual sea el ancho. Verificado con Playwright de 320 a
  1300px: 5.0px / 9.0px de diámetro exactos en los seis anchos probados,
  sin excepción.

### Tiles: "Mejor serie (N)" ya no se parte en dos líneas (2026-09-12)

- Capturas reales del usuario en su PC a distintos anchos de ventana
  mostraban "Mejor serie (3)" partido en dos líneas en unos anchos sí y en
  otros no. Reproducido con Playwright: `grid-template-columns:
  repeat(auto-fit, minmax(90px, 1fr))` en `stats.scss` deja pasar una franja
  de ancho (~480-700px de ventana) donde la rejilla mete 4 columnas de
  ~100px — ni tan estrechas como para que bajara a menos columnas, ni tan
  anchas como para que "Mejor serie (N)" (la etiqueta más larga de las 4)
  cupiera en una línea. Subido el mínimo a 125px: salta esa franja por
  completo — verificado con Playwright de 420 a 1300px, la etiqueta mide
  14px de alto (una sola línea) en todo el rango. Por debajo de ~480px pasa
  a 3+1 (esa tile sola en su fila) en vez de 4 apretadas — más limpio.
  `home.scss` no toca (sus tiles son "Última"/"Media"/"Mejor", ninguna se
  parte a este ancho).

### `<app-tile>` compartida, botón de borrar, gráfico de ancho dinámico (2026-09-12)

- **`shared/components/tile`**: la tarjeta etiqueta+número (Partidas, Media,
  Mejor, Serie, hándicap, la partida en curso…) vivía duplicada — con
  ligeras diferencias de tamaño y sin la disposición diagonal — en 5
  sitios: `stats`, `home`, `competition-detail`, `session-detail`,
  `game-entry`. Ahora es un componente (`<app-tile [label] [value]
  [accent] [to]`), unificado a un solo estilo (etiqueta arriba-izq, número
  abajo-der en los 5 a la vez). `to` opcional la convierte en enlace (Home
  navega a `/games`/`/stats`); sin él es una tarjeta simple. Ojo al usarla
  dentro de un `display:flex`/`grid` ajeno (p. ej. `.live` en
  `game-entry`): el HOST (`<app-tile>`, un custom element) es quien hace de
  flex/grid item, no el `.tile` de dentro — hay que dirigir `flex:1` o lo
  que corresponda a `app-tile`, no a `.tile`. El propio componente ya lleva
  `:host { display:block; height:100% }` para estirarse a la fila/celda
  cuando el contenedor lo pide.
- **Botón "Borrar partida"/"Borrar sesión"**: confirmado que nunca tuvo
  borde (no era una regresión) — se le añadió borde rojo sutil a petición,
  igual que "Borrar todos mis datos" en Ajustes (`border: 1px solid
  color-mix(in srgb, var(--danger) 45%, var(--surface))`), en
  `game-entry.scss` y `session-detail.scss`.
- **Gráfico de evolución: ancho dinámico de verdad, no otro número fijo**:
  el `viewBox` a 600×220 (commit anterior) arregló móvil pero rompió
  escritorio — a 900px+ de ancho la caja real es ~5.4:1 (mucho más plana
  que el 2.727:1 del `viewBox`), así que ahora era el ALTO el que sobraba y
  la línea se quedaba muy por debajo del ancho disponible (382px de 759
  medido con Playwright). Conclusión: **ningún `viewBox` fijo sirve a la
  vez para el ~2.6:1 de una tarjeta de móvil y el ~5:1+ de una de
  escritorio**. Arreglado de raíz con `ResizeObserver` sobre el propio
  `<svg>` (`stats.ts`): mide el ancho/alto real de la caja y ajusta el alto
  del `viewBox` para que coincida siempre con esa proporción — ningún eje
  sobra ni falta nunca, sea cual sea el ancho de pantalla. Como el `<svg>`
  vive dentro de un `@if (chart(); as c)` y puede no existir todavía al
  cargar, el `ResizeObserver` se engancha desde un `effect()` sobre la
  señal de `viewChild` (reacciona cada vez que el elemento aparece o
  desaparece), no desde `ngAfterViewInit` (que solo se ejecuta una vez y
  se perdería el `<svg>` si aparece más tarde). Verificado con Playwright a
  390/900/1280px: la línea ocupa siempre ~100% del ancho de la caja real.
- Etiquetas de escala del gráfico ("236" / "Media 195" / "146") de 0.66rem
  a 0.75rem, a petición tras comprobarlo en escritorio.

### Botón de borrar, gráfico de verdad más grande, tiles (2026-09-11, noche)

- **Botón "Borrar partida"/"Borrar sesión" sin borde**: comprobado en el
  historial completo del componente — así ha sido desde el primer commit
  que lo creó (`8e7e577`), no es algo que se perdiera en ninguna sesión
  reciente. Sigue así; no tocado salvo que se pida expresamente añadirle
  borde.
- **Gráfico de evolución, ahora sí de verdad más grande**: el intento
  anterior (subir el `height` CSS de 72-116px a 100-140px) no hacía nada en
  la práctica — comprobado midiendo el punto renderizado con Playwright,
  2.58px de diámetro antes Y después del cambio. Motivo real:
  `preserveAspectRatio="meet"` con un `viewBox` 600×100 (6:1) sobre una caja
  bastante más cuadrada en móvil (~258×100, 2.6:1) escala por el eje más
  restrictivo — el ancho —, así que el alto de sobra se queda como relleno
  vacío arriba/abajo y NUNCA llega a agrandar ni la línea ni los puntos, por
  mucho que suba el `height` en CSS. Corregido de raíz: `viewBox` a
  600×220 (`H` en `stats.ts`, de 100 a 220 — más cercano a la proporción
  real de la caja en móvil) + radios de los puntos subidos de 3/5 a 9/13 +
  grosor de la línea de 1.2 a 1.8px. Punto renderizado: de 2.58px a 7.74px
  de diámetro, verificado con Playwright, no solo a ojo. Revisado también a
  320px y 1280px por si se desproporcionaba en algún extremo — bien en los
  dos.
- **Tiles (Partidas/Media/Mejor, en Home y Estadísticas): etiqueta
  arriba-izquierda, valor abajo-derecha** en vez de los dos apilados y
  pegados arriba (con toda la mitad inferior de la tile vacía). `display:
  flex; flex-direction:column; justify-content:space-between` +
  `align-self:flex-end` en el valor, `min-height` para que haya hueco real
  que repartir entre las dos esquinas. Aplicado en `stats.scss` y
  `home.scss` — quedan 3 sitios más con `.tile` sin tocar (ver nota en
  "Siguiente" arriba).

### Repaso de detalles: navbar, gráfico, contraste, checklist, temblor (2026-09-11, noche)

- **Barra de navegación, de vuelta a borde a borde SIEMPRE**: el intento de
  acotarla a 900px como el resto del contenido (ronda anterior) se ve mal en
  pantallas grandes — se corta a medio ancho con hueco vacío a los lados.
  Revertido a `left:0; right:0` en cualquier tamaño, desacoplada de
  `.screen` (que sigue en 900px). El indicador deslizante no se ve
  afectado, solo el contenedor.
- **Gráfico de evolución, más grande en móvil**: `.chart__svg` de
  `clamp(72px, 15vw, 116px)` a `clamp(100px, 22vw, 140px)`; etiquetas de
  escala de 0.58rem a 0.66rem. Los puntos y la línea son vectoriales
  (`viewBox` fijo 600×100), así que suben de tamaño en proporción sin
  perder nitidez.
- **Contraste del ítem activo en la navbar, corregido de verdad (no a
  ojo)**: calculado con la fórmula real de WCAG — `--accent` (#f2a93b) daba
  **2.0:1** contra fondo claro (el mínimo exigido es 4.5:1 para texto
  pequeño, ni siquiera llega al 3:1 de texto grande); en oscuro daba 8.4:1,
  perfecto. Token nuevo **`--accent-text`** (styles.scss): `#a15c0f` en
  claro (5.18:1, holgado), igual a `--accent` en oscuro (ya iba bien). Solo
  para texto/iconos pequeños sobre superficie — `--accent` se queda para
  rellenos grandes (botones) con `--accent-ink` encima, ese caso nunca tuvo
  problema de contraste.
- **Checklist de Home: ya no reserva hueco para el check**: antes el
  `<span class="starter__check">` vacío se renderizaba siempre (ocupando
  18px+gap aunque no hubiera nada dentro), así que el texto no se movía al
  completarse — el check aparecía "flotando" delante sin desplazar nada.
  Ahora el `@if` envuelve el `<span>` entero (no solo su contenido): no
  existe en el DOM hasta que el paso está hecho, así que el texto empieza
  alineado como el resto y se desplaza ~28px a la derecha cuando aparece el
  check. Verificado con Playwright comparando la posición X del texto antes
  y después de completar un paso real.
- **Temblor al cambiar de tamaño (~709-714px), bug real de bucle infinito
  encontrado y corregido**: `WrapAwareRow` mide el `column-gap` calculado
  para decidir si el contenido cabe en una línea, pero la regla `.wrapped`
  cambiaba el `gap` (shorthand, afecta a `row-gap` Y `column-gap` a la vez)
  — justo en el ancho límite, apilar cambiaba el gap, lo que cambiaba el
  resultado de la siguiente medición (con el gap ya reducido, "ahora sí
  cabe"), lo que desapilaba, lo que volvía a cambiar el gap, lo que...
  bucle infinito, temblor visible. Arreglado usando `row-gap` a secas en
  `.wrapped` (el espacio entre las dos líneas apiladas) sin tocar
  `column-gap`, que se queda constante siempre — ya no hay nada que la
  propia medición pueda desestabilizar. Verificado con una tormenta de
  resizes real por ese rango exacto (705-719px, 20 cambios seguidos): las
  filas se quedan quietas, sin seguir cambiando tras asentarse.

### Checklist con progreso, tema por defecto, 900px confirmado (2026-09-11, noche)

- **`.screen` a 900px confirmado por el usuario** tras comparar 720/860/1000px
  con datos reales — ya no es un intento, es la decisión final. `900px` en
  `.screen`, `filter-sheet.scss` y `bottom-nav.scss` (los tres tienen que ir
  siempre a la par).
- **`WrapAwareRow` — bug real corregido**: la primera versión comparaba
  `offsetTop` para saber si el nombre y las cifras habían caído en líneas
  distintas, pero `align-items: center` descoloca el `offsetTop` de dos
  elementos de altura distinta AUNQUE estén en la misma línea (el nombre es
  más bajo que el bloque de cifras) — leía "apilado" de forma permanente y
  nunca se revisaba al ensanchar de nuevo. Cambiado a comparar el ANCHO
  necesario (suma de anchos naturales de los hijos + gaps) contra el ancho
  disponible, inmune a diferencias de altura. También se quitó el
  `width:100%` que se aplicaba al bloque de cifras en apilado — inflaba su
  propio ancho medido y retroalimentaba el mismo bug de otra forma
  (autorreforzante: una vez apilado, se medía a sí mismo como demasiado
  ancho para siempre). Verificado con una secuencia de resize real
  (estrecho→ancho→estrecho→ancho...) sin quedarse pegado en ningún sentido.
- **Tema por defecto: claro**, ya no se detecta el tema del sistema en la
  primera visita (`theme.service.ts` + `public/theme-init.js`, los dos
  puntos donde se decide). Se sigue recordando lo que el usuario elija a
  mano en Ajustes vía `localStorage`, solo cambia el punto de partida antes
  de elegir nada.
- **Checklist de Home con progreso real**: los tres pasos de "Antes de tu
  primera partida" ahora se marcan como hechos contra datos reales —
  `hasBalls`/`hasVenues` (¿hay alguna bola/bolera, activa o no?) y
  `visitedSettings` (`core/util/visited-settings.ts`, un flag de
  `localStorage` que pone `Settings` al montar — el único paso de los tres
  que no se puede derivar de datos). El check no oculta el paso de la lista
  (se puede añadir más de una bola), solo lo atenúa y lo tacha. Verificado
  con un perfil de navegador desechable aparte, dando de alta una bola real
  y comprobando que el check aparece.
- **Home**: tiles (Última/Media/Mejor) antes del botón "Registrar partida",
  que pasa a ser siempre el último elemento de la pantalla.
- **Gráfico de evolución**: límite bajado de 24 a **13** partidas (pedido
  explícito, número elegido por el usuario) — probado con Playwright hasta
  320px de ancho antes de decidir, se lee bien sin amontonarse. Datos de
  prueba (`test-data/bowling-tracker-test-data.json`) ampliados con una 4ª
  sesión de 8 partidas (`total`-detail, ids `test-game-s4-*`) para tener
  más de 13 partidas con las que probarlo — se queda en el fichero, útil
  para la próxima vez que haga falta más volumen de datos de prueba.
- Barra de navegación con píldora deslizante: sigue en pie de la ronda
  anterior, sin cambios aquí.

### Ronda de pulido: ancho de escritorio, home, navbar (2026-09-11, noche)

- **`.screen` a `max-width: 900px`** (era 720px), decisión consciente tras
  comparar 720/860/1000px con datos reales — confirmado por el usuario. Ya
  no es un intento de adivinar; a partir de 1000px las listas simples
  etiqueta-valor ("Por frame", "Media por bolera") se ven con demasiado
  hueco vacío, 900px no. `filter-sheet.scss` y `bottom-nav.scss` actualizados
  al mismo ancho (mismo patrón `left:50% + translateX(-50%)` que ya llevaba
  la hoja de filtros).
- **`.ball-compare__row`**: la solución final (tras dos intentos fallidos con
  breakpoints — viewport primero, container query después, ninguno acertaba
  para nombres de bola largos) es `shared/directives/wrap-aware-row.directive.ts`
  — mide con `ResizeObserver` si la fila REALMENTE se partió en dos líneas y
  pone `.wrapped`; el CSS solo reacciona a esa clase, sin ningún ancho
  supuesto. `space-between` cuando cabe, apilado y centrado cuando no, fila
  a fila, acertado en todo el rango 320-1280px verificado con Playwright.
- **Chips (Estadísticas y Partidas)**: `HorizontalWheelScroll` ahora también
  pone `.at-scroll-end` (vía `ResizeObserver`-like scroll/resize listeners)
  para quitar el desvanecido del borde en cuanto no queda nada más que
  desplazar — antes se quedaba ahí permanentemente sobre el último chip,
  pareciendo recortado aunque fuera el último de verdad.
- **Home**: las tiles (Última/Media/Mejor) van ahora antes del botón
  "Registrar partida", que pasa a ser el último elemento de la pantalla en
  los dos casos (con partidas y en el estado vacío con checklist inicial).
- **Barra de navegación**: píldora deslizante (`.bottom-nav__indicator`,
  `position:absolute`, `transform: translateX(activeIndex · 100%)` con
  transición) que sustituye al fondo estático de antes — se desliza de una
  pestaña a otra en vez de aparecer/desaparecer sin más. Bug real al
  implementarlo: un elemento `position:absolute` pinta SIEMPRE después que
  los hermanos sin posicionar del mismo contenedor (regla de pintado CSS,
  no depende del orden en el HTML), así que el indicador tapaba el icono y
  la etiqueta del ítem activo entero — arreglado dando `position: relative`
  a `.bottom-nav__item` para que entre en el mismo nivel de pintado.
  `prefers-reduced-motion` ya lo neutraliza (regla global).
- Gráfico de evolución: el límite ya existía, `slice(-24)` en
  `stats.ts` — 24 partidas, no 10. Confirmado, no tocado.

### Media por bola: apilado con container query, no `@media` (2026-09-11, tarde)

- Malentendido a medio camino: al pedir "centrarlo" el usuario se refería
  solo a la fila de `.ball-compare__row` (nombre + partidas arriba, las tres
  cifras centradas debajo cuando no caben en una línea) — **no** al ancho de
  toda la app. Llegué a tocar `.screen` (styles.scss, 720px→480px) y
  `bottom-nav.scss` globalmente por una lectura equivocada de dos capturas a
  anchos intermedios; revertido sin más (`git checkout` sobre ambos, no
  tenían nada más de hoy). **`.screen` sigue en `max-width: 720px`,
  `bottom-nav` sigue en `left:0; right:0` como siempre — no tocar esto de
  nuevo salvo que se pida explícitamente.**
- El apilado de `.ball-compare__row` sí seguía sin funcionar bien en el caso
  real (nombre de bola largo, móvil normal ~390-430px) porque el primer
  intento usaba `@media (max-width: 380px)` — un umbral de ANCHO DE
  VENTANA, cuando lo que importa es el ancho real de la TARJETA (siempre
  bastante más estrecha que la ventana por los paddings de `.screen` y
  `.card`). A 390px de viewport la tarjeta mide ~317px, muy por debajo de
  ese umbral aparentemente generoso pero mal calibrado. Cambiado a
  **container query**: `.ball-compare { container-type: inline-size; }` +
  `@container (max-width: 500px) { ... }` — mide el ancho real disponible
  ahí mismo, no el del viewport. Verificado con partidas reales a 375/390/
  414/430px (todas apilan) y 600/1280px (una sola línea, como antes).
- Lección para la próxima vez que algo dependa de "cabe o no cabe en una
  fila" dentro de una tarjeta: container query desde el principio, nunca
  `@media` por viewport — el ancho de ventana y el ancho del elemento casi
  nunca coinciden en esta app (padding de pantalla + padding de tarjeta).

### Pulido de la hoja de filtros (2026-09-11, tarde)

- `.sheet-body` tenía solo 4px de padding inferior (recorte al copiar el
  padding lateral): el último filtro quedaba pegado a la línea del footer.
  Ahora simétrico (16px).
- `.ball-compare__row` (Estadísticas) ya apila y centra en pantallas ≤380px
  (nombre+partidas arriba, las tres cifras abajo) en vez del flex-wrap que
  quedaba desalineado — el TODO de la entrada anterior, hecho.
- Pase de verificación más a fondo con Playwright sobre las piezas nuevas:
  Escape cierra la hoja, click en el backdrop cierra la hoja, "Limpiar"
  vacía los filtros sin cerrar la hoja (el badge desaparece), filtro de
  bola en Partidas reduce correctamente al nº de partidas de esa bola,
  tema oscuro correcto en toda la hoja. Sin errores de consola en ningún caso.

### Filtros de bolera/bola en Estadísticas y Partidas (2026-09-11)

- Diseño discutido primero como Artifact (mockup HTML fuera del repo) antes
  de tocar código real, a petición explícita — patrón "chips de tipo
  siempre visibles + botón Filtros con badge + hoja inferior" inspirado en
  uno ya validado en `my-knowledge-wiki`, re-skinned con los tokens propios.
- **Tres componentes compartidos nuevos** en `shared/components/`:
  `filter-trigger` (botón "Filtros" + badge de nº de filtros activos),
  `filter-sheet` (backdrop + panel deslizante, header/footer, Escape para
  cerrar — la lógica de apertura/cierre vive aquí, no en cada pantalla),
  `filter-select` (una sección label+`<select>` dentro de la hoja). Se
  construyeron primero duplicados dentro de Estadísticas y se extrajeron
  a compartidos antes de repetirlos en Partidas — evita sumar más CSS
  duplicado al ya apuntado en el backlog.
- `shared/directives/horizontal-wheel-scroll.directive.ts` — deja que la
  rueda del ratón (vertical) haga scroll horizontal en tiras de chips que
  ya tienen `overflow-x: auto`; sin esto, en PC sin trackpad no había forma
  de llegar a los chips ocultos tras el botón Filtros.
- **Estadísticas** (`features/stats`): filtro de bolera (`Session.venueId`)
  y de bola (`Game.primaryBallId`) añadidos a `filteredGames`, además del
  de competición ya existente; los tres viven ahora en la hoja, el chip de
  tipo se queda fuera, siempre visible. Badge cuenta filtros activos (no
  incluye el tipo). La hoja se ancla al mismo `max-width: 720px` que
  `.screen` y se centra — antes ocupaba todo el ancho del viewport en
  tablet/desktop, visualmente roto respecto al contenido real.
- **Partidas** (`features/games`): mismo patrón. `GamesNavState` (ya
  guardaba página y tipo) ganó `competitionFilter`/`venueFilter`/
  `ballFilter`, persistentes igual que el resto al entrar/salir de una
  sesión. El filtro de bola actúa a nivel de partida, no de sesión (una
  sesión puede mezclar bolas entre sus partidas): filtra las partidas
  dentro de cada fila y oculta la sesión entera si se queda sin ninguna.
- **Comparativa de bolas**: además del %, ahora se enseña también la
  fracción real (p. ej. "Plenos · 24/36"), no solo el porcentaje — los
  datos ya estaban calculados en `statsByBall`, solo faltaba exponerlos.
- Nada de esto guarda estadísticas precalculadas en IndexedDB: todo se
  recalcula desde los datos por tiro/frame cada vez que cambia un filtro
  (memoizado por los `computed()` de Angular, no en cada render). Hay una
  redundancia menor y conocida — 4 `computed()` de Estadísticas recorren
  `filteredGames()` cada uno por su cuenta en vez de compartir un único
  paso de `scoreGame` — irrelevante a los volúmenes de datos actuales, no
  se ha tocado.

### Comparativa de equipamiento (2026-09-11)

- **`core/stats/stats.ts`: `statsByBall(games)`** — % de plenos y % de
  semiplenos convertidos, **por bola**, atribuidos por qué bola se usó en
  cada tiro (`Frame.firstBallId`/`secondBallId` o `Throw.ballId`), no solo
  la bola principal de la partida. Excluye el 10º frame (igual que los
  splits) y exige ≥10 intentos de ese tipo antes de mostrar el %. 7 tests.
- La tarjeta **"Media por bola"** de Estadísticas ahora enseña, por bola:
  media, % de plenos y % de semiplenos convertidos, uno junto a otro. Una
  bola solo aparece si cumple el criterio ya existente (≥3 partidas como
  principal); dentro de esas, los dos % nuevos se calculan aparte y pueden
  salir "—" si esa bola en concreto no llega a los 10 intentos.
- 142 tests.

**Nota Node**: instalado v22.17.1. Angular 20 va bien; el CLI 21 (`@latest`)
pide Node ≥ 22.22.3 — conviene actualizar Node en algún momento.

### Bola de spare ausente de "Media por bola" (2026-09-18)

- El usuario notó que el % de semiplenos convertidos por bola de repuesto no
  salía en Estadísticas, aunque sospechaba que el dato sí se recogía —
  confirmado: `statsByBall` (`core/stats/stats.ts`) ya atribuía correctamente
  el semipleno a la bola real usada en el 2º tiro. El problema estaba en qué
  bolas llegaban a tener **fila** en la tabla: la lista salía de `byBall()`,
  que solo incluye bolas que fueron `primaryBallId` en ≥3 partidas completas
  — una bola de rol `spare` casi nunca lo es (se usa sobre todo en el 2º
  tiro), así que su fila nunca se generaba, por más semiplenos que tuviera.
- **Arreglado con `ballComparisonRows(games, ballNames)`** (nueva función
  pura en `core/stats/stats.ts`, con tests en `stats.spec.ts`): genera una
  fila para cualquier bola que tenga *algo* que mostrar — como bola
  principal en ≥3 partidas (da media) **o** con ≥10 intentos en
  `statsByBall` (da % plenos/semiplenos) — no ambas a la vez. Una bola sin
  ninguno de los dos no sale (nada que decir todavía). El componente
  (`features/stats/stats.ts`) llama a esta función en vez de mezclar
  `byBall()` + `statsByBall()` a mano; `byBall`/`NamedAverage` para bolas se
  eliminó (Venues sigue con su propio `averageBy` privado, sin tocar).
- Plantilla (`stats.html`): la media se pinta como "—" cuando la bola no
  tiene partidas suficientes como principal; el subtítulo "· N partidas" del
  nombre solo aparece si `games > 0` (si no, se omite sin más, nada de "· 0
  partidas").
- **Verificado con Playwright** (dev server real, `ng serve`, dato de
  importación de prueba ad-hoc con una bola "nunca principal" con 10
  semiplenos convertidos): la fila aparece con media "—" y "100% · 10/10" en
  Semiplenos, sin errores de consola. Capturas de pantalla revisadas a ojo
  (móvil, 420px) — sin roturas de layout con el "—" ni con la fila sin
  subtítulo.
- **`test-data/bowling-tracker-test-data.json` ampliado**: las dos bolas que
  ya había (`test-ball-storm`, `test-ball-hammer`) siempre eran su propia
  bola de repuesto (mismo id en `firstBallId` y `secondBallId` en todas sus
  partidas) — el fichero oficial de pruebas **no cubría** el caso de este
  bug (una bola que nunca es `primaryBallId`). Añadida **`test-ball-backup`**
  ("Bola de repuesto, nunca principal") + sesión `test-session-5` (práctica,
  2026-09-15) con 4 partidas nuevas (`test-game-s5-1..4`): bola principal
  `test-ball-storm`, pero el 2º tiro de los cuadros 1/4/7 de cada partida usa
  `test-ball-backup` (12 intentos, 9 convertidos = 75%), sin que
  `test-ball-backup` sea nunca `primaryBallId` de nada. Reimportando este
  fichero desde Ajustes se ve la fila "Bola de repuesto, nunca principal"
  con media "—" y "75% · 9/12" en Semiplenos — verificado importándolo de
  verdad (`parseImport` real, no simulado) contra el dev server, sin errores.
- 146 tests.

### Revisión "usuario nuevo" + 3 mejoras pequeñas (2026-09-18/19)

- **Revisión completa de la app desde cero** (perfil de navegador limpio, sin
  datos, con Playwright): alta de bola/bolera, partida en los 3 niveles de
  detalle, sesión multi-partida, competición, tema oscuro — sin errores de
  consola. Conclusiones: el enfoque local-first sin cuenta es un punto fuerte
  real; huecos identificados frente a otras apps de bowling — foto de bola
  solo por URL (no cámara/galería), sin aviso de última copia, hándicap
  manual (aceptado, cada liga tiene su fórmula). Ideas descartadas tras
  discutirlo: registrar compañeros de equipo (ya hay hojas físicas para eso),
  función dedicada para compartir partida como imagen (una captura de
  pantalla ya vale). OCR de partida y sync a Drive/OneDrive del propio
  usuario quedan anotadas para más adelante (la primera coincide con
  `REQUIREMENTS.md` 5.1, ya marcada Won't-now Fase 3; la segunda con la idea
  de Fase 2+ ya anotada en este fichero).
- **Cálculo de almacenamiento verificado empíricamente**: `storage.service.ts`
  no calcula nada — solo llama a `navigator.storage.estimate()` del
  navegador. Medido con datos reales: 21 partidas + 3 bolas + 1 bolera + 1
  competición + 5 sesiones pesan 17.106 bytes en JSON compacto, pero el
  navegador reporta 86.016 bytes de IndexedDB para lo mismo (~5x) — los
  índices por `sessionId`/`venueId`/`primaryBallId` y la granularidad del
  motor de almacenamiento explican la diferencia. El caso real del usuario
  (19 partidas + 3 bolas → export de 60 KB, Ajustes marca 160 KB, ratio
  ~2,7x) es coherente con esto. No es un bug ni en un sentido ni en otro.
- **Hándicap también al crear la sesión** (antes solo se podía añadir
  editándola después): `NewSessionInput`/`createSession` (`factories.ts`)
  ganan `handicap?: number`; `game-new.ts`/`.html` añaden el mismo campo que
  ya tenía `session-form` (mismos validators/hint), visible solo con tipo
  Liga/Torneo, se limpia al cambiar a otro tipo.
- **Aviso de última copia de seguridad**: `AppMeta.lastBackupAt` ya existía
  en el modelo pero no lo usaba nadie en todo el código — solo hacía falta
  conectarlo. `settings.ts` lo carga con `getMeta()` y lo actualiza
  (`saveMeta`) al terminar `exportData()` con éxito (compartir sin cancelar,
  o disparar la descarga). En Ajustes → Tus datos: "Todavía no has hecho
  ninguna copia." o "Última copia: `AAAA-MM-DD`." (fecha plana, sin hora —
  mismo criterio que el resto de fechas de la app).
- **Paginación de Partidas con conteo real + corte del bucketing corregido**:
  la etiqueta pasa de "Página X de Y" a "Página X de Y (partidas en esta
  página/total)". De paso, se corrigió un fallo real en el reparto por
  páginas (`games.ts`): decidía cortar página **mirando hacia atrás** (solo
  cuando lo ya acumulado llegaba a 10), así que siempre dejaba entrar una
  sesión entera de más aunque se disparase el total — con 3 sesiones de 3 +
  una de 6 (15 partidas), la página 1 se quedaba con las 15 en vez de parar
  en 9. Extraído a `core/util/paginate.ts` (`paginateByItemCount`, genérica y
  con 6 tests) que corta **mirando hacia delante**: rechaza añadir una fila a
  una página no vacía si se pasaría de `PAGE_SIZE`, pero una fila más grande
  que `PAGE_SIZE` ella sola nunca se descarta ni se parte, siempre ocupa
  página propia. `games.ts` ahora es una llamada a esa función. Verificado
  con Playwright (import ad-hoc de 4 sesiones 3+3+3+6): "Página 1 de 2
  (9/15)" / "Página 2 de 2 (6/15)", tal cual se esperaba.
- 152 tests.

## Preguntas abiertas para el usuario

- Ninguna. Listos para arrancar la Fase 1 cuando quieras.

## Preguntas abiertas del modelo de datos

Ver sección final de DATA-MODEL.md.
