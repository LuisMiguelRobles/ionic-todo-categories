import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

/** Tiempo de espera antes de persistir, para agrupar ráfagas de cambios en una sola escritura. */
export const WRITE_DEBOUNCE_MS = 300;

/**
 * Persistencia clave/valor asíncrona sobre @ionic/storage (IndexedDB en web y WebView).
 *
 * Las escrituras se agrupan con debounce: marcar 20 tareas seguidas genera una sola
 * escritura en disco en lugar de 20. Los cambios pendientes se fuerzan a disco cuando
 * la app pasa a segundo plano (evento `pause` de Cordova / `visibilitychange`).
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly storage = new Storage({ name: 'todo_db' });
  private ready: Promise<Storage> | null = null;
  private readonly pending = new Map<string, unknown>();
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    document.addEventListener('pause', () => void this.flush());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        void this.flush();
      }
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.pending.has(key)) {
      return this.pending.get(key) as T;
    }
    const db = await this.db();
    return ((await db.get(key)) as T | undefined) ?? null;
  }

  set<T>(key: string, value: T): void {
    this.pending.set(key, value);
    if (this.flushTimer === null) {
      this.flushTimer = setTimeout(() => void this.flush(), WRITE_DEBOUNCE_MS);
    }
  }

  async flush(): Promise<void> {
    if (this.flushTimer !== null) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.pending.size === 0) {
      return;
    }
    const entries = [...this.pending];
    this.pending.clear();
    const db = await this.db();
    await Promise.all(entries.map(([key, value]) => db.set(key, value)));
  }

  private db(): Promise<Storage> {
    this.ready ??= this.storage.create();
    return this.ready;
  }
}
