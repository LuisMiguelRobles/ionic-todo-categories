import { Injectable, inject } from '@angular/core';
import { ActionSheetController } from '@ionic/angular/action-sheet-controller';

import { CategoriesStore } from './data/categories.store';

interface PickerData {
  categoryId: string | null;
}

/** Muestra un action sheet nativo para elegir la categoría de una tarea. */
@Injectable({ providedIn: 'root' })
export class CategoryPickerService {
  private readonly actionSheetController = inject(ActionSheetController);
  private readonly store = inject(CategoriesStore);

  /** Resuelve con el id elegido, `null` para "Sin categoría" o `undefined` si se cancela. */
  async pick(currentId: string | null, header = 'Elegir categoría'): Promise<string | null | undefined> {
    // La opción actual se marca al final del texto (un ícono desalinearía la lista).
    const option = (text: string, categoryId: string | null) => {
      const selected = categoryId === currentId;
      return {
        text: selected ? `${text} ✓` : text,
        cssClass: selected ? 'action-sheet-selected' : undefined,
        data: { categoryId } satisfies PickerData,
      };
    };

    const sheet = await this.actionSheetController.create({
      header,
      buttons: [
        ...this.store.categories().map((category) => option(category.name, category.id)),
        option('Sin categoría', null),
        { text: 'Cancelar', role: 'cancel' },
      ],
    });
    await sheet.present();

    const { data, role } = await sheet.onDidDismiss<PickerData>();
    return role === 'cancel' || role === 'backdrop' || !data ? undefined : data.categoryId;
  }
}
