# ADR 0007 — i18n desde el inicio

- **Estado**: aceptado
- **Fecha**: 2026-09-03

## Contexto

La Fase 1 se usa en español. Pero el bowling es global y el proyecto podría
abrirse. Reintroducir i18n a posteriori en una app con textos repartidos por
las plantillas es caro y propenso a errores.

## Decisión

Internacionalización **desde el primer día**:

- Todos los textos visibles viven en archivos de traducción, nunca literales
  sueltos en plantillas o componentes.
- Idioma único en Fase 1: **español (`es`)**. La estructura queda lista para
  añadir `en` u otros sin tocar código.
- Herramienta: **Transloco** (traducción en runtime, cambio de idioma sin
  rebuild, un solo artefacto de build). Se descarta el i18n nativo de Angular
  para esta fase porque genera un build por locale y complica el deploy en
  GitHub Pages.
- Textos de dominio del bowling (strike, spare, split, clean game…): se define
  un glosario ES en el propio archivo de traducción para mantener coherencia.

## Consecuencias

- Pequeño coste fijo por cada texto nuevo (añadir la clave). Aceptable.
- Fechas y números con las APIs `Intl` del navegador, con el locale activo.
- Un futuro `en` solo necesita un archivo de traducción y añadir el selector.
