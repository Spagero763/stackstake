import { describe, it, expect } from 'vitest'
import { validateStakeAmount } from './validate'

describe('validateStakeAmount', () => {
  it('rejects empty input', () => {
    expect(validateStakeAmount('').valid).toBe(false)
    expect(validateStakeAmount(null).valid).toBe(false)
  })

  it('rejects non-numbers and non-positive amounts', () => {
    expect(validateStakeAmount('abc').valid).toBe(false)
    expect(validateStakeAmount('0').valid).toBe(false)
    expect(validateStakeAmount('-5').valid).toBe(false)
  })

  it('enforces the minimum stake', () => {
    const r = validateStakeAmount('0.5')
    expect(r.valid).toBe(false)
    expect(r.error).toMatch(/Minimum/)
  })

  it('rejects amounts above the balance', () => {
    const r = validateStakeAmount('10', 5_000_000) // balance is 5 STX
    expect(r.valid).toBe(false)
    expect(r.error).toBe('Insufficient balance')
  })

  it('accepts a valid amount within balance', () => {
    expect(validateStakeAmount('3', 5_000_000).valid).toBe(true)
    expect(validateStakeAmount('1').valid).toBe(true)
  })
})
