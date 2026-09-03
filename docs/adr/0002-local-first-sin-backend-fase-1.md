# ADR 0002 — Local-first, sin backend, en la Fase 1

- **Estado**: aceptado
- **Fecha**: 2026-09-03

## Contexto

Objetivo: una web accesible desde cualquier dispositivo que registre partidas de
bowling y saque estadísticas. Las apps existentes exigen cuenta o pago. Los
datos (puntuaciones de partidas) **no son sensibles ni privados**.

El usuario **no** necesita, en esta primera versión, recuperar y trabajar con
sus datos desde varios dispositivos. La sincronización y/o cuenta se contempla
como **Fase II**.

## Decisión

La Fase 1 es una aplicación **100% cliente**:

- Toda la lógica (scoring, estadísticas, validación) vive en el frontend.
- Los datos se guardan en el almacenamiento del navegador del dispositivo.
- No hay servidor propio, no hay API, no hay autenticación.
- El hosting es estático (HTTPS gratis, nada que parchear).

Consecuencia asumida explícitamente: **los datos son por-dispositivo y
por-navegador**. Registrar en el móvil no los hace visibles en el portátil.

## Alternativas consideradas

1. **Backend clásico + cuentas** — descartado: es justo la fricción que se
   quiere evitar, más coste e infra.
2. **Local-first + sync opcional desde el día 1** (backend ligero / Dropbox /
   CRDT) — pospuesto a Fase II. Añade complejidad real sin necesidad actual.

## Consecuencias

- **Riesgo principal: pérdida de datos** (borrar datos del navegador, incógnito,
  desalojo por presión de almacenamiento, cambio de dispositivo). Se mitiga en
  ADR aparte (persistencia + export/import + recordatorio de backup).
- La capa de acceso a datos se diseña **detrás de una interfaz**
  (`GameRepository` o similar) para poder enchufar sync en Fase II sin
  reescribir la app.
- El formato de export es un contrato: versionado y documentado.
