# Plugins de Cordova incluidos en el repositorio

## cordova-plugin-ionic-keyboard

Copia de [`cordova-plugin-ionic-keyboard@2.2.0`](https://github.com/ionic-team/cordova-plugin-ionic-keyboard)
(Apache 2.0, ver `LICENSE`) con un único cambio en `src/ios/CDVIonicKeyboard.m`.

**Problema:** cordova-ios 8 usa el ciclo de vida `UIScene`, por lo que `AppDelegate.window` siempre es `nil`
([guía de migración](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/upgrading-8.html)).
El plugin calculaba el nuevo alto del WebView a partir de esa ventana, así que al abrir el teclado el WebView
quedaba del alto del teclado y la app se veía en blanco.

**Cambio:** se usa la ventana del propio WebView:

```diff
-    CGRect f = [[[[UIApplication sharedApplication] delegate] window] bounds];
+    CGRect f = self.viewController.view.window.bounds;
```

Se incluye en el repositorio (y no como parche sobre `node_modules`) porque Cordova vuelve a descargar los
plugins al regenerar las plataformas, lo que descartaría el parche.
