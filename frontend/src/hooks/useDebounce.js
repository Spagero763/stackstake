import { useState, useEffect } from 'react'

// Return a debounced copy of a value that only updates after the value
// has stopped changing for `delay` milliseconds.
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
