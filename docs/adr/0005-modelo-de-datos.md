# ADR 0005 — Modelo de datos v1

- **Estado**: aceptado
- **Fecha**: 2026-09-03

## Contexto

Ver `docs/DATA-MODEL.md` para el detalle de entidades. Aquí se fijan las
decisiones estructurales.

## Decisiones

0. **Frames y tiros embebidos dentro de `Game`** como documento, no como object
   stores propios. Una partida son ~1 KB: una lectura/escritura atómica, sin
   joins ni inconsistencia. Object stores finales: `balls`, `venues`,
   `competitions`, `sessions`, `games`, `meta`.
1. **Venue es una entidad** (con id), no texto libre. Habilita filtros y stats
   por bolera sin migración posterior.
2. **Nivel de detalle por partida** (`"total"` / `"frame"` / `"throw"`, visible
   como Total / Por frame / Por tiro): se elige al crear la partida y **es
   inmutable**. Para cambiarlo, se borra y se rehace.
   - total: `Game.totalPins` (número). La sesión suma sus partidas.
   - frame: `Game.frames[]` con bolos por tiro (`first`/`second`/`third`).
   - throw: además `Frame.throws[]` con `pinsKnocked` y `pinsStanding?`.
   Convención: valores de unión de literales en minúscula (se serializan).
3. **`totalPins` va a nivel Game**, no Session.
4. **`result` de frame NO se almacena**: se calcula de los bolos. Tampoco se
   almacena la puntuación (acumulada, total, máximo posible): todo derivado.
5. **`Throw`**: `pinsKnocked: number` siempre (fuente de verdad del score) +
   `pinsStanding?: number[]` opcional (lista de pinos en pie, habilita splits y
   precisión). Dos campos, no uno polimórfico.
6. **Equipamiento**: `Game.primaryBallId` + `Game.spareBallId`; `Throw.ballId?`
   como excepción por tiro. Si el tiro no la indica, se infiere.
7. **Sesión y tipo**: `Session.type` ∈ `practice | league | tournament | social`
   (misma propiedad `type` que `Competition`, por coherencia).
   Toda partida vive en una sesión (la "partida rápida" crea una `practice`).
   Liga = Competition con varias Sessions; torneo = normalmente una Session con
   varios Games. La competición se elige por nombre; el `id` no se muestra.
8. **Soft-delete** vía `active: boolean` (por defecto `true`; `false` = oculto
   de selectores, histórico intacto) para `Ball`/`Venue`/`Competition`; borrado
   real para `Session`/`Game`.
9. **`createdAt` + `updatedAt` en todas las entidades** desde el inicio.
10. **IDs**: `crypto.randomUUID()`. **Fechas**: locales, sin zona horaria.

## Export / backup

El **export completo** (formato versionado, CSV) queda para la **Fase 2**.
El **backup mínimo** (descargar/restaurar un `.json` con todo) entra en la
Fase 1 pero como **último bloque**, después de las funcionalidades núcleo y del
trabajo de UX/UI. Ver PHASES.md.

## Pendiente de detallar (no bloquea)

- Representación exacta de bonus del frame 10 en el motor de scoring.
- Esquema de índices de IndexedDB (por fecha, por competición, por bola).
- Reglas de integridad al borrar Venue / Competition con histórico
  (previsiblemente soft-delete también).
