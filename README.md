# Tareas · Ionic To-Do con categorías

Aplicación híbrida de lista de tareas construida con **Ionic 9 + Angular 22** y empaquetada con **Cordova** para Android e iOS.

> Estado: **fase 2 — categorías**. Firebase Remote Config, las optimizaciones y los binarios llegan en las siguientes fases (ver [Roadmap](#roadmap)).

## Funcionalidades

**Tareas**
- Agregar (con Enter o con el botón), marcar como completada y eliminar (botón o deslizar) con **"Deshacer"**.
- Contador de pendientes y completadas según el filtro activo.

**Categorías**
- Crear, editar (nombre y color de una paleta accesible) y eliminar categorías desde la pantalla **Categorías** (ícono de etiquetas en el encabezado).
- Validación en línea: nombre obligatorio, máximo 30 caracteres y sin duplicados (sin distinguir mayúsculas).
- Asignar o cambiar la categoría de una tarea tocando su chip, que abre un action sheet nativo.
- **Filtrar** con los chips del encabezado: *Todas*, cada categoría o *Sin categoría*, cada uno con su contador.
- Al filtrar por una categoría, las tareas nuevas se crean en esa categoría. También se puede cambiar con el botón de etiqueta junto al campo de texto.
- Al eliminar una categoría se pide confirmación indicando cuántas tareas afecta. **Las tareas no se borran**: quedan sin categoría.

## Stack

| Capa | Tecnología |
|---|---|
| UI | Ionic 9 (componentes standalone), Angular 22 con signals y `OnPush` |
| Estado | Stores basados en `signal` / `computed` (sin librerías externas) |
| Persistencia | `@ionic/storage` (IndexedDB) con escrituras agrupadas (debounce) |
| Híbrido | Cordova 13 · cordova-android 15 · cordova-ios 8 · `@ionic/cordova-builders` |
| Calidad | ESLint (angular-eslint), Prettier, Vitest, Playwright |

## Requisitos

- **Node 24 LTS** (hay un `.nvmrc`: ejecuta `nvm use`). Angular 22 no soporta Node 23.
- CLIs globales:

```bash
npm i -g @ionic/cli cordova
```

## Ejecutar en el navegador

```bash
nvm use
npm install
npm start
```

Abre <http://localhost:4200>. Para verlo como teléfono, usa el modo dispositivo de las DevTools.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo |
| `npm run build` | Build de producción en `www/` |
| `npm run test:unit` | Pruebas unitarias (Vitest) |
| `npm run test:e2e` | Pruebas end-to-end (Playwright; requiere `npx playwright install chromium`) |
| `npm run lint` | ESLint + typecheck de e2e + Prettier |

## Compilar con Cordova

> Las instrucciones completas para dispositivos y emuladores se agregan en la fase 3.

```bash
npx cordova platform add android
npx cordova platform add ios
ionic cordova build android
ionic cordova build ios
```

Los targets `ionic-cordova-build` e `ionic-cordova-serve` de `angular.json` inyectan `cordova.js` en el build.
iOS usa el esquema `app://localhost` (ver `config.xml`), porque `file://` bloquea los módulos ES que genera Angular.
**Versión mínima de iOS: 17** (el WebView usa el motor de Safari del sistema).

## Estructura

```
src/app/
├── core/                     # Infraestructura compartida
│   ├── models/               # Interfaces de dominio (Task, Category)
│   ├── storage/              # StorageService (IndexedDB + debounce + flush al pasar a segundo plano)
│   └── utils/                # Utilidades puras (ids)
└── features/
    ├── tasks/
    │   ├── data/             # TasksStore: tareas, filtro y contadores por categoría
    │   ├── pages/            # TasksPage (ruta /tasks, carga diferida)
    │   └── components/       # TaskItemComponent (presentacional, OnPush)
    └── categories/
        ├── data/             # CategoriesStore (CRUD + validación) y paleta de colores
        ├── pages/            # CategoriesPage (ruta /categories, carga diferida)
        ├── components/       # CategoryFormModalComponent (crear/editar)
        └── category-picker.service.ts  # Action sheet para elegir categoría
src/testing/                  # Dobles de prueba compartidos (FakeStorageService)
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
- [ ] **Fase 3:** compilación nativa Android/iOS documentada
- [ ] **Fase 4:** Firebase Remote Config con feature flag
- [ ] **Fase 5:** optimización de rendimiento con métricas antes y después
- [ ] **Fase 6:** CI/CD con GitHub Actions
- [ ] **Fase 7:** APK e IPA en GitHub Releases
- [ ] **Fase 8:** entregables (capturas, video y respuestas)
