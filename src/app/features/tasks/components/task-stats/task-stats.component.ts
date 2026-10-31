import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonProgressBar } from '@ionic/angular';

export interface StatsRow {
  key: string;
  label: string;
  /** `null` para "Sin categoría". */
  color: string | null;
  total: number;
  completed: number;
}

/** Tarjeta de progreso global y por categoría. Se muestra según el flag `enable_task_stats`. */
@Component({
  selector: 'app-task-stats',
  templateUrl: 'task-stats.component.html',
  styleUrls: ['task-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonProgressBar],
})
export class TaskStatsComponent {
  readonly total = input.required<number>();
  readonly completed = input.required<number>();
  readonly rows = input<readonly StatsRow[]>([]);

  protected readonly ratio = computed(() => (this.total() === 0 ? 0 : this.completed() / this.total()));
  protected readonly percent = computed(() => Math.round(this.ratio() * 100));
}
