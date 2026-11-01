import type { Environment } from './environment.model';
import { firebaseConfig } from './firebase.config';

export const environment: Environment = {
  production: true,
  firebase: firebaseConfig,
  // Valor recomendado por Firebase. Volver a primer plano y deslizar para actualizar descargan sin este límite.
  remoteConfigMinFetchIntervalMs: 60 * 60 * 1000,
};
