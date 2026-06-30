// Helpers for building shareable links to a staking position.

// Build an absolute URL to a staker's position page.
export function buildPositionUrl(address, origin = '') {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}/position/${address}`
}

// Build a tweet intent URL that pre-fills a share message.
export function buildTweetUrl(text, url) {
  const params = new URLSearchParams({ text, url })
  return `https://twitter.com/intent/tweet?${params.toString()}`
}

// Compose the default share message for a position.
export function positionShareText(amountStx) {
  return `I'm staking ${amountStx} STX on StackStake. Come stack with me.`
}
