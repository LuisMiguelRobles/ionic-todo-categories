import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';
import { REMOTE_CONFIG_LOADER } from './core/feature-flags/remote-config.client';

describe('AppComponent', () => {
  it('creates the app and connects feature flags after the first render', async () => {
    const loader = vi.fn(async () => null);
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), { provide: REMOTE_CONFIG_LOADER, useValue: loader }],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
    expect(loader).not.toHaveBeenCalled();

    await fixture.whenStable();

    expect(loader).toHaveBeenCalledTimes(1);
  });
});
