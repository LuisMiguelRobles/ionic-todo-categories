import { Component, afterNextRender, inject } from '@angular/core';
import { IonApp } from '@ionic/angular/ion-app';
import { IonRouterOutlet } from '@ionic/angular/ion-router-outlet';

import { FeatureFlagsService } from './core/feature-flags/feature-flags.service';
import { hideSplashScreen } from './core/platform/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    const featureFlags = inject(FeatureFlagsService);
    // Firebase se carga después de la primera pantalla para no retrasar el arranque.
    afterNextRender(() => {
      hideSplashScreen();
      void featureFlags.init();
    });
  }
}
