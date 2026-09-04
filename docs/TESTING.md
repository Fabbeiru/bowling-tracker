# Estrategia de tests

Runner: **Vitest** (ADR 0008). `npm test` / `ng test` — corre en Node, sin
navegador. `src/test-setup.ts` carga `fake-indexeddb`.

## Qué se testea y cuánto

| Área | Cobertura buscada | Notas |
|------|-------------------|-------|
| **Motor de scoring** (bloque 2) | Exhaustiva | Funciones puras. Casos: 300, foul en el 10, semipleno en el 10 + bonus, gutter game, partida abierta, máximo posible. Es la pieza crítica: un bug aquí arruina meses de estadísticas. |
| **Cálculo de estadísticas** | Alta | Puras. Verificar cada métrica de `ESTADISTICAS.md` con datos conocidos, y el umbral de muestra mínima. |
| **Repositorio (`DexieRepository`)** | Media | Contra `fake-indexeddb`. Ya cubierto: soft-delete, borrado en cascada de sesión, orden, meta por defecto, sellado de `updatedAt`. |
| **Migraciones de esquema** | Cada cambio | Al subir la versión de `AppDb`, un test que migra datos v(n)→v(n+1) sin corromper. |
| **Componentes** | Selectiva | Solo los de lógica no trivial (flujo de registro, selector de pinos). Los de presentación, poco o nada. |
| **e2e (Playwright)** | Más adelante | Flujos completos cuando haya features reales. |

## Convenciones

- Un `describe` por unidad; nombres de test en inglés (código), descripciones
  concisas.
- Helpers de fábrica en el propio spec o en `src/testing/` si se comparten.
- Sin tests de "que el componente se crea" salvo humo mínimo.
