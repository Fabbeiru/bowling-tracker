# ADR 0004 — Framework: Angular

- **Estado**: aceptado
- **Fecha**: 2026-09-03

## Contexto

Hay que elegir framework para la PWA. Candidatos: Angular, SvelteKit, React+Vite.
La app es pequeña en datos y lógica, móvil primero, y uno de los objetivos del
usuario con sus proyectos personales es aprender la parte de infra/plataforma
(PWA, service workers, IndexedDB, hosting estático, CI, observabilidad), no
tanto frameworks nuevos.

## Decisión

**Angular**.

Motivos:

- Es el stack diario del usuario → avanza rápido y el presupuesto de
  aprendizaje se gasta en lo nuevo (service worker, IndexedDB, PWA, identidad
  visual, despliegue) y no en el framework.
- Soporte PWA oficial: `@angular/pwa`, `@angular/service-worker` (config
  declarativa de caché y estrategia de actualización con *prompt*).
- Router, formularios reactivos, DI e i18n vienen de serie → menos decisiones de
  librerías sueltas.
- El escapado automático de plantillas y el `DomSanitizer` reducen el riesgo de
  XSS (amenaza nº1 en una app 100% cliente).

## Alternativas

- **SvelteKit**: bundle más pequeño y muy buena DX para PWA, pero curva de
  framework nueva sin beneficio real a esta escala.
- **React + Vite**: obliga a elegir routing/estado/formularios por separado.

## Consecuencias

- Vigilar el **tamaño del bundle**: build de producción con budgets, lazy-load
  de rutas (estadísticas, arsenal, competiciones), librería de gráficos ligera.
- Standalone components + `provideRouter` (Angular moderno, sin NgModules).
- Zoneless / signals donde encaje, para rendimiento en móvil de gama media.
