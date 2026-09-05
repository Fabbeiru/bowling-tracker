# Identidad visual

**v2 (2026-09-05)**: la app tiene **tema claro y oscuro** con selector en
Ajustes — ver `adr/0010`. La paleta "Bruma azul" de la v1 se descartó (los
tonos de fondo no se distinguían entre sí; ver el diagnóstico en `adr/0010`).
La paleta actual viene del portfolio del autor (`fabbeiru.github.io/Portfolio`).

Exploración v1 (7 iteraciones, descartada):
- Archivo local: [`assets/identidad-exploracion.html`](assets/identidad-exploracion.html)
- Artefacto Claude v1: https://claude.ai/code/artifact/e7ed5506-eb75-429a-b292-76b385aee573

Exploración v2 (5 rondas de comparación de paleta):
- Artefacto Claude v2: https://claude.ai/code/artifact/7bc2c9f3-372f-48a4-abcb-458a0ef6f0a4

## Paleta v2 (del portfolio) — claro / oscuro

| Token | Claro | Oscuro | Uso |
|-------|-------|--------|-----|
| `--bg` | `#EEF3FA` | `#0B0D12` | fondo de la app |
| `--surface` | `#FFFFFF` | `#151E2A` | tarjetas |
| `--surface-2` | `#DCE7F3` | `#1F2C3D` | cabeceras, elementos elevados |
| `--ink` | `#1C2333` | `#E7ECF3` | texto principal |
| `--ink-soft` | `#56607A` | `#9AA7BC` | texto secundario |
| `--line` | `#C9D6E8` | `#44536A` | bordes y separadores |
| `--secondary` | `#1A63A8` | `#5FA0F0` | azul: métricas secundarias, marca de sección |
| `--danger` / `--danger-text` | `#DC2626` / `#C81E1E` | `#F87171` / `#F4938A` | error |
| `--ok` | `#0F766E` | `#34D399` | correcto |
| `--warn` | `#B9791A` | `#E0A33F` | aviso |

**El ámbar es igual en los dos temas** y no viene del portfolio — es lo que
ata la app a su logo:

| Token | Hex | Uso |
|-------|-----|-----|
| `--accent` | `#F2A93B` | acento principal (ámbar) — **una cosa por pantalla** |
| `--accent-ink` | `#1B1406` | texto sobre ámbar |
| (contorno logo) | `#14101B` | borde fino de las piezas del logo |

## Tipografía

- **Bricolage Grotesque** (700–800) — titulares y cifras grandes.
- **Hanken Grotesk** (400–700) — todo lo demás: texto de lectura y también
  etiquetas/datos/fechas (en mayúsculas y con `letter-spacing`), vía el token
  `--font-label`.

DM Mono se retiró (2026-09-05): su aire de máquina de escribir chocaba con el
resto y añadía una tercera familia sin necesidad. Dos tipografías en total.

Todas de Google Fonts. Fechas y números con `Intl` en locale `es`.

## Logo

**Bola + tres bolos** dentro de un contenedor cuadrado de esquinas redondeadas
(`rx` 22.6% ≈ estilo iOS), fondo `#333E63`. Un solo logo para todo (favicon,
icono de app, cabecera). A 16–24 px los bolos se juntan: compromiso aceptado.

- Bola en primer plano, con 3 agujeros oscuros y borde fino `#14101B`.
- Bolo **1** (vértice) centrado y casi recto, franjas **azules** `#8FB6FF`.
- Bolo **2** a la izquierda, girado −20°, franjas **ámbar** `#F2A93B`.
- Bolo **3** a la derecha, girado 33°, recogido tras el grupo, franjas ámbar.
- Todas las piezas a opacidad completa; el borde fino define los solapes.
- Silueta del bolo tomada de un SVG estándar de bolo de bowling.

### SVG de referencia (portátil, 128×128)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" role="img" aria-label="Bowling Tracker">
  <defs>
    <clipPath id="bt-pin-clip">
      <path d="M37.008 70.879c0-10.431-2.002-17.898-6.938-27.025-3.639-6.637-4.818-13.985-3.402-21.214l2.348-12.207c.113-.543.117-.863.117-1.661C29.133 3.916 25.252 0 20.441 0c-4.709 0-8.582 3.916-8.582 8.772 0 .626.039 1.161.121 1.661l2.348 12.089c1.291 7.229.234 14.696-3.402 21.216-4.588 8.294-6.938 17.657-6.938 27.141 0 9.477 2.35 18.844 6.938 27.141h.062c.898 1.13 4.817 1.98 9.512 1.98 5.115 0 9.299-1.01 9.67-2.291 4.859-9.037 6.838-16.475 6.838-26.83z"/>
    </clipPath>
    <g id="bt-pin">
      <path d="M37.008 70.879c0-10.431-2.002-17.898-6.938-27.025-3.639-6.637-4.818-13.985-3.402-21.214l2.348-12.207c.113-.543.117-.863.117-1.661C29.133 3.916 25.252 0 20.441 0c-4.709 0-8.582 3.916-8.582 8.772 0 .626.039 1.161.121 1.661l2.348 12.089c1.291 7.229.234 14.696-3.402 21.216-4.588 8.294-6.938 17.657-6.938 27.141 0 9.477 2.35 18.844 6.938 27.141h.062c.898 1.13 4.817 1.98 9.512 1.98 5.115 0 9.299-1.01 9.67-2.291 4.859-9.037 6.838-16.475 6.838-26.83z" fill="#ECEEF5" stroke="#14101B" stroke-width="2.4" paint-order="stroke"/>
      <g clip-path="url(#bt-pin-clip)">
        <rect x="5" y="22" width="30" height="6" fill="currentColor"/>
        <rect x="5" y="32" width="30" height="6" fill="currentColor"/>
      </g>
    </g>
    <g id="bt-ball">
      <circle cx="32" cy="32" r="26" fill="#ECEEF5" stroke="#14101B" stroke-width="2.4" paint-order="stroke"/>
      <circle cx="25.5" cy="24" r="2.8" fill="#14101B"/>
      <circle cx="35" cy="25.5" r="2.8" fill="#14101B"/>
      <circle cx="30" cy="32.5" r="2.8" fill="#14101B"/>
    </g>
  </defs>

  <rect width="128" height="128" rx="29" fill="#333E63"/>

  <svg x="11" y="26" width="100" height="100" viewBox="0 8 118 120" overflow="visible">
    <g color="#F2A93B"><use href="#bt-pin" transform="translate(46 78) rotate(-20) scale(0.62) translate(-21 -101)"/></g>
    <g color="#F2A93B"><use href="#bt-pin" transform="translate(73 90) rotate(33) scale(0.64) translate(-33 -101)"/></g>
    <g color="#8FB6FF"><use href="#bt-pin" transform="translate(58 84) rotate(13) scale(0.82) translate(-29 -101)"/></g>
    <use href="#bt-ball" transform="translate(8 38) scale(1.22)"/>
  </svg>
</svg>
```

## Pendiente al implementar

- Exportar el icono a PNG en los tamaños del manifest PWA (192, 512, maskable) y
  favicon (32, 16) + `apple-touch-icon` (180).
- Fijar los colores semánticos (OK / aviso / error).
- Posible animación de carga con los números 1·2·3 cayendo (idea descartada como
  marca, guardada para esto).
- Comprobar contraste AA de `--ink-soft` sobre `--bg` y del ámbar sobre fondo.
