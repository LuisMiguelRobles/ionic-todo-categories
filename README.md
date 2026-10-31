# Tareas · Ionic To-Do con categorías

[![CI](https://github.com/LuisMiguelRobles/ionic-todo-categories/actions/workflows/ci.yml/badge.svg)](https://github.com/LuisMiguelRobles/ionic-todo-categories/actions/workflows/ci.yml)

Aplicación híbrida de lista de tareas construida con **Ionic 9 + Angular 22** y empaquetada con **Cordova** para Android e iOS.

> Estado: **fase 6 — integración continua**. Los binarios publicados (APK firmado e IPA) llegan en la siguiente fase (ver [Roadmap](#roadmap)).

## Funcionalidades

**Tareas**

- Agregar (con Enter o con el botón), marcar como completada y eliminar (botón o deslizar) con **"Deshacer"**.
- Contador de pendientes y completadas según el filtro activo.
- Lista virtual: fluida con miles de tareas (ver [Rendimiento](#rendimiento)).

**Categorías**

- Crear, editar (nombre y color de una paleta accesible) y eliminar categorías desde la pantalla **Categorías** (ícono de etiquetas en el encabezado).
- Validación en línea: nombre obligatorio, máximo 30 caracteres y sin duplicados (sin distinguir mayúsculas).
- Asignar o cambiar la categoría de una tarea tocando su chip, que abre un action sheet nativo.
- **Filtrar** con los chips del encabezado: _Todas_, cada categoría o _Sin categoría_, cada uno con su contador.
- Al filtrar por una categoría, las tareas nuevas se crean en esa categoría. También se puede cambiar con el botón de etiqueta junto al campo de texto.
- Al eliminar una categoría se pide confirmación indicando cuántas tareas afecta. **Las tareas no se borran**: quedan sin categoría.

**Feature flag (Firebase Remote Config)**

- Con el flag `enable_task_stats` activo aparece la tarjeta **"Tu progreso"**: porcentaje completado y avance por categoría. Ver [Firebase Remote Config](#firebase-remote-config).

## Stack

| Capa          | Tecnología                                                                  |
| ------------- | --------------------------------------------------------------------------- |
| UI            | Ionic 9 (componentes standalone), Angular 22 con signals y `OnPush`         |
| Estado        | Stores basados en `signal` / `computed` (sin librerías externas)            |
| Listas        | `@angular/cdk/scrolling` (lista virtual)                                    |
| Persistencia  | `@ionic/storage` (IndexedDB) con escrituras agrupadas (debounce)            |
| Feature flags | Firebase Remote Config (SDK web modular, carga diferida)                    |
| Híbrido       | Cordova 13 · cordova-android 15 · cordova-ios 8 · `@ionic/cordova-builders` |
| Calidad       | ESLint (angular-eslint), Prettier, Vitest, Playwright                       |

## Requisitos

- **Node 24 LTS** (hay un `.nvmrc`: ejecuta `nvm use`). Angular 22 no soporta Node 23.
- Ionic CLI y Cordova vienen como dependencias de desarrollo, así que **no hace falta instalarlos globalmente**: los scripts de `npm` usan las versiones del proyecto.
- Para compilar las apps nativas, ver [Android e iOS](#android-e-ios).

## Ejecutar en el navegador

```bash
nvm use
npm install
npm start
```

Abre <http://localhost:4200>. Para verlo como teléfono, usa el modo dispositivo de las DevTools.

## Scripts

| Comando                               | Qué hace                                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------------------------- |
| `npm start`                           | Servidor de desarrollo                                                                   |
| `npm run build`                       | Build de producción en `www/`                                                            |
| `npm run test:unit`                   | Pruebas unitarias (Vitest)                                                               |
| `npm run test:e2e`                    | Pruebas end-to-end (Playwright; requiere `npx playwright install --only-shell chromium`) |
| `npm run lint`                        | ESLint + typecheck de e2e + Prettier                                                     |
| `npm run android:*` / `npm run ios:*` | Compilar y ejecutar en nativo (ver [Android e iOS](#android-e-ios))                      |

## Android e iOS

La app se empaqueta con **Cordova 13** (cordova-android 15, cordova-ios 8). Las plataformas (`platforms/`) no se versionan: `package.json` las declara y Cordova las regenera.

### Preparar el entorno

**Android**

1. Instala [Android Studio](https://developer.android.com/studio). En _SDK Manager_ instala **Android SDK Platform 36**, **Build-Tools 36** y **Command-line Tools**. En _Device Manager_, crea un emulador.
2. Instala **JDK 17** y **Gradle**. El JDK que trae Android Studio puede ser más nuevo (p. ej. 25) y Gradle 8.14, que usa Cordova, no lo soporta.

   ```bash
   brew install openjdk@17 gradle
   ```

3. Agrega a tu `~/.zshrc`:

   ```bash
   export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH
   ```

**iOS** (solo macOS)

1. Instala **Xcode** desde la App Store y ábrelo una vez para que instale sus componentes y el simulador de iOS.
2. Selecciona Xcode como herramienta activa y acepta la licencia:

   ```bash
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   sudo xcodebuild -license accept
   ```

Comprueba el entorno con `npm run cordova:requirements`.

### Ejecutar en un emulador o dispositivo

```bash
npm install
npx cordova prepare          # descarga las plataformas declaradas en package.json
```

| Objetivo                                          | Comando                                                                                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Emulador de Android                               | `npm run android:run -- --emulator`                                                                                       |
| Dispositivo Android (con depuración USB activada) | `npm run android:run -- --device`                                                                                         |
| Simulador de iOS                                  | `npm run ios:run -- --emulator --target "iPhone-17"`                                                                      |
| Ver simuladores/emuladores disponibles            | `npx cordova run ios --list` / `npx cordova run android --list`                                                           |
| iPhone físico                                     | `npm run ios:build`, abre `platforms/ios/App.xcworkspace` en Xcode, elige tu _Team_ en _Signing & Capabilities_ y pulsa ▶ |

Con un Apple ID gratuito, Xcode puede instalar la app en tu propio iPhone; la firma dura 7 días. Para distribuirla hace falta una cuenta de Apple Developer de pago.

### Compilar

| Comando                           | Resultado                                                                     |
| --------------------------------- | ----------------------------------------------------------------------------- |
| `npm run android:build`           | APK de debug en `platforms/android/app/build/outputs/apk/debug/app-debug.apk` |
| `npm run android:release`         | APK de release; la firma se configura en la fase 7                            |
| `npm run ios:build -- --emulator` | `platforms/ios/build/Debug-iphonesimulator/Tareas.app`                        |

### Detalles de la integración

- **Builder de Angular:** los targets `ionic-cordova-build` e `ionic-cordova-serve` de `angular.json` usan `@ionic/cordova-builders` para inyectar `cordova.js` en el build.
- **iOS usa el esquema `app://localhost`**, porque `file://` bloquea los módulos ES que genera Angular. Android sirve los archivos desde `https://localhost` (WebViewAssetLoader).
- **Versión mínima: iOS 17** (`deployment-target` en `config.xml`), porque el WebView usa el motor de Safari del sistema y Angular 22 requiere Safari 17. En Android, el WebView se actualiza desde Play Store.
- **Íconos y splash:** `resources/icon.svg` es la fuente del ícono. Android usa ícono adaptativo (primer plano y fondo) y el splash nativo de Android 12+. En iOS, todos los tamaños se generan sin canal alfa, como exige la App Store.
- **Teclado en iOS:** `cordova-plugin-ionic-keyboard` reduce el WebView cuando se abre el teclado (`KeyboardResize`), así el campo de nueva tarea queda justo encima del teclado en lugar de desplazar toda la página. Se usa una copia con una corrección para cordova-iOS 8 (ver [`cordova-plugins/`](cordova-plugins/README.md)).
- **Splash sin espera fija:** `AutoHideSplashScreen=false` y la app lo oculta al pintar la primera pantalla (`core/platform/splash-screen.ts`). Así se evitan los 3 s de espera por defecto de Cordova.

### Problemas comunes

| Síntoma                                                                                          | Solución                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Could not find an installed version of Gradle`                                                  | `brew install gradle`                                                                                                                                                                                     |
| `Unsupported class file major version` / Gradle no arranca                                       | `JAVA_HOME` apunta a un JDK distinto de 17                                                                                                                                                                |
| `xcodebuild requires Xcode, but active developer directory ... is a command line tools instance` | `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`                                                                                                                                         |
| Pantalla en blanco en iOS                                                                        | Comprueba que `config.xml` mantenga `scheme=app` y `hostname=localhost`                                                                                                                                   |
| El splash no desaparece y los plugins no responden                                               | Se empaquetó el `cordova.js` de otra plataforma. Compila siempre con los scripts (`npm run ios:build`, `npm run android:build`), que regeneran `www` por plataforma; no uses `cordova build` directamente |

## Integración continua

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) se ejecuta en cada push a `main`, en cada pull request y a mano (_workflow_dispatch_):

| Job                     | Runner          | Qué hace                                                                            | Artefacto                                     |
| ----------------------- | --------------- | ----------------------------------------------------------------------------------- | --------------------------------------------- |
| Lint, tests y build web | `ubuntu-latest` | `npm run lint`, pruebas unitarias, build de producción y pruebas e2e con Playwright | Reporte de Playwright (solo si fallan)        |
| APK de Android          | `ubuntu-latest` | `npm run android:build -- --prod` con JDK 17 y Gradle                               | `android-debug-apk` (APK de debug)            |
| App de iOS (simulador)  | `macos-latest`  | `npm run ios:build -- -- --emulator` (no requiere firma)                            | `ios-simulator-app` (`Tareas.app` comprimida) |

- Los jobs de Android e iOS dependen del primero: si fallan el lint o las pruebas, no se compila nada.
- Cada plataforma ejecuta su propio `ionic cordova build`, que regenera `www` con el `cordova.js` correcto y agrega la plataforma y los plugins (incluido el de [`cordova-plugins/`](cordova-plugins/README.md)) en un checkout limpio. Por eso no hace falta versionar `platforms/` ni `plugins/`.
- Un push nuevo a la misma rama cancela la ejecución anterior (`concurrency`), y el workflow solo tiene permiso de lectura sobre el repositorio.
- [Dependabot](.github/dependabot.yml) propone una vez al mes un PR con las actualizaciones menores de npm y de las acciones de GitHub. Las versiones mayores (Angular, Ionic, Cordova) se actualizan a mano porque requieren migración.

Para probar en el simulador de iOS la app descargada de los artefactos:

```bash
unzip Tareas-simulator.zip && xcrun simctl install booted Tareas.app && xcrun simctl launch booted com.luisrobles.todocategories
```

## Firebase Remote Config

La app lee el flag booleano **`enable_task_stats`** (valor por defecto `false`). Cuando está en `true` se muestra la tarjeta de estadísticas sobre la lista de tareas.

### Demo

1. Abre la app (navegador, Android o iOS) con algunas tareas; no hay tarjeta de estadísticas.
2. En la [consola de Firebase](https://console.firebase.google.com) → **Remote Config**, cambia `enable_task_stats` a `true` y pulsa **Publicar cambios**.
3. **Vuelve a la app** (o, si nunca salió de pantalla, **desliza hacia abajo** la lista): descarga la configuración y aparece la tarjeta **"Tu progreso"** al instante.
4. Vuelve a `false` y publica: la tarjeta desaparece.

La configuración se descarga al abrir la app, al volver a primer plano y al deslizar para actualizar. Además, el listener en tiempo real aplica los cambios sin intervención, aunque con retraso: en las pruebas, Firebase no notificó por la conexión abierta y el cambio llegó cuando el SDK renovó la conexión, a los ~4 minutos.

### Cómo funciona

- **Carga diferida:** el SDK de Firebase se importa con `import()` después del primer render, en un _chunk_ aparte; no aumenta el bundle inicial ni retrasa el arranque.
- **Arranque:** se aplican primero los valores en caché del último arranque (IndexedDB), luego se descargan los nuevos y se abre el listener `onConfigUpdate` para cambios en tiempo real.
- **Sin conexión:** cualquier fallo deja la app funcionando con el último valor conocido o, si nunca se descargó, con el valor por defecto definido en el código (`FEATURE_FLAG_DEFAULTS`).
- **Intervalo mínimo de descarga:** 0 en desarrollo y 1 hora en producción; volver a primer plano y deslizar para actualizar lo ignoran. Para no generar ráfagas al cambiar de app seguido, al volver a primer plano se descarga como mucho una vez cada 15 s (deslizar para actualizar no tiene ese límite) y, si `resume` y `visibilitychange` llegan juntos, comparten una sola descarga.
- **Pruebas:** el SDK está detrás del `InjectionToken` `REMOTE_CONFIG_LOADER`, así que los tests usan un cliente falso sin red.
- **Un solo SDK para todo:** se usa el SDK web en el WebView, así que basta con registrar una **app web** en Firebase; no hacen falta `google-services.json` ni `GoogleService-Info.plist`.

### Usar tu propio proyecto de Firebase

1. Crea un proyecto en Firebase y registra una **app web** (`</>`).
2. Copia el objeto `firebaseConfig` en [`src/environments/firebase.config.ts`](src/environments/firebase.config.ts).
3. En **Remote Config** crea el parámetro `enable_task_stats` (Booleano, `false`) y publícalo.

### Sobre la API key

La configuración web de Firebase **no es un secreto**: identifica el proyecto y viaja en cualquier app web o móvil. Lo que la protege son las restricciones. Para limitarla, en [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → **Credenciales** → la clave _Browser key (auto created by Firebase)_:

- **Restricciones de API:** permite solo _Firebase Remote Config API_, _Firebase Remote Config Realtime API_ y _Firebase Installations API_.
- **Restricciones de aplicación:** los WebView usan los orígenes `https://localhost` (Android) y `app://localhost` (iOS), así que una restricción por _referente HTTP_ bloquearía las apps nativas. Por eso conviene limitar las APIs en lugar del origen.

## Rendimiento

Se midió la app antes y después de las optimizaciones con **10.000 tareas** repartidas entre dos categorías y "Sin categoría" (30 % completadas), usando builds de producción. La versión "antes" es el commit anterior a esta fase (`f2d69dd`) con la misma instrumentación.

### Resultados

**Bundle inicial** (`ng build`, lo que se descarga antes de la primera pantalla):

|                               | Antes    | Después              |
| ----------------------------- | -------- | -------------------- |
| Tamaño (sin comprimir)        | 911,8 kB | 512,4 kB             |
| Transferencia estimada (gzip) | 182,8 kB | **132,0 kB (−28 %)** |

**Navegador** (Chromium de escritorio, sin limitar la CPU):

| Métrica                                                   | Antes                            | Después                                                |
| --------------------------------------------------------- | -------------------------------- | ------------------------------------------------------ |
| Lista pintada con los datos (marca `tasks-rendered`)      | 826–1.356 ms                     | **54–70 ms**                                           |
| Tareas largas durante la carga (hilo principal bloqueado) | 6,2–6,5 s                        | **0 ms**                                               |
| Filas en el DOM                                           | 10.000                           | **27**                                                 |
| Nodos del DOM (incluido shadow DOM)                       | 490.156                          | **1.483**                                              |
| Memoria JS (pestaña nueva)                                | 292–387 MB                       | **9–17 MB**                                            |
| Marcar una tarea                                          | 242 ms                           | **9 ms**                                               |
| Filtrar por una categoría                                 | 383 ms                           | **36 ms**                                              |
| Volver a "Todas"                                          | 3.972 ms                         | **35 ms**                                              |
| Desplazamiento                                            | 10 fps, todos los frames > 50 ms | **121 fps** (pantalla de 120 Hz), ningún frame > 50 ms |

**Android** (emulador Medium Phone, API 37; APK de debug con build de producción; arranque en frío):

| Métrica                                              | Antes               | Después                |
| ---------------------------------------------------- | ------------------- | ---------------------- |
| Desde lanzar la app hasta la lista pintada (mediana) | 28,8 s (5,2–37,0 s) | **1,7 s** (1,4–16,0 s) |
| Tareas largas durante la carga (mediana)             | 30,1 s              | **0,55 s**             |
| Nodos del DOM                                        | 490.159             | **1.976**              |
| Memoria JS                                           | 272,8 MB            | **9,5 MB**             |

Los tiempos en el emulador varían mucho entre ejecuciones (la misma build tardó entre 1,4 y 16 s), así que solo son comparables en órdenes de magnitud. Los nodos del DOM y la memoria no dependen de esa variación. Con la lista vacía, la diferencia de arranque entre ambas versiones quedó por debajo de ese ruido. En una de las mediciones de la versión anterior con 10.000 tareas el emulador se cerró.

### Optimizaciones

- **Lista virtual** ([`tasks.page.html`](src/app/features/tasks/pages/tasks.page.html)): con `@angular/cdk/scrolling` solo existen en el DOM las filas visibles más un margen (unas 30), sin importar cuántas tareas haya. Antes cada tarea creaba su componente y los de Ionic (`ion-item-sliding`, `ion-checkbox`, botones…), unos 49 nodos por fila.
  - El desplazamiento lo hace un contenedor propio (`cdkVirtualScrollingElement`), así la tarjeta de progreso y el resumen se desplazan junto con la lista. Lleva la clase `ion-content-scroll-host` para que `ion-refresher` (deslizar para actualizar) siga funcionando.
  - Cada fila mide 56 px fijos (`TASK_ITEM_HEIGHT`), lo que permite calcular qué filas mostrar sin medirlas.
  - No se reutilizan vistas entre tareas (`templateCacheSize: 0`): una fila reciclada podría conservar el estado "deslizado" de otra tarea. Con unas 30 filas, crearlas de nuevo no tiene un costo apreciable.
  - Al cambiar de filtro la lista vuelve al inicio.
- **Imports por componente de Ionic:** en Ionic 9, `import … from '@ionic/angular'` pasa por un archivo índice que llevaba al bundle inicial componentes que solo usan las páginas diferidas (`ion-input`, `ion-toast`, `ion-refresher`, `ion-progress-bar`…). Con imports profundos (`@ionic/angular/ion-button`, `@ionic/angular/toast-controller`, …) cada página carga solo lo suyo: el bundle inicial bajó de 182,8 a 127,2 kB. La lista virtual suma 4,8 kB porque `@angular/core` y `rxjs` van en el bundle inicial, así que el resultado final es 132,0 kB.

Optimizaciones de fases anteriores que también influyen en las métricas:

- **Rutas con carga diferida** y precarga de la segunda pantalla cuando la app ya está lista.
- **Firebase después de la primera pantalla:** el SDK se importa con `import()` en un _chunk_ aparte.
- **Splash nativo oculto al pintar** la primera pantalla, sin los 3 s fijos de Cordova.
- **`OnPush` y signals:** solo se actualiza lo que depende del estado que cambió. Los contadores por categoría se calculan en una sola pasada (`progressByCategory`).
- **Escrituras agrupadas en IndexedDB:** varias acciones seguidas se guardan en una sola escritura.

### Memoria

- La lista virtual mantiene constante la memoria de la vista: la diferencia con 10.000 tareas fue de ~300 MB a ~10 MB.
- Los listeners globales se eliminan al destruir sus servicios (`FeatureFlagsService` quita los de `resume`/`visibilitychange` y el de Remote Config), y no hay suscripciones de RxJS en los componentes: el estado se lee con signals, que Angular limpia solo.
- `StorageService` vacía su cola de escrituras pendientes en cada guardado.

### Concesiones

- **Títulos en una sola línea** (con puntos suspensivos) para que todas las filas midan lo mismo.
- **Filas fuera de pantalla:** como no existen en el DOM, la búsqueda del navegador y los lectores de pantalla solo ven las filas visibles.

### Cómo reproducir

1. `npx ng build` y servir `www/` (por ejemplo, `python3 -m http.server -d www 8200`), o instalar el APK de debug.
2. Pegar [`scripts/perf/seed-tasks.js`](scripts/perf/seed-tasks.js) en la consola de DevTools y recargar.
3. Pegar [`scripts/perf/measure-load.js`](scripts/perf/measure-load.js) y después [`scripts/perf/measure-interactions.js`](scripts/perf/measure-interactions.js).
4. En Android, con el emulador abierto: `scripts/perf/android/measure.sh com.luisrobles.todocategories scripts/perf/seed-tasks.js` y después el mismo comando con `measure-load.js`. Usa el protocolo de DevTools del WebView (APK de debug).

La marca `tasks-rendered` ([`core/performance`](src/app/core/performance/performance-marks.ts)) se registra cuando la lista se pinta por primera vez con los datos guardados. En los builds de desarrollo también se escribe en consola, que en Android llega a `adb logcat`.

## Estructura

```
src/app/
├── core/                     # Infraestructura compartida
│   ├── feature-flags/        # FeatureFlagsService + cliente de Remote Config (carga diferida)
│   ├── models/               # Interfaces de dominio (Task, Category)
│   ├── performance/          # Marcas de la Performance API (tasks-rendered)
│   ├── platform/             # Integración nativa (ocultar el splash)
│   ├── storage/              # StorageService (IndexedDB + debounce + flush al pasar a segundo plano)
│   └── utils/                # Utilidades puras (ids)
└── features/
    ├── tasks/
    │   ├── data/             # TasksStore: tareas, filtro y contadores por categoría
    │   ├── pages/            # TasksPage (ruta /tasks, carga diferida)
    │   └── components/       # TaskItemComponent y TaskStatsComponent (presentacionales, OnPush)
    └── categories/
        ├── data/             # CategoriesStore (CRUD + validación) y paleta de colores
        ├── pages/            # CategoriesPage (ruta /categories, carga diferida)
        ├── components/       # CategoryFormModalComponent (crear/editar)
        └── category-picker.service.ts  # Action sheet para elegir categoría
src/environments/             # Entornos y configuración web de Firebase
src/testing/                  # Dobles de prueba compartidos (FakeStorageService)
scripts/perf/                 # Scripts para medir el rendimiento (navegador y Android)
cordova-plugins/              # Plugins de Cordova incluidos con correcciones
```

**Decisiones**

- **Stores con signals:** los componentes leen signals de solo lectura y mutan el estado únicamente con métodos del store, así el flujo de datos es predecible y fácil de probar.
- **Persistencia con debounce:** varias acciones seguidas se guardan en una sola escritura. Los cambios pendientes se fuerzan a disco con el evento `pause` de Cordova o con `visibilitychange`.
- **Eliminar con "Deshacer":** se evita un diálogo de confirmación sin arriesgar borrados accidentales.
- **Dependencia en una sola dirección:** `CategoriesStore` conoce a `TasksStore` (para dejar tareas sin categoría al borrar una), pero `TasksStore` no conoce las categorías: solo guarda un `categoryId`.
- **Filtro como unión discriminada** (`all` / `uncategorized` / `category`), sin cadenas mágicas, y con contadores calculados en **una sola pasada** (`countByCategory`).
- **Categorías iniciales** ("Personal" y "Trabajo") solo en el primer arranque, para que la funcionalidad se vea desde el inicio. Si el usuario borra todas, no se vuelven a crear.
- **Migración de datos:** las tareas guardadas antes de existir las categorías reciben `categoryId: null` al cargarse.
- **Modales con signal inputs:** `provideIonicAngular({ useSetInputAPI: true })` permite pasar `componentProps` a componentes que usan `input()`.

## Roadmap

- [x] **Fase 0:** entorno (Node 24, Ionic CLI, Cordova CLI)
- [x] **Fase 1:** app base (CRUD de tareas, persistencia, Cordova configurado)
- [x] **Fase 2:** categorías (CRUD, asignación, filtro)
- [x] **Fase 3:** compilación nativa Android/iOS documentada
- [x] **Fase 4:** Firebase Remote Config con feature flag
- [x] **Fase 5:** optimización de rendimiento con métricas antes y después
- [x] **Fase 6:** CI/CD con GitHub Actions
- [ ] **Fase 7:** APK e IPA en GitHub Releases
- [ ] **Fase 8:** entregables (capturas, video y respuestas)
