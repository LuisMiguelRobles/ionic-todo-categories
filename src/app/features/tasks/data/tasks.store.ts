import { Injectable, computed, inject, signal } from '@angular/core';

import type { Task } from '../../../core/models/task.model';
import { StorageService } from '../../../core/storage/storage.service';
import { createId } from '../../../core/utils/id';

export const TASKS_STORAGE_KEY = 'tasks';

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

  /** Tareas ordenadas de la más reciente a la más antigua. */
  readonly tasks = this._tasks.asReadonly();
  readonly loaded = this._loaded.asReadonly();
  readonly pendingCount = computed(() => this._tasks().filter((task) => !task.completed).length);
  readonly completedCount = computed(() => this._tasks().length - this.pendingCount());

  async load(): Promise<void> {
    if (this._loaded()) {
      return;
    }
    const stored = await this.storage.get<Task[]>(TASKS_STORAGE_KEY);
    this._tasks.set(stored ?? []);
    this._loaded.set(true);
  }

  /** Crea una tarea. Devuelve `null` si el título está vacío. */
  add(title: string): Task | null {
    const trimmed = title.trim();
    if (!trimmed) {
      return null;
    }
    const task: Task = { id: createId(), title: trimmed, completed: false, createdAt: Date.now() };
    this.commit([task, ...this._tasks()]);
    return task;
  }

  toggle(id: string): void {
    this.commit(this._tasks().map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
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

  private commit(next: readonly Task[]): void {
    this._tasks.set(next);
    this.storage.set(TASKS_STORAGE_KEY, next);
  }
}
