const KEY = 'visitedSettings';

/** Marks that the user has opened Ajustes at least once — read by Home to
 *  check off "Revisa dónde se guardan tus datos" in the first-steps list. */
export function markSettingsVisited(): void {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    // Almacenamiento no disponible: el checklist simplemente no lo recuerda.
  }
}

export function hasVisitedSettings(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}
