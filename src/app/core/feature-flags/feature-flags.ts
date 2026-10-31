/**
 * Parámetros de Remote Config que usa la app y su valor por defecto.
 * Los valores por defecto aplican sin red, sin configuración de Firebase o antes de la primera descarga.
 */
export const FEATURE_FLAG_DEFAULTS = {
  /** Muestra la tarjeta de progreso con estadísticas por categoría. */
  enable_task_stats: false,
} satisfies Record<string, boolean>;

export type FeatureFlagKey = keyof typeof FEATURE_FLAG_DEFAULTS;
export type FeatureFlags = Record<FeatureFlagKey, boolean>;

export const FEATURE_FLAG_KEYS = Object.keys(FEATURE_FLAG_DEFAULTS) as FeatureFlagKey[];
