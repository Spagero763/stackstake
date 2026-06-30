import { describe, it, expect } from 'vitest'
import { field, numField, isUnlocked, blocksRemaining } from './fields'

describe('field', () => {
  it('reads a plain value', () => {
    expect(field({ amount: 5 }, 'amount')).toBe(5)
  })

  it('unwraps a { value } wrapper', () => {
    expect(field({ amount: { value: 9 } }, 'amount')).toBe(9)
  })

  it('falls back when the key is missing', () => {
    expect(field({}, 'amount', 7)).toBe(7)
    expect(field(null, 'amount', 3)).toBe(3)
  })
})

describe('numField', () => {
  it('coerces the field to a number', () => {
    expect(numField({ n: { value: '42' } }, 'n')).toBe(42)
    expect(numField({}, 'n')).toBe(0)
  })
})

describe('isUnlocked', () => {
  it('handles wrapped and plain booleans', () => {
    expect(isUnlocked({ 'is-unlocked': { value: true } })).toBe(true)
    expect(isUnlocked({ 'is-unlocked': true })).toBe(true)
    expect(isUnlocked({ 'is-unlocked': false })).toBe(false)
    expect(isUnlocked(null)).toBe(false)
  })
})

describe('blocksRemaining', () => {
  it('reads the blocks-remaining field as a number', () => {
    expect(blocksRemaining({ 'blocks-remaining': { value: '12' } })).toBe(12)
    expect(blocksRemaining({})).toBe(0)
  })
})
