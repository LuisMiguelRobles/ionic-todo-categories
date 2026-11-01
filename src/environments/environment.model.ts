import type { FirebaseOptions } from '@firebase/app';

export interface Environment {
  production: boolean;
  /** Configuración web de Firebase. `null` desactiva Remote Config (se usan los valores por defecto). */
  firebase: FirebaseOptions | null;
  /** Intervalo mínimo entre descargas de Remote Config en el arranque. */
  remoteConfigMinFetchIntervalMs: number;
}
