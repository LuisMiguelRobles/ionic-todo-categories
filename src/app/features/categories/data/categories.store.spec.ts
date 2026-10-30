import { TestBed } from '@angular/core/testing';

import { FakeStorageService } from '../../../../testing/fake-storage.service';
import type { Category } from '../../../core/models/category.model';
import { StorageService } from '../../../core/storage/storage.service';
import { TasksStore } from '../../tasks/data/tasks.store';

import { CATEGORIES_STORAGE_KEY, CATEGORY_NAME_MAX_LENGTH, CategoriesStore } from './categories.store';

const BLUE = '#3b82f6';

describe('CategoriesStore', () => {
  let store: CategoriesStore;
  let tasksStore: TasksStore;
  let storage: FakeStorageService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: StorageService, useClass: FakeStorageService }],
    });
    storage = TestBed.inject(StorageService) as unknown as FakeStorageService;
    store = TestBed.inject(CategoriesStore);
    tasksStore = TestBed.inject(TasksStore);
  });

  describe('load', () => {
    it('seeds default categories on first launch and persists them', async () => {
      await store.load();

      expect(store.categories().map((category) => category.name)).toEqual(['Personal', 'Trabajo']);
      expect(storage.data.get(CATEGORIES_STORAGE_KEY)).toBe(store.categories());
    });

    it('does not re-seed when the user deleted every category', async () => {
      storage.data.set(CATEGORIES_STORAGE_KEY, []);

      await store.load();

      expect(store.categories()).toEqual([]);
    });

    it('loads persisted categories', async () => {
      const saved: Category[] = [{ id: 'c1', name: 'Hogar', color: BLUE, createdAt: 1 }];
      storage.data.set(CATEGORIES_STORAGE_KEY, saved);

      await store.load();

      expect(store.categories()).toEqual(saved);
      expect(store.byId().get('c1')?.name).toBe('Hogar');
    });
  });

  describe('with defaults loaded', () => {
    beforeEach(() => store.load());

    it('validates empty, too long and duplicated names (case-insensitive)', () => {
      expect(store.validate({ name: '  ', color: BLUE })).toBe('empty');
      expect(store.validate({ name: 'x'.repeat(CATEGORY_NAME_MAX_LENGTH + 1), color: BLUE })).toBe('tooLong');
      expect(store.validate({ name: ' trabajo ', color: BLUE })).toBe('duplicate');
      expect(store.validate({ name: 'Hogar', color: BLUE })).toBeNull();
    });

    it('allows keeping the same name when editing', () => {
      const work = store.categories()[1];
      expect(store.validate({ name: 'Trabajo', color: BLUE }, work.id)).toBeNull();
    });

    it('adds a category with a trimmed name and rejects invalid drafts', () => {
      const created = store.add({ name: '  Hogar ', color: BLUE });

      expect(created?.name).toBe('Hogar');
      expect(store.categories()).toHaveLength(3);
      expect(store.add({ name: 'hogar', color: BLUE })).toBeNull();
      expect(store.categories()).toHaveLength(3);
    });

    it('updates name and color', () => {
      const personal = store.categories()[0];

      expect(store.update(personal.id, { name: 'Casa', color: '#ef4444' })).toBe(true);
      expect(store.byId().get(personal.id)).toMatchObject({ name: 'Casa', color: '#ef4444' });
    });

    it('refuses updates that would duplicate another name or target a missing category', () => {
      const personal = store.categories()[0];

      expect(store.update(personal.id, { name: 'Trabajo', color: BLUE })).toBe(false);
      expect(store.update('missing', { name: 'Otra', color: BLUE })).toBe(false);
    });

    it('removes a category and leaves its tasks uncategorized', () => {
      const work = store.categories()[1];
      const task = tasksStore.add('Informe', work.id)!;

      store.remove(work.id);

      expect(store.byId().has(work.id)).toBe(false);
      expect(tasksStore.tasks().find((t) => t.id === task.id)?.categoryId).toBeNull();
    });
  });
});
