import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AlertController } from '@ionic/angular/alert-controller';
import { IonBackButton } from '@ionic/angular/ion-back-button';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonItem } from '@ionic/angular/ion-item';
import { IonItemOption } from '@ionic/angular/ion-item-option';
import { IonItemOptions } from '@ionic/angular/ion-item-options';
import { IonItemSliding } from '@ionic/angular/ion-item-sliding';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonList } from '@ionic/angular/ion-list';
import { IonNote } from '@ionic/angular/ion-note';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import { ModalController } from '@ionic/angular/modal-controller';
import { addIcons } from 'ionicons';
import { add, pricetagsOutline } from 'ionicons/icons';

import type { Category, CategoryDraft } from '../../../core/models/category.model';
import { TasksStore } from '../../tasks/data/tasks.store';
import type { CategoryFormRole } from '../components/category-form-modal/category-form-modal.component';
import { CategoryFormModalComponent } from '../components/category-form-modal/category-form-modal.component';
import { CategoriesStore } from '../data/categories.store';

@Component({
  selector: 'app-categories',
  templateUrl: 'categories.page.html',
  styleUrls: ['categories.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonTitle,
    IonContent,
    IonList,
    IonItemSliding,
    IonItem,
    IonLabel,
    IonNote,
    IonItemOptions,
    IonItemOption,
    IonIcon,
  ],
})
export class CategoriesPage {
  protected readonly store = inject(CategoriesStore);
  protected readonly tasksStore = inject(TasksStore);
  private readonly modalController = inject(ModalController);
  private readonly alertController = inject(AlertController);

  constructor() {
    addIcons({ add, pricetagsOutline });
    void this.store.load();
    void this.tasksStore.load();
  }

  protected taskCount(category: Category): number {
    return this.tasksStore.countByCategory().get(category.id) ?? 0;
  }

  protected async create(): Promise<void> {
    const { data, role } = await this.openForm(null);
    if (role === 'confirm' && data) {
      this.store.add(data);
    }
  }

  protected async edit(category: Category): Promise<void> {
    const { data, role } = await this.openForm(category);
    if (role === 'confirm' && data) {
      this.store.update(category.id, data);
    } else if (role === 'delete') {
      await this.confirmRemove(category);
    }
  }

  protected async confirmRemove(category: Category): Promise<void> {
    const count = this.taskCount(category);
    const alert = await this.alertController.create({
      header: `¿Eliminar "${category.name}"?`,
      message:
        count > 0
          ? `${count === 1 ? 'Su tarea quedará' : `Sus ${count} tareas quedarán`} sin categoría.`
          : 'Esta categoría no tiene tareas.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.store.remove(category.id) },
      ],
    });
    await alert.present();
  }

  private async openForm(category: Category | null) {
    const modal = await this.modalController.create({
      component: CategoryFormModalComponent,
      componentProps: { category },
    });
    await modal.present();
    return modal.onWillDismiss<CategoryDraft>() as Promise<{ data?: CategoryDraft; role?: CategoryFormRole }>;
  }
}
