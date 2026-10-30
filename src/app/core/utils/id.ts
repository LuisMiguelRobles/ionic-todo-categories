/**
 * Genera un identificador único.
 * `crypto.randomUUID` solo existe en contextos seguros; algunos WebViews antiguos
 * no lo exponen, así que se usa un fallback basado en tiempo + aleatorio.
 */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
