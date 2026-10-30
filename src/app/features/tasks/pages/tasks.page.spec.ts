import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { FakeStorageService } from '../../../../testing/fake-storage.service';
import { StorageService } from '../../../core/storage/storage.service';
import { CATEGORIES_STORAGE_KEY, CategoriesStore } from '../../categories/data/categories.store';
import { TasksStore } from '../data/tasks.store';

import { TasksPage } from './tasks.page';

describe('TasksPage', () => {
  let fixture: ComponentFixture<TasksPage>;
  let store: TasksStore;
  let categoriesStore: CategoriesStore;
  let element: HTMLElement;

  async function setup(storage = new FakeStorageService()) {
    TestBed.configureTestingModule({
      imports: [TasksPage],
      providers: [provideRouter([]), { provide: StorageService, useValue: storage }],
    });
    fixture = TestBed.createComponent(TasksPage);
    store = TestBed.inject(TasksStore);
    categoriesStore = TestBed.inject(CategoriesStore);
    await Promise.all([store.load(), categoriesStore.load()]);
    await fixture.whenStable();
    element = fixture.nativeElement;
  }

  function filterChips(): HTMLButtonElement[] {
    return [...element.querySelectorAll<HTMLButtonElement>('.filter-chip')];
  }

  it('shows the empty state when there are no tasks', async () => {
    await setup();
    expect(element.querySelector('.empty-state')?.textContent).toContain('No tienes tareas');
  });

  it('renders one item per task with the summary', async () => {
    await setup();
    store.add('Uno');
    store.add('Dos');
    await fixture.whenStable();

    expect(element.querySelectorAll('app-task-item')).toHaveLength(2);
    expect(element.querySelector('[data-testid="summary"]')?.textContent).toContain('2 pendientes');
  });

  it('shows filter chips with counts and filters the list on click', async () => {
    await setup();
    const work = categoriesStore.categories()[1];
    store.add('Informe', work.id);
    store.add('Leer');
    await fixture.whenStable();

    expect(filterChips().map((chip) => chip.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      'Todas 2',
      'Personal 0',
      'Trabajo 1',
      'Sin categoría 1',
    ]);

    filterChips()[2].click();
    await fixture.whenStable();

    expect(filterChips()[2].getAttribute('aria-pressed')).toBe('true');
    expect(element.querySelectorAll('app-task-item')).toHaveLength(1);
    expect(element.querySelector('app-task-item')?.textContent).toContain('Informe');
  });

  it('assigns the active category filter to new tasks', async () => {
    await setup();
    const work = categoriesStore.categories()[1];
    store.setFilter({ kind: 'category', id: work.id });
    await fixture.whenStable();

    (fixture.componentInstance as unknown as { newTitle: { set(v: string): void } }).newTitle.set('Reunión');
    (fixture.componentInstance as unknown as { addTask(): void }).addTask();

    expect(store.tasks()[0]).toMatchObject({ title: 'Reunión', categoryId: work.id });
  });

  it('hides filters and category selectors when there are no categories', async () => {
    const storage = new FakeStorageService();
    storage.data.set(CATEGORIES_STORAGE_KEY, []);
    await setup(storage);
    store.add('Uno');
    await fixture.whenStable();

    expect(filterChips()).toHaveLength(0);
    expect(element.querySelector('.category-chip')).toBeNull();
    expect(element.querySelector('.new-task-category')).toBeNull();
  });
});
