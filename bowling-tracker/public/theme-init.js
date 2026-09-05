// Fija el tema antes de la primera pintura (evita el parpadeo del tema
// equivocado). Misma lógica que fabbeiru.github.io/Portfolio.
// Va en un archivo aparte (no inline) para que la CSP pueda ser `script-src 'self'`.
(function () {
  try {
    var saved = localStorage.getItem('theme');
    var theme = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    /* almacenamiento no disponible: se queda con el tema por defecto */
  }
})();
