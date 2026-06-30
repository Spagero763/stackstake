import { describe, it, expect } from 'vitest'
import { timeAgo, blocksToDays, pluralize } from './time'

describe('timeAgo', () => {
  const now = 1_000_000_000_000

  it('reports just now for recent times', () => {
    expect(timeAgo(now - 5_000, now)).toBe('just now')
  })

  it('reports minutes, hours and days', () => {
    expect(timeAgo(now - 5 * 60_000, now)).toBe('5m ago')
    expect(timeAgo(now - 3 * 3_600_000, now)).toBe('3h ago')
    expect(timeAgo(now - 2 * 86_400_000, now)).toBe('2d ago')
  })
})

describe('blocksToDays', () => {
  it('estimates days from a block count', () => {
    expect(blocksToDays(144)).toBe(1)
    expect(blocksToDays(1008)).toBe(7)
  })
})

describe('pluralize', () => {
  it('adds an s only when needed', () => {
    expect(pluralize(1, 'block')).toBe('1 block')
    expect(pluralize(3, 'block')).toBe('3 blocks')
  })
})
