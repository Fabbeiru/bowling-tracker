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

## Próximos pasos (Fase 1, bloque 1 — Cimientos)

1. **git init** + crear el proyecto Angular en `bowling-tracker/`
2. Estructura de carpetas, standalone components, router con lazy-load
3. Transloco (locale `es`) + estructura de textos
4. Dexie: definición de stores, `schemaVersion` 1, capa `Repository`
5. `ng add @angular/pwa` + `ngsw-config.json` → **sesión dedicada al SW**
6. Primer arranque (`persist()` + aviso de datos locales)
7. Nota corta de estrategia de tests en los docs

## Preguntas abiertas para el usuario

- Ninguna. Listos para arrancar la Fase 1 cuando quieras.

## Preguntas abiertas del modelo de datos

Ver sección final de DATA-MODEL.md.
