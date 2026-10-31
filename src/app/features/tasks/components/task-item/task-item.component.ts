import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonButton } from '@ionic/angular/ion-button';
import { IonCheckbox } from '@ionic/angular/ion-checkbox';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonItem } from '@ionic/angular/ion-item';
import { IonItemOption } from '@ionic/angular/ion-item-option';
import { IonItemOptions } from '@ionic/angular/ion-item-options';
import { IonItemSliding } from '@ionic/angular/ion-item-sliding';
import { addIcons } from 'ionicons';
import { pricetagOutline, trashOutline } from 'ionicons/icons';

import type { Category } from '../../../../core/models/category.model';
import type { Task } from '../../../../core/models/task.model';

/** Alto fijo de cada fila en px; la lista virtual lo necesita para calcular qué filas mostrar. */
export const TASK_ITEM_HEIGHT = 56;

@Component({
  selector: 'app-task-item',
  templateUrl: 'task-item.component.html',
  styleUrls: ['task-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonItemSliding, IonItem, IonCheckbox, IonButton, IonIcon, IonItemOptions, IonItemOption],
})
export class TaskItemComponent {
  readonly task = input.required<Task>();
  /** Categoría resuelta de la tarea, o `null` si no tiene. */
  readonly category = input<Category | null>(null);
  /** Oculta el selector de categoría cuando no existe ninguna categoría. */
  readonly showCategory = input(true);

  readonly toggleCompleted = output<void>();
  readonly deleteTask = output<void>();
  readonly changeCategory = output<void>();

  constructor() {
    addIcons({ pricetagOutline, trashOutline });
  }
}
