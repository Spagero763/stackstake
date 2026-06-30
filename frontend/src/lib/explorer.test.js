import { describe, it, expect } from 'vitest'
import { txUrl, addrUrl, shortTx } from './explorer'

describe('txUrl', () => {
  it('points at the explorer txid path', () => {
    expect(txUrl('0xabc')).toContain('/txid/0xabc')
  })
})

describe('addrUrl', () => {
  it('points at the explorer address path', () => {
    expect(addrUrl('ST123')).toContain('/address/ST123')
  })
})

describe('shortTx', () => {
  it('shortens a transaction id', () => {
    expect(shortTx('0x1234567890abcdef')).toBe('0x1234…cdef')
    expect(shortTx('')).toBe('')
  })
})
