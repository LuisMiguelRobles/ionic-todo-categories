import { Injectable, computed, inject, signal } from '@angular/core';

import type { Category, CategoryDraft } from '../../../core/models/category.model';
import { StorageService } from '../../../core/storage/storage.service';
import { createId } from '../../../core/utils/id';
import { TasksStore } from '../../tasks/data/tasks.store';

import { CATEGORY_COLORS } from './category-colors';

export const CATEGORIES_STORAGE_KEY = 'categories';
export const CATEGORY_NAME_MAX_LENGTH = 30;

export type CategoryValidationError = 'empty' | 'tooLong' | 'duplicate';

/** Categorías iniciales para que la funcionalidad sea visible desde el primer uso. */
const DEFAULT_CATEGORIES: readonly CategoryDraft[] = [
  { name: 'Personal', color: CATEGORY_COLORS[0].value },
  { name: 'Trabajo', color: CATEGORY_COLORS[1].value },
];

@Injectable({ providedIn: 'root' })
export class CategoriesStore {
  private readonly storage = inject(StorageService);
  private readonly tasksStore = inject(TasksStore);

  private readonly _categories = signal<readonly Category[]>([]);
  private readonly _loaded = signal(false);

  /** Categorías en orden de creación. */
  readonly categories = this._categories.asReadonly();
  readonly loaded = this._loaded.asReadonly();
  /** Índice por id para resolver la categoría de cada tarea en O(1). */
  readonly byId = computed(() => new Map(this._categories().map((category) => [category.id, category])));

  async load(): Promise<void> {
    if (this._loaded()) {
      return;
    }
    const stored = await this.storage.get<Category[]>(CATEGORIES_STORAGE_KEY);
    if (stored === null) {
      // Primer arranque: se distingue de "el usuario borró todas" (array vacío).
      this.commit(DEFAULT_CATEGORIES.map((draft, index) => this.build(draft, index)));
    } else {
      this._categories.set(stored);
    }
    this._loaded.set(true);
  }

  /** Valida un borrador. `excludeId` permite conservar el mismo nombre al editar. */
  validate({ name }: CategoryDraft, excludeId?: string): CategoryValidationError | null {
    const trimmed = name.trim();
    if (!trimmed) {
      return 'empty';
    }
    if (trimmed.length > CATEGORY_NAME_MAX_LENGTH) {
      return 'tooLong';
    }
    const key = trimmed.toLocaleLowerCase();
    const duplicated = this._categories().some(
      (category) => category.id !== excludeId && category.name.toLocaleLowerCase() === key,
    );
    return duplicated ? 'duplicate' : null;
  }

  /** Crea una categoría. Devuelve `null` si el borrador no es válido. */
  add(draft: CategoryDraft): Category | null {
    if (this.validate(draft)) {
      return null;
    }
    const category = this.build(draft);
    this.commit([...this._categories(), category]);
    return category;
  }

  /** Actualiza nombre y color. Devuelve `false` si el borrador no es válido o la categoría no existe. */
  update(id: string, draft: CategoryDraft): boolean {
    if (!this.byId().has(id) || this.validate(draft, id)) {
      return false;
    }
    this.commit(
      this._categories().map((category) =>
        category.id === id ? { ...category, name: draft.name.trim(), color: draft.color } : category,
      ),
    );
    return true;
  }

  /** Elimina la categoría; sus tareas se conservan y quedan sin categoría. */
  remove(id: string): void {
    if (!this.byId().has(id)) {
      return;
    }
    this.commit(this._categories().filter((category) => category.id !== id));
    this.tasksStore.unassignCategory(id);
  }

  private build(draft: CategoryDraft, offset = 0): Category {
    return { id: createId(), name: draft.name.trim(), color: draft.color, createdAt: Date.now() + offset };
  }

  private commit(next: readonly Category[]): void {
    this._categories.set(next);
    this.storage.set(CATEGORIES_STORAGE_KEY, next);
  }
}
