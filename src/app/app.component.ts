import { Component, afterNextRender } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

import { hideSplashScreen } from './core/platform/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    afterNextRender(() => hideSplashScreen());
  }
}
