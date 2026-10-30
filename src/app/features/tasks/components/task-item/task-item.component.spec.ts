import { TestBed } from '@angular/core/testing';

import type { Task } from '../../../../core/models/task.model';

import { TaskItemComponent } from './task-item.component';

describe('TaskItemComponent', () => {
  const task: Task = { id: '1', title: 'Leer documentación', completed: true, categoryId: null, createdAt: 0 };

  function render() {
    const fixture = TestBed.createComponent(TaskItemComponent);
    fixture.componentRef.setInput('task', task);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the title with the completed style', () => {
    const title: HTMLElement = render().nativeElement.querySelector('.title');
    expect(title.textContent).toContain('Leer documentación');
    expect(title.classList).toContain('completed');
  });

  it('emits deleteTask when the delete button is clicked', () => {
    const fixture = render();
    let emitted = 0;
    fixture.componentInstance.deleteTask.subscribe(() => emitted++);

    fixture.nativeElement.querySelector('ion-button[aria-label="Eliminar tarea"]').click();

    expect(emitted).toBe(1);
  });

  it('shows the category chip and emits changeCategory', () => {
    const fixture = TestBed.createComponent(TaskItemComponent);
    fixture.componentRef.setInput('task', task);
    fixture.componentRef.setInput('category', { id: 'w', name: 'Trabajo', color: '#8b5cf6', createdAt: 0 });
    fixture.detectChanges();
    let emitted = 0;
    fixture.componentInstance.changeCategory.subscribe(() => emitted++);

    const chip: HTMLButtonElement = fixture.nativeElement.querySelector('.category-chip');
    expect(chip.textContent).toContain('Trabajo');
    chip.click();

    expect(emitted).toBe(1);
  });

  it('hides the category chip when categories are disabled', () => {
    const fixture = TestBed.createComponent(TaskItemComponent);
    fixture.componentRef.setInput('task', task);
    fixture.componentRef.setInput('showCategory', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.category-chip')).toBeNull();
  });
});
