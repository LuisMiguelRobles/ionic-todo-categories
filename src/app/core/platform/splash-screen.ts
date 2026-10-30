interface CordovaSplashScreen {
  hide(): void;
}

declare global {
  interface Navigator {
    /** Expuesto por el splash nativo de cordova-android 11+ y cordova-ios 6+. */
    splashscreen?: CordovaSplashScreen;
  }
  interface Window {
    cordova?: unknown;
  }
}

/**
 * Oculta el splash nativo. `config.xml` desactiva el ocultado automático (que esperaría
 * un tiempo fijo) para cerrarlo justo cuando la app ya pintó su primera pantalla.
 * En navegador no hace nada. `deviceready` es "sticky": si ya ocurrió, el handler corre igual.
 */
export function hideSplashScreen(): void {
  if (!window.cordova) {
    return;
  }
  document.addEventListener('deviceready', () => navigator.splashscreen?.hide(), { once: true });
}
