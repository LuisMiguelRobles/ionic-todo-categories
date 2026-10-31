import type { Environment } from './environment.model';
import { firebaseConfig } from './firebase.config';

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment: Environment = {
  production: false,
  firebase: firebaseConfig,
  remoteConfigMinFetchIntervalMs: 0,
};
