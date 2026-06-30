import { useEffect, useRef } from 'react'

// Run a callback on a fixed interval. Passing a null delay pauses it.
// The latest callback is always used without resetting the timer.
export function useInterval(callback, delay) {
  const saved = useRef(callback)

  useEffect(() => {
    saved.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null || delay === undefined) return
    const id = setInterval(() => saved.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}
