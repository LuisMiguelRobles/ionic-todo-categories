import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonNote,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import type { RefresherCustomEvent } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, checkmarkDoneCircleOutline, filterOutline, pricetagOutline, pricetagsOutline } from 'ionicons/icons';

import { FeatureFlagsService } from '../../../core/feature-flags/feature-flags.service';
import type { Category } from '../../../core/models/category.model';
import type { Task } from '../../../core/models/task.model';
import { CategoryPickerService } from '../../categories/category-picker.service';
import { CategoriesStore } from '../../categories/data/categories.store';
import { TaskItemComponent } from '../components/task-item/task-item.component';
import type { StatsRow } from '../components/task-stats/task-stats.component';
import { TaskStatsComponent } from '../components/task-stats/task-stats.component';
import type { CategoryFilter, RemovedTask } from '../data/tasks.store';
import { ALL_TASKS, TasksStore, UNCATEGORIZED } from '../data/tasks.store';

interface FilterOption {
  key: string;
  label: string;
  count: number;
  color: string | null;
  filter: CategoryFilter;
}

function filterKey(filter: CategoryFilter): string {
  return filter.kind === 'category' ? filter.id : filter.kind;
}

@Component({
  selector: 'app-tasks',
  templateUrl: 'tasks.page.html',
  styleUrls: ['tasks.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonSkeletonText,
    IonNote,
    IonRefresher,
    IonRefresherContent,
    IonIcon,
    IonFooter,
    IonInput,
    IonButton,
    TaskItemComponent,
    TaskStatsComponent,
  ],
})
export class TasksPage {
  protected readonly store = inject(TasksStore);
  protected readonly categoriesStore = inject(CategoriesStore);
  private readonly categoryPicker = inject(CategoryPickerService);
  private readonly toastController = inject(ToastController);
  protected readonly featureFlags = inject(FeatureFlagsService);

  protected readonly newTitle = signal('');
  protected readonly skeletonRows = [1, 2, 3, 4, 5];

  protected readonly hasCategories = computed(() => this.categoriesStore.categories().length > 0);
  protected readonly activeFilterKey = computed(() => filterKey(this.store.filter()));

  /** Chips de filtro con su contador; vacío si no hay categorías. */
  protected readonly filterOptions = computed<FilterOption[]>(() => {
    const categories = this.categoriesStore.categories();
    if (categories.length === 0) {
      return [];
    }
    const counts = this.store.countByCategory();
    return [
      { key: 'all', label: 'Todas', count: this.store.tasks().length, color: null, filter: ALL_TASKS },
      ...categories.map((category) => ({
        key: category.id,
        label: category.name,
        count: counts.get(category.id) ?? 0,
        color: category.color,
        filter: { kind: 'category', id: category.id } as const,
      })),
      {
        key: 'uncategorized',
        label: 'Sin categoría',
        count: counts.get(null) ?? 0,
        color: null,
        filter: UNCATEGORIZED,
      },
    ];
  });

  /** Filas de la tarjeta de progreso: categorías con tareas y, al final, las que no tienen categoría. */
  protected readonly statsRows = computed<StatsRow[]>(() => {
    const progress = this.store.progressByCategory();
    const rows: StatsRow[] = this.categoriesStore.categories().flatMap((category) => {
      const entry = progress.get(category.id);
      return entry ? [{ key: category.id, label: category.name, color: category.color, ...entry }] : [];
    });
    const uncategorized = progress.get(null);
    if (uncategorized && rows.length > 0) {
      rows.push({ key: 'uncategorized', label: 'Sin categoría', color: null, ...uncategorized });
    }
    return rows;
  });

  /** Categoría para la próxima tarea: por defecto, la del filtro activo. */
  protected readonly newTaskCategoryId = linkedSignal(() => {
    const filter = this.store.filter();
    return filter.kind === 'category' ? filter.id : null;
  });
  protected readonly newTaskCategory = computed(() => {
    const id = this.newTaskCategoryId();
    return id ? (this.categoriesStore.byId().get(id) ?? null) : null;
  });
  protected readonly newTaskPlaceholder = computed(() => {
    const category = this.newTaskCategory();
    return category ? `Nueva tarea en ${category.name}…` : 'Nueva tarea…';
  });

  constructor() {
    addIcons({ add, checkmarkDoneCircleOutline, filterOutline, pricetagOutline, pricetagsOutline });
    void this.store.load();
    void this.categoriesStore.load();
  }

  /** Deslizar para actualizar: fuerza la descarga de Remote Config. */
  protected async onRefresh(event: RefresherCustomEvent): Promise<void> {
    await this.featureFlags.refresh();
    await event.target.complete();
  }

  protected showAll(): void {
    this.store.setFilter(ALL_TASKS);
  }

  protected categoryOf(task: Task): Category | null {
    return task.categoryId ? (this.categoriesStore.byId().get(task.categoryId) ?? null) : null;
  }

  protected onTitleInput(value: string | null | undefined): void {
    this.newTitle.set(value ?? '');
  }

  protected addTask(): void {
    if (this.store.add(this.newTitle(), this.newTaskCategory()?.id ?? null)) {
      this.newTitle.set('');
    }
  }

  protected async pickNewTaskCategory(): Promise<void> {
    const picked = await this.categoryPicker.pick(this.newTaskCategory()?.id ?? null, 'Categoría de la nueva tarea');
    if (picked !== undefined) {
      this.newTaskCategoryId.set(picked);
    }
  }

  protected async changeCategory(task: Task): Promise<void> {
    const picked = await this.categoryPicker.pick(task.categoryId);
    if (picked !== undefined) {
      this.store.setCategory(task.id, picked);
    }
  }

  protected async deleteTask(task: Task): Promise<void> {
    const removed = this.store.remove(task.id);
    if (!removed) {
      return;
    }
    const toast = await this.toastController.create({
      message: 'Tarea eliminada',
      duration: 5000,
      position: 'bottom',
      positionAnchor: 'add-task-footer',
      buttons: [{ text: 'Deshacer', handler: () => this.undoDelete(removed) }],
    });
    await toast.present();
  }

  private undoDelete(removed: RemovedTask): void {
    this.store.restore(removed);
    // La categoría pudo eliminarse mientras el toast estaba visible.
    const { id, categoryId } = removed.task;
    if (categoryId && !this.categoriesStore.byId().has(categoryId)) {
      this.store.setCategory(id, null);
    }
  }
}
