import { TestBed } from '@angular/core/testing';

import { FakeStorageService } from '../../../../testing/fake-storage.service';
import type { Task } from '../../../core/models/task.model';
import { StorageService } from '../../../core/storage/storage.service';

import { TASKS_STORAGE_KEY, TasksStore, UNCATEGORIZED } from './tasks.store';

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
    const saved: Task[] = [{ id: 'a', title: 'Guardada', completed: true, categoryId: 'work', createdAt: 1 }];
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

  it('migrates tasks saved before categories existed', async () => {
    storage.data.set(TASKS_STORAGE_KEY, [{ id: 'old', title: 'Antigua', completed: false, createdAt: 1 }]);
    const fresh = TestBed.runInInjectionContext(() => new TasksStore());

    await fresh.load();

    expect(fresh.tasks()[0].categoryId).toBeNull();
  });

  describe('categories and filters', () => {
    beforeEach(() => {
      store.add('Informe', 'work');
      store.add('Gimnasio', 'home');
      store.add('Leer');
      store.add('Reunión', 'work');
    });

    it('counts tasks per category in one map, using null for uncategorized', () => {
      const counts = store.countByCategory();
      expect(counts.get('work')).toBe(2);
      expect(counts.get('home')).toBe(1);
      expect(counts.get(null)).toBe(1);
    });

    it('tracks total and completed tasks per category', () => {
      const report = store.tasks().find((task) => task.title === 'Informe')!;
      store.toggle(report.id);

      expect(store.progressByCategory().get('work')).toEqual({ total: 2, completed: 1 });
      expect(store.progressByCategory().get(null)).toEqual({ total: 1, completed: 0 });
      expect(store.totalCompleted()).toBe(1);
    });

    it('filters by category and by uncategorized', () => {
      store.setFilter({ kind: 'category', id: 'work' });
      expect(store.visibleTasks().map((task) => task.title)).toEqual(['Reunión', 'Informe']);

      store.setFilter(UNCATEGORIZED);
      expect(store.visibleTasks().map((task) => task.title)).toEqual(['Leer']);
    });

    it('scopes the pending/completed summary to the active filter', () => {
      const report = store.tasks().find((task) => task.title === 'Informe')!;
      store.toggle(report.id);
      store.setFilter({ kind: 'category', id: 'work' });

      expect(store.pendingCount()).toBe(1);
      expect(store.completedCount()).toBe(1);
    });

    it('changes the category of a task', () => {
      const reading = store.tasks().find((task) => task.title === 'Leer')!;
      store.setCategory(reading.id, 'home');
      expect(store.countByCategory().get('home')).toBe(2);
      expect(store.countByCategory().get(null)).toBeUndefined();
    });

    it('unassigns a deleted category and resets a filter pointing to it', () => {
      store.setFilter({ kind: 'category', id: 'work' });

      store.unassignCategory('work');

      expect(store.filter()).toEqual({ kind: 'all' });
      expect(store.countByCategory().get('work')).toBeUndefined();
      expect(store.countByCategory().get(null)).toBe(3);
    });
  });
});
