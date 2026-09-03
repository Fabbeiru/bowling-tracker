# my-bowling-tracker

Monorepo de recursos del proyecto **bowling-tracker**: una app web (PWA) para registrar partidas de bowling, equipamiento, competiciones y estadísticas, con los datos guardados **en el propio dispositivo** (sin cuenta, sin servidor, sin nube en la fase 1).

## Estructura

```
my-bowling-tracker/
├── README.md              ← este archivo
├── docs/
│   ├── adr/               ← Architecture Decision Records (una decisión por archivo)
│   ├── REQUIREMENTS.md     ← funcionalidades deseadas, priorizadas
│   ├── PHASES.md           ← fases del proyecto y alcance de cada una
│   ├── DATA-MODEL.md       ← modelo de datos (v2, cerrado)
│   ├── ESTADISTICAS.md     ← métricas v1, fórmulas y nivel de detalle
│   ├── COMPORTAMIENTO-TRANSVERSAL.md ← reglas que afectan a toda la app
│   ├── IDENTIDAD.md        ← logo (SVG), paleta y tipografía
│   └── STATE.md            ← estado actual + próximos pasos + preguntas abiertas
└── bowling-tracker/       ← la app (se crea al empezar la Fase 1)
```

## Estado

Fase de **planificación**. Nada de código todavía. Ver [docs/STATE.md](docs/STATE.md).

## Principios

1. **Local-first**: los datos son del usuario y viven en su dispositivo.
2. **Sin fricción**: sin registro, sin login, sin coste.
3. **Móvil primero**: el 90% del uso será en el móvil, junto a la pista.
4. **Sin lock-in**: export/import en un formato abierto y documentado.
5. **Privacidad por defecto**: cero tracking, cero analítica sin consentimiento.
