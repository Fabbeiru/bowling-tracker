# ADR 0010 — Tema claro/oscuro con selector (revierte "solo modo oscuro")

- **Estado**: aceptado
- **Fecha**: 2026-09-05
- **Revierte**: el compromiso "100% modo oscuro, sin modo claro en Fase 1" de
  `IDENTIDAD.md` v1.

## Contexto

La paleta "Bruma azul" original tenía cuatro tonos de fondo (`--bg`,
`--surface`, `--surface-2`, `--line`) con el mismo matiz y solo ~16 puntos de
luminosidad de diferencia entre ellos, comprimidos en la zona oscura donde el
ojo distingue peor. En la práctica no se veía dónde acababa una superficie y
empezaba otra, en móvil y en escritorio. Cinco rondas de exploración de paleta
(artefacto de comparación, ver `STATE.md`) mostraron que:

- Estirar la misma rampa oscura mejora poco.
- Cerca del blanco pasa lo mismo que cerca del negro: la separación entre
  superficies también se comprime.
- El problema real que se quería evitar no era "claro" sino el **destello** de
  una pantalla blanca en un entorno con poca luz.

## Decisión

- La app pasa a tener **tema claro y oscuro**, con un selector en Ajustes.
- Se reutiliza la paleta del portfolio del autor
  (`fabbeiru.github.io/Portfolio`), extraída de su CSS real, para los dos
  temas — coherencia entre proyectos propios y colores ya probados en
  producción. Dos únicos ajustes por accesibilidad: el azul de texto usa su
  variante oscura (`#1D6FB8` → aquí `#1A63A8`) porque el claro no llegaba a
  4.5:1; y en oscuro se separó más la cabecera del fondo.
- El **ámbar de los bolos** (`--accent: #F2A93B`) se mantiene en los dos temas:
  es lo que ata la app a su logo y no viene del portfolio.
- Mecanismo, idéntico al del portfolio: atributo `data-theme` en `<html>` +
  `localStorage`, con un script inline en `index.html` que fija el tema antes
  de la primera pintura (evita el parpadeo). El tema inicial sigue
  `prefers-color-scheme` mientras no haya elección guardada.
- Tokens en `styles.scss`: `:root` = claro; `@media (prefers-color-scheme:
  dark) { :root:not([data-theme="light"]) }` y `:root[data-theme="dark"]` =
  oscuro.

## Consecuencias

- `IDENTIDAD.md` deja de estar "comprometido con modo oscuro".
- `--secondary` cambia de valor entre temas (`#1A63A8` claro / `#5FA0F0`
  oscuro); revisado que sigue pasando AA en todos los sitios donde se usa como
  texto.
- Se elimina `color-scheme: dark` de los componentes; ahora se hereda de
  `html { color-scheme: var(--color-scheme) }`.
- `meta[name=theme-color]` pasa a tener dos variantes por `media`.
