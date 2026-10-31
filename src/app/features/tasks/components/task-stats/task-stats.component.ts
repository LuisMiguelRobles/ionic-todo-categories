import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IonCard } from '@ionic/angular/ion-card';
import { IonCardContent } from '@ionic/angular/ion-card-content';
import { IonCardHeader } from '@ionic/angular/ion-card-header';
import { IonCardSubtitle } from '@ionic/angular/ion-card-subtitle';
import { IonCardTitle } from '@ionic/angular/ion-card-title';
import { IonProgressBar } from '@ionic/angular/ion-progress-bar';

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
