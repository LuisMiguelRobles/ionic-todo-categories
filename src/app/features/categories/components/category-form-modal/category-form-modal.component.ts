import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonInput } from '@ionic/angular/ion-input';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import { ModalController } from '@ionic/angular/modal-controller';
import { addIcons } from 'ionicons';
import { checkmark, close, trashOutline } from 'ionicons/icons';

import type { Category, CategoryDraft } from '../../../../core/models/category.model';
import type { CategoryValidationError } from '../../data/categories.store';
import { CATEGORY_NAME_MAX_LENGTH, CategoriesStore } from '../../data/categories.store';
import { CATEGORY_COLORS } from '../../data/category-colors';

/** Roles con los que se cierra el modal. */
export type CategoryFormRole = 'confirm' | 'delete' | 'cancel';

const ERROR_MESSAGES: Record<CategoryValidationError, string> = {
  empty: 'Escribe un nombre.',
  tooLong: `Máximo ${CATEGORY_NAME_MAX_LENGTH} caracteres.`,
  duplicate: 'Ya existe una categoría con ese nombre.',
};

/**
 * Formulario de creación/edición. Solo recoge datos: quien lo abre decide qué hacer
 * con el resultado (`confirm` con un `CategoryDraft`, o `delete`).
 */
@Component({
  selector: 'app-category-form-modal',
  templateUrl: 'category-form-modal.component.html',
  styleUrls: ['category-form-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonContent, IonInput, IonIcon],
})
export class CategoryFormModalComponent {
  /** Categoría a editar; `null` para crear una nueva. */
  readonly category = input<Category | null>(null);

  private readonly modalController = inject(ModalController);
  private readonly store = inject(CategoriesStore);

  protected readonly colors = CATEGORY_COLORS;
  protected readonly maxLength = CATEGORY_NAME_MAX_LENGTH;

  protected readonly name = linkedSignal(() => this.category()?.name ?? '');
  protected readonly color = linkedSignal(() => this.category()?.color ?? CATEGORY_COLORS[0].value);
  protected readonly touched = signal(false);

  protected readonly error = computed(() =>
    this.store.validate({ name: this.name(), color: this.color() }, this.category()?.id),
  );
  protected readonly errorMessage = computed(() => {
    const error = this.error();
    return this.touched() && error ? ERROR_MESSAGES[error] : '';
  });

  constructor() {
    addIcons({ checkmark, close, trashOutline });
  }

  protected onNameInput(value: string | null | undefined): void {
    this.name.set(value ?? '');
  }

  protected cancel(): Promise<boolean> {
    return this.modalController.dismiss(null, 'cancel' satisfies CategoryFormRole);
  }

  protected delete(): Promise<boolean> {
    return this.modalController.dismiss(null, 'delete' satisfies CategoryFormRole);
  }

  protected save(): void {
    this.touched.set(true);
    if (this.error()) {
      return;
    }
    const draft: CategoryDraft = { name: this.name().trim(), color: this.color() };
    void this.modalController.dismiss(draft, 'confirm' satisfies CategoryFormRole);
  }
}
