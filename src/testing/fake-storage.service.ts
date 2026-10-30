/** Sustituto en memoria de `StorageService` para pruebas unitarias. */
export class FakeStorageService {
  readonly data = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | null> {
    return (this.data.get(key) as T | undefined) ?? null;
  }

  set<T>(key: string, value: T): void {
    this.data.set(key, value);
  }
}
