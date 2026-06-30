import { describe, it, expect } from 'vitest'
import { clamp, compactNumber, toBps, bpsToPct } from './num'

describe('clamp', () => {
  it('keeps values inside the range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(99, 0, 10)).toBe(10)
  })
})

describe('compactNumber', () => {
  it('abbreviates thousands and millions', () => {
    expect(compactNumber(500)).toBe('500')
    expect(compactNumber(12_500)).toBe('12.5K')
    expect(compactNumber(2_000_000)).toBe('2.0M')
  })
})

describe('toBps', () => {
  it('converts a fraction to basis points and clamps', () => {
    expect(toBps(0.25)).toBe(2500)
    expect(toBps(1.5)).toBe(10000)
    expect(toBps(-0.2)).toBe(0)
  })
})

describe('bpsToPct', () => {
  it('renders basis points as a percentage', () => {
    expect(bpsToPct(2500)).toBe('25.00%')
    expect(bpsToPct(50)).toBe('0.50%')
  })
})
