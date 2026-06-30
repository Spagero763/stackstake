import { describe, it, expect } from 'vitest'
import { totalRateBps, estApy, apyTable, BASE_RATE_BPS } from './apy'

describe('totalRateBps', () => {
  it('adds the bonus to the base rate', () => {
    expect(totalRateBps(0)).toBe(BASE_RATE_BPS)
    expect(totalRateBps(150)).toBe(200)
  })
})

describe('estApy', () => {
  it('estimates APY from the lock bonus', () => {
    expect(estApy(0)).toBeCloseTo(2.63)
    expect(estApy(300)).toBeCloseTo(18.41)
  })
})

describe('apyTable', () => {
  it('produces a row per lock preset', () => {
    const rows = apyTable()
    expect(rows.length).toBe(4)
    expect(rows[0].bonusBps).toBe(0)
    expect(rows[3].totalBps).toBe(350)
  })
})
