// Fija el tema antes de la primera pintura (evita el parpadeo del tema
// equivocado). Por defecto claro — no se detecta el tema del sistema —
// hasta que el usuario elija uno explícitamente en Ajustes.
// Va en un archivo aparte (no inline) para que la CSP pueda ser `script-src 'self'`.
(function () {
  try {
    var saved = localStorage.getItem('theme');
    var theme = saved === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    /* almacenamiento no disponible: se queda con el tema por defecto (claro) */
  }
})();
