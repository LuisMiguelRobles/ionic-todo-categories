import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  IonButton,
  IonCheckbox,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';

import type { Task } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-item',
  templateUrl: 'task-item.component.html',
  styleUrls: ['task-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonItemSliding, IonItem, IonCheckbox, IonButton, IonIcon, IonItemOptions, IonItemOption],
})
export class TaskItemComponent {
  readonly task = input.required<Task>();
  readonly toggleCompleted = output<void>();
  readonly deleteTask = output<void>();

  constructor() {
    addIcons({ trashOutline });
  }
}
