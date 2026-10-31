import { Injectable, computed, inject, signal } from '@angular/core';

import type { Task } from '../../../core/models/task.model';
import { StorageService } from '../../../core/storage/storage.service';
import { createId } from '../../../core/utils/id';

export const TASKS_STORAGE_KEY = 'tasks';

/** Filtro de la lista: todas, solo sin categoría, o una categoría concreta. */
export type CategoryFilter = { kind: 'all' } | { kind: 'uncategorized' } | { kind: 'category'; id: string };

export const ALL_TASKS: CategoryFilter = { kind: 'all' };
export const UNCATEGORIZED: CategoryFilter = { kind: 'uncategorized' };

export function matchesFilter(task: Task, filter: CategoryFilter): boolean {
  switch (filter.kind) {
    case 'all':
      return true;
    case 'uncategorized':
      return task.categoryId === null;
    case 'category':
      return task.categoryId === filter.id;
  }
}

export interface CategoryProgress {
  total: number;
  completed: number;
}

export interface RemovedTask {
  task: Task;
  index: number;
}

/**
 * Fuente única de verdad de las tareas.
 * Expone signals de solo lectura; toda mutación pasa por los métodos públicos,
 * que actualizan el estado en memoria y programan la persistencia.
 */
@Injectable({ providedIn: 'root' })
export class TasksStore {
  private readonly storage = inject(StorageService);

  private readonly _tasks = signal<readonly Task[]>([]);
  private readonly _loaded = signal(false);
  private readonly _filter = signal<CategoryFilter>(ALL_TASKS);

  /** Tareas ordenadas de la más reciente a la más antigua. */
  readonly tasks = this._tasks.asReadonly();
  readonly loaded = this._loaded.asReadonly();
  readonly filter = this._filter.asReadonly();

  /** Tareas que cumplen el filtro activo; solo se recalcula si cambian las tareas o el filtro. */
  readonly visibleTasks = computed(() => {
    const filter = this._filter();
    const tasks = this._tasks();
    return filter.kind === 'all' ? tasks : tasks.filter((task) => matchesFilter(task, filter));
  });

  /** Total y completadas por categoría en una sola pasada; la clave `null` agrupa las que no tienen categoría. */
  readonly progressByCategory = computed(() => {
    const progress = new Map<string | null, CategoryProgress>();
    for (const task of this._tasks()) {
      const entry = progress.get(task.categoryId) ?? { total: 0, completed: 0 };
      progress.set(task.categoryId, {
        total: entry.total + 1,
        completed: entry.completed + (task.completed ? 1 : 0),
      });
    }
    return progress;
  });

  /** Cantidad de tareas por categoría (para los chips de filtro). */
  readonly countByCategory = computed(
    () => new Map([...this.progressByCategory()].map(([categoryId, { total }]) => [categoryId, total])),
  );

  readonly totalCompleted = computed(() => this._tasks().filter((task) => task.completed).length);

  readonly pendingCount = computed(() => this.visibleTasks().filter((task) => !task.completed).length);
  readonly completedCount = computed(() => this.visibleTasks().length - this.pendingCount());

  async load(): Promise<void> {
    if (this._loaded()) {
      return;
    }
    const stored = await this.storage.get<Task[]>(TASKS_STORAGE_KEY);
    // Las tareas guardadas antes de existir las categorías no tienen `categoryId`.
    this._tasks.set((stored ?? []).map((task) => ({ ...task, categoryId: task.categoryId ?? null })));
    this._loaded.set(true);
  }

  setFilter(filter: CategoryFilter): void {
    this._filter.set(filter);
  }

  /** Crea una tarea. Devuelve `null` si el título está vacío. */
  add(title: string, categoryId: string | null = null): Task | null {
    const trimmed = title.trim();
    if (!trimmed) {
      return null;
    }
    const task: Task = { id: createId(), title: trimmed, completed: false, categoryId, createdAt: Date.now() };
    this.commit([task, ...this._tasks()]);
    return task;
  }

  toggle(id: string): void {
    this.updateTask(id, (task) => ({ ...task, completed: !task.completed }));
  }

  setCategory(id: string, categoryId: string | null): void {
    this.updateTask(id, (task) => (task.categoryId === categoryId ? task : { ...task, categoryId }));
  }

  /** Deja sin categoría las tareas de una categoría eliminada y limpia el filtro si apuntaba a ella. */
  unassignCategory(categoryId: string): void {
    const filter = this._filter();
    if (filter.kind === 'category' && filter.id === categoryId) {
      this._filter.set(ALL_TASKS);
    }
    if (!this._tasks().some((task) => task.categoryId === categoryId)) {
      return;
    }
    this.commit(this._tasks().map((task) => (task.categoryId === categoryId ? { ...task, categoryId: null } : task)));
  }

  /** Elimina una tarea y devuelve lo necesario para deshacer la operación. */
  remove(id: string): RemovedTask | null {
    const tasks = this._tasks();
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) {
      return null;
    }
    this.commit([...tasks.slice(0, index), ...tasks.slice(index + 1)]);
    return { task: tasks[index], index };
  }

  /** Reinserta una tarea eliminada en su posición original (deshacer). */
  restore({ task, index }: RemovedTask): void {
    const tasks = this._tasks();
    if (tasks.some((existing) => existing.id === task.id)) {
      return;
    }
    const position = Math.min(index, tasks.length);
    this.commit([...tasks.slice(0, position), task, ...tasks.slice(position)]);
  }

  private updateTask(id: string, change: (task: Task) => Task): void {
    this.commit(this._tasks().map((task) => (task.id === id ? change(task) : task)));
  }

  private commit(next: readonly Task[]): void {
    this._tasks.set(next);
    this.storage.set(TASKS_STORAGE_KEY, next);
  }
}
