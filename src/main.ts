import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { IonicRouteStrategy } from '@ionic/angular/ionic-route-strategy';
import { provideIonicAngular } from '@ionic/angular/provide';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ useSetInputAPI: true }),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
  ],
});
