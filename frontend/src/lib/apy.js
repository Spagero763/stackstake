// APY helpers mirroring the contract's estimate-apy math.
import { LOCK_PRESETS } from '../config'

export const BASE_RATE_BPS = 50

// Total rate in basis points for a given lock bonus.
export const totalRateBps = (bonusBps) => BASE_RATE_BPS + Number(bonusBps ?? 0)

// Estimated APY as a percentage from a lock bonus in basis points.
export const estApy = (bonusBps) => (totalRateBps(bonusBps) * 526) / 10000

// Build a table of APY estimates for every lock preset.
export const apyTable = () =>
  LOCK_PRESETS.map((preset) => ({
    label: preset.label,
    days: preset.days,
    bonusBps: preset.bonusBps,
    totalBps: totalRateBps(preset.bonusBps),
    apyPct: estApy(preset.bonusBps),
  }))
