import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonList,
  IonNote,
  IonSkeletonText,
  IonItem,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, checkmarkDoneCircleOutline } from 'ionicons/icons';

import type { Task } from '../../../core/models/task.model';
import { TaskItemComponent } from '../components/task-item/task-item.component';
import { TasksStore } from '../data/tasks.store';

@Component({
  selector: 'app-tasks',
  templateUrl: 'tasks.page.html',
  styleUrls: ['tasks.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonSkeletonText,
    IonNote,
    IonIcon,
    IonFooter,
    IonInput,
    IonButton,
    TaskItemComponent,
  ],
})
export class TasksPage {
  protected readonly store = inject(TasksStore);
  private readonly toastController = inject(ToastController);

  protected readonly newTitle = signal('');
  protected readonly skeletonRows = [1, 2, 3, 4, 5];

  constructor() {
    addIcons({ add, checkmarkDoneCircleOutline });
    void this.store.load();
  }

  protected onTitleInput(value: string | null | undefined): void {
    this.newTitle.set(value ?? '');
  }

  protected addTask(): void {
    if (this.store.add(this.newTitle())) {
      this.newTitle.set('');
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
      buttons: [{ text: 'Deshacer', handler: () => this.store.restore(removed) }],
    });
    await toast.present();
  }
}
