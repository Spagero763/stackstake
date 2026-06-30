import { describe, it, expect } from 'vitest'
import { buildPositionUrl, buildTweetUrl, positionShareText } from './share'

describe('buildPositionUrl', () => {
  it('joins origin and address', () => {
    expect(buildPositionUrl('ST123', 'https://stackstake.app')).toBe(
      'https://stackstake.app/position/ST123',
    )
  })
})

describe('buildTweetUrl', () => {
  it('encodes the text and url into a tweet intent', () => {
    const url = buildTweetUrl('hello world', 'https://x.io/p/1')
    expect(url).toContain('https://twitter.com/intent/tweet?')
    expect(url).toContain('text=hello+world')
    expect(url).toContain('url=https%3A%2F%2Fx.io%2Fp%2F1')
  })
})

describe('positionShareText', () => {
  it('includes the staked amount', () => {
    expect(positionShareText(25)).toContain('25 STX')
  })
})
