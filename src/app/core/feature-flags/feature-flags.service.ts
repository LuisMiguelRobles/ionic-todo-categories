import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';

import type { FeatureFlags } from './feature-flags';
import { FEATURE_FLAG_DEFAULTS, FEATURE_FLAG_KEYS } from './feature-flags';
import type { RemoteConfigClient } from './remote-config.client';
import { REMOTE_CONFIG_LOADER } from './remote-config.client';

/**
 * Feature flags respaldados por Firebase Remote Config.
 *
 * Arranca con los valores por defecto, aplica los valores en caché del arranque anterior,
 * descarga los nuevos y se suscribe a los cambios en tiempo real. Cualquier fallo (sin red,
 * sin configuración de Firebase) deja la app funcionando con el último valor conocido.
 */
@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private readonly loader = inject(REMOTE_CONFIG_LOADER);

  private client: RemoteConfigClient | null = null;
  private initialization: Promise<void> | null = null;
  private stopListening: (() => void) | null = null;

  private readonly _flags = signal<FeatureFlags>({ ...FEATURE_FLAG_DEFAULTS });

  readonly flags = this._flags.asReadonly();
  readonly taskStatsEnabled = computed(() => this._flags().enable_task_stats);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopListening?.());
  }

  /** Conecta con Remote Config. Es idempotente y nunca rechaza. */
  init(): Promise<void> {
    this.initialization ??= this.connect();
    return this.initialization;
  }

  /** Descarga inmediata ignorando el intervalo mínimo (p. ej. al deslizar para actualizar). */
  async refresh(): Promise<void> {
    await this.init();
    if (!this.client) {
      return;
    }
    try {
      await this.client.fetchAndActivate(true);
      this.readFlags();
    } catch (error) {
      console.warn('[RemoteConfig] No se pudo actualizar', error);
    }
  }

  private async connect(): Promise<void> {
    try {
      this.client = await this.loader();
      if (!this.client) {
        return;
      }
      await this.client.activateCached();
      this.readFlags();
      this.stopListening = this.client.onUpdate(
        () => this.readFlags(),
        (error) => console.warn('[RemoteConfig] Actualizaciones en tiempo real no disponibles', error),
      );
      await this.client.fetchAndActivate();
      this.readFlags();
    } catch (error) {
      console.warn('[RemoteConfig] Se usan los últimos valores conocidos', error);
    }
  }

  private readFlags(): void {
    const client = this.client;
    if (!client) {
      return;
    }
    this._flags.set(Object.fromEntries(FEATURE_FLAG_KEYS.map((key) => [key, client.getBoolean(key)])) as FeatureFlags);
  }
}
