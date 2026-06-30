import { describe, it, expect } from 'vitest'
import { fmt, fmtAddr, blocksToTime, estApyPct } from './format'

describe('fmt', () => {
  it('converts micro-STX to a human STX string', () => {
    expect(fmt(1_000_000)).toBe('1')
    expect(fmt(2_500_000)).toBe('2.5')
  })

  it('treats nullish input as zero', () => {
    expect(fmt(null)).toBe('0')
    expect(fmt(undefined)).toBe('0')
  })

  it('caps fractional digits at four', () => {
    expect(fmt(1_234_567)).toBe('1.2346')
  })
})

describe('fmtAddr', () => {
  it('shortens a Stacks address', () => {
    expect(fmtAddr('ST26TQH4FRPTKHQEYE6HZQG98R4CZE6PTJ8J1YYR8')).toBe('ST26TQ…YYR8')
  })

  it('returns an empty string for no address', () => {
    expect(fmtAddr(null)).toBe('')
  })
})

describe('blocksToTime', () => {
  it('reports unlocked for zero or fewer blocks', () => {
    expect(blocksToTime(0)).toBe('Unlocked')
    expect(blocksToTime(-5)).toBe('Unlocked')
  })

  it('formats minutes, hours and days', () => {
    expect(blocksToTime(3)).toBe('~30m')
    expect(blocksToTime(12)).toBe('~2h')
    expect(blocksToTime(200)).toBe('~1d')
  })
})

describe('estApyPct', () => {
  it('combines base and bonus basis points', () => {
    expect(estApyPct(50, 0)).toBeCloseTo(2.63)
    expect(estApyPct(50, 150)).toBeCloseTo(10.52)
  })
})
