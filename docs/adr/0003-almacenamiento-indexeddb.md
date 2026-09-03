# ADR 0003 — Almacenamiento: IndexedDB (vía wrapper) + persistencia + backup

- **Estado**: propuesto
- **Fecha**: 2026-09-03

## Contexto

Necesitamos guardar partidas, lanzamientos, equipamiento y competiciones en el
navegador. Volumen real esperado: minúsculo (una partida ≈ 1–2 KB; 20 años de
juego intenso ≈ 20 MB).

Opciones de almacenamiento en navegador:

| API              | Capacidad     | Tipo        | Notas |
|------------------|---------------|-------------|-------|
| localStorage     | 5–10 MB       | solo string | **síncrono** (bloquea el hilo), sin índices |
| IndexedDB        | cientos de MB+ | estructurado | asíncrono, transaccional, con índices |
| OPFS / File System Access | disco | ficheros    | útil para export, no como store principal |
| Cache API        | —             | respuestas HTTP | para assets de la PWA, no datos de dominio |

## Decisión (propuesta)

- **IndexedDB** como almacén principal, a través de un wrapper (candidato:
  **Dexie**) para evitar la API cruda y para tener migraciones de esquema
  versionadas.
- Pedir **`navigator.storage.persist()`** en el primer arranque útil. Sin esto,
  el navegador puede *desalojar* los datos bajo presión de disco.
- **Export / import a JSON** con formato versionado como mecanismo de backup y
  anti-lock-in. Opción de export a **CSV** para hojas de cálculo.
- **Recordatorio de backup** cada N partidas nuevas (configurable).
- Mostrar **uso y disponibilidad de almacenamiento** vía
  `navigator.storage.estimate()` en una pantalla de "Datos".
- **Migraciones de esquema** definidas desde la v1 y con tests de que migrar
  v(n)→v(n+1) no corrompe datos.

## Consecuencias

- Dependemos de una librería más (Dexie ≈ pocos KB). Aceptable.
- El código de dominio nunca habla con IndexedDB directamente: siempre a través
  del repositorio (ver ADR 0002).
