# Estadísticas v1

Nivel mínimo: qué detalle de registro necesita cada métrica.
- **Total**: la partida solo aporta su puntuación total.
- **Frame**: resultado por cuadro.
- **Tiro**: bola a bola + pinos en pie.

Toda métrica en porcentaje se **oculta hasta una muestra mínima** (`minMuestra`,
configurable, por defecto 10) para no mostrar ruido ("100% de splits" con 1
intento). Las métricas de nivel Tiro se calculan solo sobre partidas registradas
en ese nivel y se indica sobre cuántas partidas / cuántos frames.

## 1. Generales

| Métrica | Nivel mín. | Definición |
|---|---|---|
| Nº de partidas / sesiones | Total | recuento |
| Media de puntuación | Total | media aritmética de las puntuaciones de partida |
| Mejor / peor partida | Total | máximo y mínimo |
| Evolución temporal | Total | serie de puntuación por fecha + media móvil (ventana configurable) |
| Distribución de puntuaciones | Total | histograma por tramos (p. ej. de 20 en 20) |

## 2. Por frame

| Métrica | Nivel mín. | Definición |
|---|---|---|
| % de plenos (strikes) | Frame | frames con strike / frames jugables para strike |
| % de semiplenos (spares) | Frame | frames con spare / frames sin strike |
| % de aperturas | Frame | frames abiertos / frames |
| % de *mark* | Frame | (strikes + spares) / frames |
| Media de 1ª bola | Frame | media de `pinsFirst` en frames 1–9 (y 1er tiro del 10) |
| Clean games: nº y % | Frame | partidas sin ninguna apertura / partidas nivel Frame+ |
| Nº de 300 | Frame | partidas de 12 strikes |
| Racha más larga de plenos | Frame | máxima secuencia de strikes consecutivos (dentro de partida) |

## 3. Por tiro

| Métrica | Nivel mín. | Definición |
|---|---|---|
| % conversión de semiplenos | Tiro | spares convertidos / oportunidades de spare (frames sin strike) |
| Frecuencia de splits | Tiro | frames con split tras la 1ª bola / frames sin strike |
| % conversión de splits | Tiro | splits convertidos / splits afrontados |
| Media de *carry* | Tiro | media de bolos en la 2ª bola cuando la 1ª no fue strike |
| Pinos más problemáticos | Tiro | frecuencia de cada pino quedando en pie / fallado (mapa de calor 1–10) |

> "Split" v1: 1ª bola sin derribar el bolo 1, ≥ 2 bolos en pie y no adyacentes.
> Regla exacta a fijar al implementar el motor de scoring.

## 4. Por equipamiento

| Métrica | Nivel mín. | Condición |
|---|---|---|
| Media por bola | Frame + bola a nivel partida | solo bolas con ≥ `minMuestra` partidas |
| % de plenos por bola | Frame + bola a nivel partida | ídem |

Comparativa fina por bola a nivel de tiro → Fase 2.

## Filtros transversales

Rango de fechas · bolera · tipo de partida (práctica / liga / torneo / social) ·
competición · bola. Los filtros se aplican a todas las secciones a la vez.

## No entra en v1 (anotado)

- Percentiles / desviación típica de la puntuación.
- Tendencia por día de la semana / hora.
- Comparativa entre temporadas o competiciones.
- Objetivos y seguimiento de objetivos.
