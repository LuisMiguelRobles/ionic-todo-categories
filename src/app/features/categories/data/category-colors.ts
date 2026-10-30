export interface CategoryColor {
  value: string;
  /** Nombre accesible para lectores de pantalla. */
  label: string;
}

/** Paleta cerrada: colores con contraste suficiente sobre fondo claro y oscuro. */
export const CATEGORY_COLORS: readonly CategoryColor[] = [
  { value: '#3b82f6', label: 'Azul' },
  { value: '#8b5cf6', label: 'Violeta' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#ef4444', label: 'Rojo' },
  { value: '#f59e0b', label: 'Ámbar' },
  { value: '#10b981', label: 'Verde' },
  { value: '#14b8a6', label: 'Turquesa' },
  { value: '#6b7280', label: 'Gris' },
];
