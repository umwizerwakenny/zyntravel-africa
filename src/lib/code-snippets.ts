/**
 * Educational source snippets — the essence of each fetching pattern.
 * Shown in the UI's "Source" panel so the user can read the code while
 * clicking around with each engine. Trimmed for clarity; the real hooks in
 * /src/hooks have the full implementation (interceptors, sort, enabled flag,
 * cache config, etc.).
 */

import type { FetchEngine } from '@/hooks/use-countries'

export const CODE_SNIPPETS: Record<FetchEngine, string> = {
  fetch: `// Engine 1 — native fetch + useEffect + useState
// Zero dependencies. Note the AbortController: it cancels any
// in-flight request when the component unmounts.
//
// Trade-off: every time this hook mounts, it fires a fresh request.
// There is NO cache — switch engines back and forth and watch the
// network tab. This engine refetches every single time.

import { useEffect, useState } from 'react'

const URL =
  'https://raw.githubusercontent.com/mledoze/countries/master/countries.json'

export function useCountriesFetch() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    let isMounted = true

    setLoading(true)
    fetch(URL, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
        return res.json()        // ← manual JSON parse
      })
      .then((json) => isMounted && setData(json))
      .catch((err) => {
        if (err.name === 'AbortError') return
        if (isMounted) setError(err)
      })
      .finally(() => isMounted && setLoading(false))

    return () => {
      isMounted = false
      controller.abort()  // ← cancel on unmount / re-render
    }
  }, [])

  return { data, loading, error }
}`,

  axios: `// Engine 2 — Axios
// Auto JSON parse, interceptors, timeouts, consistent error shape.
// Same lifecycle pattern as Engine 1, but cleaner.
// Like fetch, Axios has NO cache — every mount fires a request.

import axios from 'axios'
import { useEffect, useState } from 'react'

const api = axios.create({ timeout: 15000 })

// Interceptor: normalize error messages centrally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    err.message = err.response?.status
      ? \`HTTP \${err.response.status}\`
      : err.message || 'Network error'
    return Promise.reject(err)
  },
)

export function useCountriesAxios() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    let isMounted = true

    setLoading(true)
    api
      .get(URL, { signal: controller.signal })
      .then((res) => isMounted && setData(res.data))   // ← no .json()
      .catch((err) => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false))

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  return { data, loading, error }
}`,

  swr: `// Engine 3 — SWR (stale-while-revalidate)
// Vercel's tiny (~4KB) data hook. Auto-dedupes concurrent requests
// with the same key, revalidates on focus/reconnect, caches everything.
//
// Because the URL never changes here, SWR's cache survives across engine
// switches: switch away and back → INSTANT (no request fires).

import useSWR from 'swr'

const fetcher = (url) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(\`HTTP \${r.status}\`)
      return r.json()
    })

export function useCountriesSWR() {
  // The URL itself is the cache key — same URL = same request, deduped
  const { data, error, isLoading, mutate } = useSWR(URL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,  // dedupe same-key calls within 1 min
    errorRetryCount: 2,
  })

  return {
    data,
    loading: isLoading,
    error,
    refetch: () => mutate(),   // ← manual refetch
  }
}`,

  'react-query': `// Engine 4 — TanStack Query (React Query v5)
// Production-grade. Structured cache keys, devtools, mutations,
// infinite queries, optimistic updates, prefetching, and more.
//
// Like SWR, the cache survives engine switches — once this query has
// fetched the URL, switching away and back is instant.

import { useQuery } from '@tanstack/react-query'

const fetcher = async () => {
  const res = await fetch(URL)
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
  return res.json()
}

export function useCountriesQuery() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['countries'],  // ← structured cache key
    queryFn: fetcher,
    staleTime: 5 * 60_000,     // 5 min — data is static, basically never stale
    retry: 2,
  })

  return { data, loading: isLoading, error, refetch }
}`,
}

export const CODE_FILENAMES: Record<FetchEngine, string> = {
  fetch: 'src/hooks/use-countries-fetch.ts',
  axios: 'src/hooks/use-countries-axios.ts',
  swr: 'src/hooks/use-countries-swr.ts',
  'react-query': 'src/hooks/use-countries-query.ts',
}
