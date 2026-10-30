import { TestBed } from '@angular/core/testing';

import type { Task } from '../../../core/models/task.model';
import { StorageService } from '../../../core/storage/storage.service';

import { TASKS_STORAGE_KEY, TasksStore } from './tasks.store';

class FakeStorageService {
  readonly data = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | null> {
    return (this.data.get(key) as T | undefined) ?? null;
  }

  set<T>(key: string, value: T): void {
    this.data.set(key, value);
  }
}

describe('TasksStore', () => {
  let store: TasksStore;
  let storage: FakeStorageService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: StorageService, useClass: FakeStorageService }],
    });
    store = TestBed.inject(TasksStore);
    storage = TestBed.inject(StorageService) as unknown as FakeStorageService;
    await store.load();
  });

  it('starts empty and loaded when nothing is stored', () => {
    expect(store.loaded()).toBe(true);
    expect(store.tasks()).toEqual([]);
  });

  it('loads previously persisted tasks', async () => {
    const saved: Task[] = [{ id: 'a', title: 'Guardada', completed: true, createdAt: 1 }];
    storage.data.set(TASKS_STORAGE_KEY, saved);
    const fresh = TestBed.runInInjectionContext(() => new TasksStore());

    await fresh.load();

    expect(fresh.tasks()).toEqual(saved);
    expect(fresh.completedCount()).toBe(1);
  });

  it('adds tasks at the top with a trimmed title and persists them', () => {
    store.add('Primera');
    const second = store.add('  Segunda  ');

    expect(second?.title).toBe('Segunda');
    expect(store.tasks().map((task) => task.title)).toEqual(['Segunda', 'Primera']);
    expect(storage.data.get(TASKS_STORAGE_KEY)).toBe(store.tasks());
  });

  it('ignores blank titles', () => {
    expect(store.add('   ')).toBeNull();
    expect(store.tasks()).toHaveLength(0);
  });

  it('toggles completion and keeps the counters in sync', () => {
    const task = store.add('Comprar pan')!;
    store.add('Pagar luz');

    store.toggle(task.id);
    expect(store.pendingCount()).toBe(1);
    expect(store.completedCount()).toBe(1);

    store.toggle(task.id);
    expect(store.completedCount()).toBe(0);
  });

  it('removes a task and restores it in its original position', () => {
    store.add('C');
    const middle = store.add('B')!;
    store.add('A');

    const removed = store.remove(middle.id);
    expect(store.tasks().map((task) => task.title)).toEqual(['A', 'C']);

    store.restore(removed!);
    expect(store.tasks().map((task) => task.title)).toEqual(['A', 'B', 'C']);
  });

  it('returns null when removing an unknown task and does not restore twice', () => {
    expect(store.remove('missing')).toBeNull();

    const task = store.add('Única')!;
    const removed = store.remove(task.id)!;
    store.restore(removed);
    store.restore(removed);
    expect(store.tasks()).toHaveLength(1);
  });
});
