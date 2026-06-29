// Helpers for reading Clarity tuple fields returned by the contract.
// Read-only responses sometimes arrive already unwrapped and sometimes as
// { value } wrappers, so these normalize access in one place.

// Read a field that may be wrapped as { value } or a plain value.
export const field = (obj, key, fallback = 0) => {
  if (!obj) return fallback
  const raw = obj[key]
  if (raw && typeof raw === 'object' && 'value' in raw) return raw.value
  return raw ?? fallback
}

export const numField = (obj, key) => Number(field(obj, key, 0))

export const isUnlocked = (s) => {
  const v = s?.['is-unlocked']
  return v?.value === true || v === true
}

export const blocksRemaining = (s) => numField(s, 'blocks-remaining')
