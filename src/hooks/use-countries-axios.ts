/**
 * ENGINE 2 — Axios + `useEffect` + `useState`
 * -------------------------------------------------------------
 * Axios gives us:
 *   - automatic JSON parsing (no `.json()` step)
 *   - consistent error object shape (`error.response.status`)
 *   - easier timeout configuration
 *   - interceptors (defined inline here, real apps would put them in lib)
 *   - AbortController support
 *
 * Compared to engine 1: ~3 fewer lines per request because of auto JSON parse
 * and axios's ergonomic `error.response` shape. Still no caching.
 */

import { useEffect, useState, useCallback } from 'react'
import axios, { type AxiosError } from 'axios'
import { COUNTRIES_DATA_URL, type Country } from '@/lib/countries'

const axiosInstance = axios.create({
  timeout: 15_000,
})

axiosInstance.interceptors.request.use((cfg) => {
  // In a real app you'd attach auth tokens here
  // cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

axiosInstance.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    // Centralised error shaping
    const status = err.response?.status
    err.message =
      status === 404
        ? 'No countries found'
        : status
          ? `Request failed with HTTP ${status}`
          : err.message || 'Network error'
    return Promise.reject(err)
  },
)

export function useCountriesAxios(enabled = true) {
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

    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true)
    setError(null)
    /* eslint-enable react-hooks/set-state-in-effect */

    axiosInstance
      .get<Country[]>(COUNTRIES_DATA_URL, { signal: controller.signal })
      .then((res) => {
        if (!isMounted) return
        const list = Array.isArray(res.data) ? res.data : []
        list.sort((a, b) => a.name.common.localeCompare(b.name.common))
        setData(list)
      })
      .catch((err: unknown) => {
        if (axios.isCancel?.(err) || err instanceof DOMException) return
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
