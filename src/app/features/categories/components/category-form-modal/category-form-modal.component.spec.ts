import { TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/modal-controller';

import { FakeStorageService } from '../../../../../testing/fake-storage.service';
import type { Category } from '../../../../core/models/category.model';
import { StorageService } from '../../../../core/storage/storage.service';
import { CategoriesStore } from '../../data/categories.store';

import { CategoryFormModalComponent } from './category-form-modal.component';

describe('CategoryFormModalComponent', () => {
  let dismiss: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    dismiss = vi.fn().mockResolvedValue(true);
    TestBed.configureTestingModule({
      imports: [CategoryFormModalComponent],
      providers: [
        { provide: StorageService, useClass: FakeStorageService },
        { provide: ModalController, useValue: { dismiss } },
      ],
    });
    await TestBed.inject(CategoriesStore).load();
  });

  function render(category: Category | null = null) {
    const fixture = TestBed.createComponent(CategoryFormModalComponent);
    fixture.componentRef.setInput('category', category);
    fixture.detectChanges();
    return fixture;
  }

  function clickSave(element: HTMLElement): void {
    const save = [...element.querySelectorAll('ion-button')].find((button) => button.textContent?.includes('Guardar'));
    (save as HTMLElement).click();
  }

  it('does not dismiss and shows an error when the name is empty', () => {
    const fixture = render();

    clickSave(fixture.nativeElement);
    fixture.detectChanges();

    expect(dismiss).not.toHaveBeenCalled();
    const input = fixture.nativeElement.querySelector('ion-input');
    expect(input.errorText).toBe('Escribe un nombre.');
    expect(input.classList).toContain('ion-invalid');
  });

  it('prefills the form when editing and dismisses with the edited draft', () => {
    const work = TestBed.inject(CategoriesStore).categories()[1];
    const fixture = render(work);
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('ion-title')?.textContent).toContain('Editar categoría');
    (element.querySelector('button[aria-label="Rojo"]') as HTMLButtonElement).click();
    clickSave(element);

    expect(dismiss).toHaveBeenCalledWith({ name: 'Trabajo', color: '#ef4444' }, 'confirm');
  });

  it('only offers deletion when editing', () => {
    expect(render().nativeElement.textContent).not.toContain('Eliminar categoría');

    const work = TestBed.inject(CategoriesStore).categories()[1];
    const fixture = render(work);
    const remove = [...fixture.nativeElement.querySelectorAll('ion-button')].find((button: HTMLElement) =>
      button.textContent?.includes('Eliminar categoría'),
    ) as HTMLElement;
    remove.click();

    expect(dismiss).toHaveBeenCalledWith(null, 'delete');
  });
});
