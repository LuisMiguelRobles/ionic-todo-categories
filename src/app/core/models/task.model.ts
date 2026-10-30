export interface Task {
  id: string;
  title: string;
  completed: boolean;
  /** Epoch en milisegundos; se usa para ordenar y como desempate estable. */
  createdAt: number;
}
