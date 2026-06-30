// Small numeric helpers used across the UI.

// Constrain a number to an inclusive range.
export const clamp = (n, min, max) => Math.min(Math.max(n, min), max)

// Format a large number compactly, e.g. 12_500 -> "12.5K".
export function compactNumber(value) {
  const n = Number(value ?? 0)
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return `${n}`
}

// Convert a fraction (0..1) to basis points (0..10000).
export const toBps = (fraction) => Math.round(clamp(fraction, 0, 1) * 10000)

// Render basis points as a percentage string.
export const bpsToPct = (bps) => `${(Number(bps ?? 0) / 100).toFixed(2)}%`
