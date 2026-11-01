import { InjectionToken } from '@angular/core';

import { environment } from '../../../environments/environment';

import { FEATURE_FLAG_DEFAULTS } from './feature-flags';

/** Operaciones de Remote Config que necesita la app; aísla el SDK de Firebase del resto del código. */
export interface RemoteConfigClient {
  /** Activa los valores descargados en un arranque anterior (no usa la red). */
  activateCached(): Promise<void>;
  /** Descarga y activa los valores. `force` ignora el intervalo mínimo entre descargas. */
  fetchAndActivate(force?: boolean): Promise<void>;
  getBoolean(key: string): boolean;
  /** Escucha los cambios publicados en tiempo real. Devuelve la función para dejar de escuchar. */
  onUpdate(listener: () => void, onError: (error: unknown) => void): () => void;
}

/** Crea el cliente, o devuelve `null` si Remote Config no está disponible. */
export type RemoteConfigLoader = () => Promise<RemoteConfigClient | null>;

export const REMOTE_CONFIG_LOADER = new InjectionToken<RemoteConfigLoader>('REMOTE_CONFIG_LOADER', {
  providedIn: 'root',
  factory: () => loadFirebaseRemoteConfig,
});

/**
 * Implementación con el SDK web de Firebase. Se carga con `import()` dinámico para que
 * Firebase no forme parte del bundle inicial: la app pinta primero y luego consulta los flags.
 */
export async function loadFirebaseRemoteConfig(): Promise<RemoteConfigClient | null> {
  const options = environment.firebase;
  if (!options) {
    return null;
  }
  const [{ initializeApp }, rc] = await Promise.all([import('@firebase/app'), import('@firebase/remote-config')]);
  if (!(await rc.isSupported())) {
    return null;
  }

  const remoteConfig = rc.getRemoteConfig(initializeApp(options));
  const interval = environment.remoteConfigMinFetchIntervalMs;
  remoteConfig.defaultConfig = FEATURE_FLAG_DEFAULTS;
  remoteConfig.settings.minimumFetchIntervalMillis = interval;

  return {
    activateCached: async () => {
      await rc.activate(remoteConfig);
    },
    fetchAndActivate: async (force = false) => {
      remoteConfig.settings.minimumFetchIntervalMillis = force ? 0 : interval;
      try {
        await rc.fetchAndActivate(remoteConfig);
      } finally {
        remoteConfig.settings.minimumFetchIntervalMillis = interval;
      }
    },
    getBoolean: (key) => rc.getBoolean(remoteConfig, key),
    onUpdate: (listener, onError) =>
      rc.onConfigUpdate(remoteConfig, {
        next: () => rc.activate(remoteConfig).then(listener, onError),
        error: onError,
        complete: () => undefined,
      }),
  };
}
