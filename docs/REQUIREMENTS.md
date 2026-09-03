# Funcionalidades deseadas

Recogidas de la conversación inicial. `Prioridad`: Must / Should / Could /
Won't-now (MoSCoW). `Fase`: en qué fase se aborda (ver PHASES.md).

## 1. Registro de partidas (núcleo)

| # | Funcionalidad | Prioridad | Fase | Notas |
|---|---------------|-----------|------|-------|
| 1.1 | Registrar una partida con sus 10 frames | Must | 1 | admite 2 tiradas, pleno, cuadro abierto |
| 1.2 | Décimo frame con su regla especial (hasta 3 bolas) | Must | 1 | |
| 1.3 | Nivel de detalle configurable por partida | Must | 1 | ver "Niveles de detalle" abajo |
| 1.4 | Indicar pines caídos / en pie por tirada (opcional, nivel L3) | Should | 1 | habilita precisión 1ª bola, conversión de spares, splits |
| 1.5 | Modo "solo total de bolos" de la sesión | Should | 1 | cuando no quieres registrar frame a frame |
| 1.6 | Cálculo del resultado máximo posible con lo jugado | Should | 1 | cálculo clásico de "max possible" |
| 1.7 | Opción de **ocultar** el máximo posible / la proyección | Should | 1 | para no ponerte nervioso a mitad de partida |
| 1.8 | Anotaciones libres de la partida | Should | 1 | pista, condiciones del aceite, sensaciones |
| 1.9 | Marcar tipo de partida | Should | 1 | práctica / liga / torneo / social |
| 1.10 | Fouls y splits | Could | 2 | |

### Niveles de detalle (por partida) — se fija al crear, inmutable

- **Total**: número de bolos de la partida, sin frames. Estadística mínima
  (media, evolución).
- **Por frame**: resultado de cada frame (pleno / semipleno / abierto + bolos).
  Habilita score real, % de plenos, % de abiertos, clean games, 300.
- **Por tiro**: bolos de cada lanzamiento y qué pinos quedan en pie. Habilita
  precisión de primera bola, % de conversión de semiplenos, splits.

(enum interno: `TOTAL` / `FRAME` / `THROW`)

## 2. Equipamiento

| # | Funcionalidad | Prioridad | Fase |
|---|---------------|-----------|------|
| 2.1 | Definir tu arsenal (bolas, con datos: peso, marca, modelo, layout…) | Should | 1 |
| 2.2 | Asociar equipamiento **a nivel de partida** (opcional) | Should | 1 |
| 2.3 | Asociar bola **a nivel de tirada** (opcional) | Could | 2 |
| 2.4 | Análisis de resultados por bola / equipamiento | Could | 2 |

## 3. Competiciones

| # | Funcionalidad | Prioridad | Fase |
|---|---------------|-----------|------|
| 3.1 | Registrar torneos y jornadas de liga como entidad | Should | 1–2 |
| 3.2 | Asociar partidas jugadas a una jornada / serie | Should | 1–2 |
| 3.3 | Vista de resultados por competición | Could | 2 |

## 4. Estadísticas

| # | Funcionalidad | Prioridad | Fase |
|---|---------------|-----------|------|
| 4.1 | Media, mejor partida, evolución temporal | Must | 1 |
| 4.2 | % de plenos, % de cuadros abiertos | Should | 1 |
| 4.3 | Clean games, número de 300 | Should | 1 |
| 4.4 | Precisión de tiros / primera bola | Should | 1 | requiere L3 |
| 4.5 | Conversión de semiplenos, splits | Should | 1 | requiere L3 |
| 4.6 | Comparativa por equipamiento | Could | 2 |
| 4.7 | Filtros (fecha, bolera, tipo, competición) | Should | 1–2 |

## 5. Entrada de datos avanzada

| # | Funcionalidad | Prioridad | Fase |
|---|---------------|-----------|------|
| 5.1 | Extraer datos de una partida a partir de una foto de la pantalla | Won't-now | 3 | OCR en cliente; costoso; anotado para no perderlo |

## 6. Plataforma / no funcionales

| # | Requisito | Prioridad | Fase |
|---|-----------|-----------|------|
| 6.1 | Móvil primero (diseño y flujos pensados para el móvil) | Must | 1 |
| 6.2 | PWA instalable, funciona offline | Must | 1 |
| 6.3 | Pantalla de "Datos": uso y disponibilidad de almacenamiento | Should | 1 |
| 6.4 | Export / import (JSON) + recordatorio de backup | Must | 1 |
| 6.5 | Persistencia de almacenamiento solicitada al navegador | Must | 1 |
| 6.6 | Sin tracking / sin analítica por defecto | Must | 1 |
| 6.7 | Rápida en móviles de gama media (bundle contenido) | Should | 1 |
| 6.8 | Accesible: meter puntuaciones rápido y con el pulgar | Should | 1 |
| 6.9 | i18n (al menos ES; estructura preparada) | Could | 2 |

## Fuera de alcance de la Fase 1 (recordatorio)

- Sincronización entre dispositivos / cuenta de usuario → **Fase II**.
- Cualquier backend propio.
- OCR de capturas.
- Multijugador / compartir partidas.
