/**
 * useDebouncedValue — returns the latest value after `delay` ms of inactivity.
 * Used to avoid firing a request on every keystroke in the search box.
 */
import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
