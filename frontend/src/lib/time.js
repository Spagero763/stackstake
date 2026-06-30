// Time and block helpers.
import { BLOCK_MINUTES } from '../config'

// A compact "time ago" string from a Date or timestamp.
export function timeAgo(from, now = Date.now()) {
  const then = from instanceof Date ? from.getTime() : Number(from)
  const seconds = Math.max(0, Math.floor((now - then) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// Estimate how many days a block count represents.
export const blocksToDays = (blocks) =>
  Math.round((Number(blocks ?? 0) * BLOCK_MINUTES) / 1440)

// Pluralize a unit based on a count.
export const pluralize = (count, unit) =>
  `${count} ${unit}${count === 1 ? '' : 's'}`
