export interface Category {
  id: string;
  name: string;
  /** Color hexadecimal tomado de `CATEGORY_COLORS`. */
  color: string;
  createdAt: number;
}

/** Datos editables de una categoría (formulario de creación/edición). */
export type CategoryDraft = Pick<Category, 'name' | 'color'>;
