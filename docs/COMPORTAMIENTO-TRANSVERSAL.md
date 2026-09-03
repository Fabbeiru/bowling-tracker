# Comportamiento transversal

Reglas que afectan a toda la app. Decisiones por defecto acordadas 2026-09-03;
se refinan al implementar cada pantalla.

## 1. Primer arranque

- Sin muro de bienvenida ni tutorial. En Inicio, una tarjeta descartable:
  "Tus datos se guardan solo en este dispositivo. Haz copias de seguridad."
- Se llama a `navigator.storage.persist()` en la primera interacción útil. Si el
  navegador lo deniega, se refleja en Ajustes → Datos (sin bloquear nada).
- Cero cuentas, cero pasos de configuración.

## 2. CRUD del histórico

- **Listado**: sesiones agrupadas (por fecha / competición); cada sesión
  despliega sus partidas con la puntuación calculada.
- **Detalle de partida**: vista con score por frame y total, derivados.
- **Editar**: se entra al mismo flujo de registro, prerrellenado. Se puede
  corregir cualquier tiro/frame. `detailLevel` **no** es editable.
- **Borrar**: partida o sesión completa. Diálogo de confirmación **propio**
  (componente, nunca `confirm()` nativo), con texto explícito de qué se borra.
  Borrado real.
- `updatedAt` se actualiza en cada edición.

## 3. Fechas

- Todo en hora **local**, sin `Z` ni offset. `ISODate` = `YYYY-MM-DD`,
  `ISODateTime` = `YYYY-MM-DDTHH:mm`.
- "Hoy" = fecha del dispositivo. Nueva sesión → fecha por defecto hoy, editable.
- Visualización con `Intl.DateTimeFormat` y locale `es`.
- Nunca se hace conversión de zona horaria.

## 4. Estados vacíos

Cada pantalla principal con datos vacíos muestra icono + frase + acción primaria:

- Partidas: "Aún no has registrado ninguna partida" → [Registrar partida]
- Estadísticas: se muestra lo que haya; las métricas sin muestra suficiente
  salen atenuadas con "faltan N".
- Arsenal: "Añade las bolas de tu equipo" → [Añadir bola]

## 5. Navegación

Barra inferior fija (móvil). Secciones:

- **Inicio**: resumen (media reciente, última partida, botón "Registrar").
- **Partidas**: histórico + alta.
- **Estadísticas**.
- **Arsenal**: bolas. Boleras y competiciones cuelgan de aquí o de Ajustes
  (a decidir al maquetar).
- **Ajustes**: Datos (uso/almacenamiento, backup), idioma, preferencias
  (p. ej. "ocultar máximo posible").

Router con carga diferida por sección.

## 6. Errores

- Toda escritura en IndexedDB va envuelta; si falla → aviso visible
  ("No se pudo guardar. Reintentar"), no fallo silencioso.
- `navigator.storage.estimate()` cerca del límite → aviso en Ajustes → Datos.
- Errores no controlados → mensaje genérico + consola en desarrollo. Sin
  telemetría remota (no hay servidor).

## 7. Actualización de la PWA

- Con el service worker (`SwUpdate` de Angular): al detectar versión nueva →
  aviso no intrusivo "Nueva versión disponible" → [Actualizar]
  (`activateUpdate()` + recarga).
- Nunca recargar en medio de un registro de partida.
- Detalle completo en la sesión dedicada al service worker (bloque 1 de Fase 1).
