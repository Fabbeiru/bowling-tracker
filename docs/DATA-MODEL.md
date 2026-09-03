# Modelo de datos v2 (cerrado — ver ADR 0005)

Notación tipo TypeScript, informal. Almacén: IndexedDB (vía Dexie).

## Tipos base

```ts
type ID = string;            // crypto.randomUUID()
type ISODate = string;       // "2026-09-03"        (fecha local, sin zona horaria)
type ISODateTime = string;   // "2026-09-03T20:15"  (hora local)

interface Timestamps {
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

type DetailLevel = "total" | "frame" | "throw";
type SessionType = "practice" | "league" | "tournament" | "social";
type CompetitionType = "league" | "tournament";
```

Convención: los valores de unión de literales van en **minúscula** (se guardan
en IndexedDB y en el backup JSON). El nombre visible se resuelve en i18n.

**Nivel de detalle** (por partida, inmutable tras crear):

| valor     | nombre visible | qué se registra |
|-----------|----------------|-----------------|
| `"total"` | Total          | solo el total de bolos de la partida |
| `"frame"` | Por frame      | bolos de cada tiro por cuadro |
| `"throw"` | Por tiro       | además, qué pinos quedan en pie |

**Numeración de pinos** (estándar):

```
7  8  9  10
 4  5  6
  2  3
   1
```

## Object stores

### `balls` — arsenal
```ts
interface Ball extends Timestamps {
  id: ID;
  name: string;            // "Storm Phaze II"
  brand?: string;
  weightLb?: number;
  coverstock?: string;     // texto libre
  layout?: string;         // texto libre
  notes?: string;
  active: boolean;         // false = fuera de selectores, conserva histórico (soft-delete)
}
```

### `venues` — boleras
```ts
interface Venue extends Timestamps {
  id: ID;
  name: string;
  city?: string;
  lanes?: number;          // nº de pistas, informativo
  notes?: string;          // patrón de aceite habitual, tipo de pista…
  active: boolean;
}
```

### `competitions` — ligas y torneos
```ts
interface Competition extends Timestamps {
  id: ID;
  type: CompetitionType;  // "league" | "tournament"
  name: string;           // "Liga Municipal 2026/27"
  season?: string;         // "2026/27"
  startDate?: ISODate;
  endDate?: ISODate;
  notes?: string;
  active: boolean;
}
```
> Una **liga** agrupa varias sesiones (jornadas). Un **torneo** suele ser una
> sesión con varias partidas; si dura varios días, varias sesiones bajo la
> misma competición. El usuario elige la competición por nombre (autocompletado
> de las anteriores); el `id` no se muestra.

### `sessions` — jornada, serie o práctica
```ts
interface Session extends Timestamps {
  id: ID;
  type: SessionType;
  date: ISODate;
  competitionId?: ID;            // solo si type = "league" | "tournament"
  venueId?: ID;
  lanes?: string;               // "12-13", texto libre
  notes?: string;               // condiciones, aceite, sensaciones generales
  defaultDetailLevel: DetailLevel;   // sugerencia para partidas nuevas de la sesión
  defaultPrimaryBallId?: ID;
  defaultSpareBallId?: ID;
}
```
> Toda partida vive dentro de una sesión. La "partida rápida" crea una sesión
> `type: "practice"` por detrás; la sesión se puede enriquecer después.

### `games` — partida (frames y tiros embebidos)
```ts
interface Game extends Timestamps {
  id: ID;
  sessionId: ID;
  index: number;                // 1..n dentro de la sesión
  detailLevel: DetailLevel;     // inmutable
  startedAt?: ISODateTime;
  notes?: string;
  primaryBallId?: ID;
  spareBallId?: ID;

  totalPins?: number;           // 0..300   -> solo si detailLevel = "total"
  frames?: Frame[];             //          -> si detailLevel = "frame" | "throw"
}

interface Frame {
  index: number;                // 1..10

  // detailLevel = "frame": bolos por tiro
  first?: number;               // 0..10
  second?: number;              // 0..10
  third?: number;               // 0..10, solo frame 10

  // detailLevel = "throw":
  throws?: Throw[];
}

interface Throw {
  index: number;                // 1..3
  pinsKnocked: number;          // 0..10  — fuente de verdad para el score
  pinsStanding?: number[];      // nº de pino (1..10) en pie TRAS el tiro; opcional
  ballId?: ID;                  // excepción: bola distinta a la del Game
  foul?: boolean;               // el motor de score cuenta 0 en ese tiro
}
```

### `meta` — registro único
```ts
interface AppMeta {
  schemaVersion: number;
  settings: {
    hideMaxProjection: boolean;   // ocultar máximo posible durante la partida
    locale: "es";
  };
}
```

## Índices IndexedDB

- `games`: por `sessionId`
- `sessions`: por `date`, por `competitionId`
- `balls` / `venues` / `competitions`: por `active` (para selectores)

## Derivado — NUNCA se almacena

Lo calcula el motor de scoring / la capa de estadísticas al leer:

- `result` de cada frame ("strike" | "spare" | "open")
- puntuación acumulada por frame y total de la partida (en `FRAME` / `THROW`)
- máximo posible con lo jugado
- split sí/no de un frame (requiere `pinsStanding`)
- todas las métricas de `ESTADISTICAS.md`

Motivo: los datos son minúsculos, calcular es instantáneo, y así no hay valores
almacenados que se queden desincronizados tras una edición.

## Reglas / validación

- `detailLevel` se fija al crear la partida; para cambiarlo, borrar y rehacer.
- `"total"`: `totalPins` presente, `frames` ausente. `"frame"`/`"throw"`: al revés.
- `Throw`: si `pinsStanding` está presente, debe ser coherente con `pinsKnocked`
  y con el `pinsStanding` del tiro anterior.
- Bola inferida por tiro si `Throw.ballId` es nulo: tiro de ataque → `primaryBallId`,
  tiro a semipleno → `spareBallId`.
- Borrado de `Ball`/`Venue`/`Competition` con histórico → `active = false`
  (soft-delete). Borrado de `Session`/`Game` → borrado real (Fase 1 local;
  la sincronización futura necesitará *tombstones*).

## Selector de pinos (detalle THROW)

Doble modo, el usuario elige el más rápido en cada tiro:

- **Dibujo libre**: triángulo de 10 bolos; marcas los que quedan en pie.
- **Preconfigurados**: pleno, todos caídos, semipleno, y restos comunes
  (7-10, 3-10, 2-7, 4-6, bolo solo, etc.).

Ergonomía móvil = reto de diseño; bocetos antes del bloque 3.

## Pendiente de detallar (no bloquea)

- Reglas exactas de bonus del frame 10 y tratamiento de `foul` en el motor de
  scoring.
- Migraciones: cada cambio de esquema lleva su función de upgrade Dexie + test.
- Formato del volcado de backup (bloque final de Fase 1).
