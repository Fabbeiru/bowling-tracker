# ADR 0006 — Hosting: GitHub Pages

- **Estado**: aceptado
- **Fecha**: 2026-09-03

## Contexto

Hosting estático para una PWA 100% cliente. Candidatos: GitHub Pages,
Cloudflare Pages, Netlify. Uso previsto en Fase 1: el propio autor.

## Decisión

**GitHub Pages**, con build y deploy vía GitHub Actions.

Motivos:

- El repo va a estar en GitHub de todos modos → una sola plataforma, una cuenta
  menos.
- Gratis, HTTPS, CDN. Suficiente para el uso previsto.
- El beneficio de Cloudflare Pages (cabeceras `_headers`, previews por PR, CDN
  algo más rápido) no aporta valor real a un proyecto de un solo usuario.

## Visibilidad del repo

GitHub Pages en plan gratuito exige **repo público**. Se asume:

- Repo **público, personal, sin licencia** ("todos los derechos reservados").
  Público ≠ open-source: el código se ve, pero no se conceden permisos ni se
  invita a contribuir todavía.
- Exponer el código apenas cambia nada: es una app 100% cliente, todo lo que se
  sirve al navegador ya es público de facto. No hay secretos ni claves en el
  repo. Único cuidado: no meter datos personales en los mensajes de commit.
- Licencia (MIT / Apache-2.0 / AGPL-3.0) y apertura real a contribuciones:
  a decidir en un ADR nuevo si el proyecto crece.

## Consecuencias / limitaciones asumidas

- **Sin cabeceras HTTP propias**: la CSP se declara con
  `<meta http-equiv="Content-Security-Policy">`. Cubre lo esencial; se pierde
  `frame-ancestors` y el *reporting* de CSP.
- **Sin previews por PR**: se revisa en local (`ng serve`) y con el build de CI.
- **Rutas profundas de SPA**: se resuelve con copia de `index.html` a
  `404.html` en el build, o con routing basado en hash. A decidir al montar el
  router.
- Si el proyecto crece o se abre a más usuarios, migrar a Cloudflare Pages es
  barato (mismo artefacto estático). Se creará un ADR nuevo si pasa.
