# ADR 0001 — Registrar las decisiones de arquitectura como ADRs

- **Estado**: aceptado
- **Fecha**: 2026-09-03

## Contexto

El proyecto se plantea de forma deliberada: primero debatir y decidir, luego
construir. Necesitamos un sitio donde quede escrito **qué** decidimos y sobre
todo **por qué**, para no re-discutir lo mismo dentro de tres meses y para que
cualquiera que llegue al proyecto (incluido el yo del futuro) entienda el
razonamiento.

## Decisión

Usamos **Architecture Decision Records**: un archivo Markdown por decisión, en
`docs/adr/`, numerado de forma incremental. Cada ADR tiene: contexto, decisión,
alternativas consideradas y consecuencias. Los ADR no se borran; si una
decisión se revierte, se crea uno nuevo que lo marca como *superado por*.

## Consecuencias

- Cada decisión relevante (stack, almacenamiento, modelo de datos, hosting…)
  genera un ADR antes de implementarse.
- Las decisiones pequeñas del día a día no necesitan ADR; van en commits o en
  `STATE.md`.
