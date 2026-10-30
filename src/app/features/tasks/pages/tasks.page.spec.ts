import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { StorageService } from '../../../core/storage/storage.service';
import { TasksStore } from '../data/tasks.store';

import { TasksPage } from './tasks.page';

const memoryStorage = {
  get: async () => null,
  set: () => undefined,
};

describe('TasksPage', () => {
  let fixture: ComponentFixture<TasksPage>;
  let store: TasksStore;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [TasksPage],
      providers: [{ provide: StorageService, useValue: memoryStorage }],
    });
    fixture = TestBed.createComponent(TasksPage);
    store = TestBed.inject(TasksStore);
    await store.load();
    await fixture.whenStable();
  });

  it('shows the empty state when there are no tasks', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.empty-state')?.textContent).toContain('No tienes tareas');
  });

  it('renders one item per task with the summary', async () => {
    store.add('Uno');
    store.add('Dos');
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('app-task-item')).toHaveLength(2);
    expect(element.querySelector('[data-testid="summary"]')?.textContent).toContain('2 pendientes');
  });
});
