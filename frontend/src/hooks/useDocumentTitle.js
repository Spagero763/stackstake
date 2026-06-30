import { useEffect } from 'react'

// Set document.title while a component is mounted and restore it after.
export function useDocumentTitle(title, { restoreOnUnmount = false } = {}) {
  useEffect(() => {
    const previous = document.title
    if (title) document.title = title
    return () => {
      if (restoreOnUnmount) document.title = previous
    }
  }, [title, restoreOnUnmount])
}
