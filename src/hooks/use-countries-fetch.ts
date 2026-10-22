/**
 * ENGINE 1 — Native `fetch` + `useEffect` + `useState`
 * -------------------------------------------------------------
 * Zero dependencies. The most fundamental way to fetch in React.
 * Demonstrates:
 *   - AbortController to cancel in-flight requests when component unmounts
 *   - isMounted flag to avoid setting state on an unmounted component
 *   - manual loading / error state
 *
 * Compared to the caching engines (SWR / React Query): every time this hook
 * mounts, it fires a fresh request. No caching, no dedup.
 */

import { useEffect, useState, useCallback } from 'react'
import { COUNTRIES_DATA_URL, type Country } from '@/lib/countries'

export interface FetchEngineResult {
  data: Country[] | undefined
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useCountriesFetch(enabled = true): FetchEngineResult {
  const [data, setData] = useState<Country[] | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    if (!enabled) {
      // disabled engine — bail without firing a request or changing state
      return
    }
    const controller = new AbortController()
    let isMounted = true

    // Setting loading=true at the start of a fetch effect is the canonical
    // pattern; the lint rule's "cascading renders" concern doesn't apply here
    // because these calls only run when the effect's deps actually changed.
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true)
    setError(null)
    /* eslint-enable react-hooks/set-state-in-effect */

    fetch(COUNTRIES_DATA_URL, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as Country[]
        if (!Array.isArray(json)) throw new Error('Unexpected payload')
        return json
      })
      .then((json) => {
        if (!isMounted) return
        // Sort by name.common for stable display
        json.sort((a, b) => a.name.common.localeCompare(b.name.common))
        setData(json)
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        if (isMounted) setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [tick, enabled])

  return { data, loading, error, refetch }
}
