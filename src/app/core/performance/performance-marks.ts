import { environment } from '../../../environments/environment';

/** Marca cuándo la lista de tareas se pinta por primera vez con los datos guardados (ver README). */
export const TASKS_RENDERED_MARK = 'tasks-rendered';

/**
 * Registra una marca de la Performance API, visible en DevTools y medible desde el navegador.
 * En desarrollo también la escribe en consola, que en Android llega a `adb logcat`.
 */
export function markPerformance(name: string, detail: Record<string, unknown> = {}): void {
  const mark = performance.mark(name, { detail });
  if (!environment.production) {
    console.info(`[perf] ${name}: ${Math.round(mark.startTime)} ms`, detail);
  }
}
