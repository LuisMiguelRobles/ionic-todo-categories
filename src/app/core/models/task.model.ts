export interface Task {
  id: string;
  title: string;
  completed: boolean;
  /** `null` cuando la tarea no tiene categoría. */
  categoryId: string | null;
  /** Epoch en milisegundos; se usa para ordenar y como desempate estable. */
  createdAt: number;
}
