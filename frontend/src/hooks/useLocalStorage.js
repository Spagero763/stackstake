import { useState, useCallback } from 'react'

// Persist a piece of state in localStorage, with a graceful fallback
// when storage is unavailable (private mode, SSR).
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next
        try {
          localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          // ignore write failures
        }
        return resolved
      })
    },
    [key],
  )

  return [value, set]
}
