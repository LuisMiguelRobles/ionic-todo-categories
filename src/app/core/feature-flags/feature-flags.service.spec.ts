import { TestBed } from '@angular/core/testing';

import { FeatureFlagsService } from './feature-flags.service';
import type { RemoteConfigClient } from './remote-config.client';
import { REMOTE_CONFIG_LOADER } from './remote-config.client';

/** Cliente controlable: `cached` y `remote` simulan lo guardado en el dispositivo y lo publicado en Firebase. */
class FakeRemoteConfigClient implements RemoteConfigClient {
  cached: Record<string, boolean> = {};
  remote: Record<string, boolean> = {};
  active: Record<string, boolean> = {};
  fetchError: unknown = null;
  readonly forcedFetches: boolean[] = [];
  private listener: (() => void) | null = null;

  async activateCached(): Promise<void> {
    this.active = { ...this.cached };
  }

  async fetchAndActivate(force = false): Promise<void> {
    this.forcedFetches.push(force);
    if (this.fetchError) {
      throw this.fetchError;
    }
    this.active = { ...this.remote };
  }

  getBoolean(key: string): boolean {
    return this.active[key] ?? false;
  }

  onUpdate(listener: () => void): () => void {
    this.listener = listener;
    return () => (this.listener = null);
  }

  /** Simula una publicación en la consola de Firebase recibida en tiempo real. */
  publish(values: Record<string, boolean>): void {
    this.remote = values;
    this.active = { ...values };
    this.listener?.();
  }
}

describe('FeatureFlagsService', () => {
  let client: FakeRemoteConfigClient | null;
  let service: FeatureFlagsService;

  function setup(): void {
    TestBed.configureTestingModule({
      providers: [{ provide: REMOTE_CONFIG_LOADER, useValue: async () => client }],
    });
    service = TestBed.inject(FeatureFlagsService);
  }

  beforeEach(() => {
    client = new FakeRemoteConfigClient();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('starts with the default values before connecting', () => {
    setup();
    expect(service.taskStatsEnabled()).toBe(false);
  });

  it('applies the remote value after init', async () => {
    client!.remote = { enable_task_stats: true };
    setup();

    await service.init();

    expect(service.taskStatsEnabled()).toBe(true);
  });

  it('keeps the cached value when the fetch fails (offline)', async () => {
    client!.cached = { enable_task_stats: true };
    client!.fetchError = new Error('offline');
    setup();

    await service.init();

    expect(service.taskStatsEnabled()).toBe(true);
  });

  it('reacts to real-time updates published in Firebase', async () => {
    setup();
    await service.init();
    expect(service.taskStatsEnabled()).toBe(false);

    client!.publish({ enable_task_stats: true });

    expect(service.taskStatsEnabled()).toBe(true);
  });

  it('forces a fetch on refresh, ignoring the minimum interval', async () => {
    setup();
    await service.init();
    client!.remote = { enable_task_stats: true };

    await service.refresh();

    expect(client!.forcedFetches).toEqual([false, true]);
    expect(service.taskStatsEnabled()).toBe(true);
  });

  it('keeps the defaults when Firebase is not configured', async () => {
    client = null;
    setup();

    await service.init();
    await service.refresh();

    expect(service.taskStatsEnabled()).toBe(false);
  });

  it('connects only once even if init is called repeatedly', async () => {
    const loader = vi.fn(async () => client);
    TestBed.configureTestingModule({ providers: [{ provide: REMOTE_CONFIG_LOADER, useValue: loader }] });
    service = TestBed.inject(FeatureFlagsService);

    await Promise.all([service.init(), service.init()]);

    expect(loader).toHaveBeenCalledTimes(1);
  });
});
