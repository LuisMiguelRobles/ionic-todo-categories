import { TestBed } from '@angular/core/testing';

import type { StatsRow } from './task-stats.component';
import { TaskStatsComponent } from './task-stats.component';

describe('TaskStatsComponent', () => {
  function render(total: number, completed: number, rows: StatsRow[] = []) {
    const fixture = TestBed.createComponent(TaskStatsComponent);
    fixture.componentRef.setInput('total', total);
    fixture.componentRef.setInput('completed', completed);
    fixture.componentRef.setInput('rows', rows);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the rounded completion percentage', () => {
    const element = render(3, 1);
    expect(element.querySelector('[data-testid="stats-percent"]')?.textContent).toContain('33% completado');
    expect(element.textContent).toContain('1 de 3 tareas');
  });

  it('handles zero tasks without dividing by zero', () => {
    expect(render(0, 0).querySelector('[data-testid="stats-percent"]')?.textContent).toContain('0% completado');
  });

  it('renders one row per category with its progress', () => {
    const element = render(4, 2, [
      { key: 'w', label: 'Trabajo', color: '#8b5cf6', total: 3, completed: 2 },
      { key: 'uncategorized', label: 'Sin categoría', color: null, total: 1, completed: 0 },
    ]);

    const rows = [...element.querySelectorAll('li')].map(
      (li) => `${li.querySelector('.label')?.textContent} ${li.querySelector('.count')?.textContent}`,
    );
    expect(rows).toEqual(['Trabajo 2/3', 'Sin categoría 0/1']);
    expect(parseFloat((element.querySelector('.bar span') as HTMLElement).style.width)).toBeCloseTo(66.67, 1);
  });
});
