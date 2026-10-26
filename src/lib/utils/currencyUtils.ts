// =============================================================================
// currencyUtils.ts — Currency & Monetary Conversion Utilities (PHP Centavos / Pesos)
// =============================================================================

/**
 * Converts Philippine Pesos (float/decimal) to integer centavos.
 * Avoids floating point inaccuracies using Math.round.
 * Example: 25000.50 PHP -> 2500050 centavos
 */
export function pesosToCentavos(pesos: number): number {
  if (isNaN(pesos) || !isFinite(pesos)) return 0;
  return Math.round(pesos * 100);
}

/**
 * Converts integer centavos to Philippine Pesos (float/decimal).
 * Example: 2500050 centavos -> 25000.50 PHP
 */
export function centavosToPesos(centavos: number): number {
  if (isNaN(centavos) || !isFinite(centavos)) return 0;
  return centavos / 100;
}

/**
 * Formats integer centavos as a standard Philippine Peso string with currency symbol.
 * Example: 1500000 -> "₱15,000.00"
 */
export function formatPesos(centavos: number | null | undefined, fallback = '—'): string {
  if (centavos === null || centavos === undefined || isNaN(centavos)) {
    return fallback;
  }
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(centavos / 100);
}

/**
 * Formats integer centavos as a compact number representation (e.g. for dashboard metric cards).
 * Example: 150000000 -> "₱1.5M", 5000000 -> "₱50K"
 */
export function formatPesosCompact(centavos: number | null | undefined, fallback = '—'): string {
  if (centavos === null || centavos === undefined || isNaN(centavos)) {
    return fallback;
  }
  const pesos = centavos / 100;
  if (pesos >= 1_000_000) {
    return `₱${(pesos / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (pesos >= 1_000) {
    return `₱${(pesos / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return formatPesos(centavos);
}
