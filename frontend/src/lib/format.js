// Formatting helpers shared across the UI.
import { USTX, BLOCK_MINUTES } from '../config'

// Convert micro-STX to a human STX string.
export const fmt = (u) =>
  (Number(u ?? 0) / USTX).toLocaleString('en-US', { maximumFractionDigits: 4 })

// Shorten a Stacks address for display.
export const fmtAddr = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '')

// Turn a block count into a rough human duration.
export const blocksToTime = (b) => {
  const n = Number(b ?? 0)
  if (n <= 0) return 'Unlocked'
  const m = n * BLOCK_MINUTES
  if (m < 60) return `~${m}m`
  if (m < 1440) return `~${Math.round(m / 60)}h`
  return `~${Math.round(m / 1440)}d`
}

// Rough APY estimate from base + lock bonus, in basis points.
export const estApyPct = (baseBps, bonusBps) =>
  ((baseBps + bonusBps) * 526) / 10000
