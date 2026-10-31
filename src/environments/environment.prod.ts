import type { Environment } from './environment.model';
import { firebaseConfig } from './firebase.config';

export const environment: Environment = {
  production: true,
  firebase: firebaseConfig,
  // Los cambios publicados llegan igualmente al instante por el listener en tiempo real.
  remoteConfigMinFetchIntervalMs: 60 * 60 * 1000,
};
