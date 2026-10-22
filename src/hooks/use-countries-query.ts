/**
 * ENGINE 4 — TanStack Query (React Query v5)
 * -------------------------------------------------------------
 * The recommended production-grade solution.
 * Benefits over SWR / fetch+hook:
 *   - query keys give us a structured cache (`['countries']`)
 *   - per-key `staleTime`, `gcTime`, `retry`
 *   - powerful mutations API (not used here, but available)
 *   - DevTools, prefetching, infinite queries, optimistic updates
 *
 * Like SWR, the cache survives engine switches — once TanStack Query has
 * fetched this URL, switching away and back is instant.
 */

import { useQuery } from '@tanstack/react-query'
import { COUNTRIES_DATA_URL, type Country } from '@/lib/countries'

const fetcher = async (): Promise<Country[]> => {
  const res = await fetch(COUNTRIES_DATA_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = (await res.json()) as Country[]
  if (!Array.isArray(json)) throw new Error('Unexpected payload')
  json.sort((a, b) => a.name.common.localeCompare(b.name.common))
  return json
}

export function useCountriesQuery(enabled = true) {
  const query = useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: fetcher,
    enabled, // ← TanStack Query's built-in switch
    staleTime: 5 * 60_000, // 5 min — data is static so it's never stale in practice
    gcTime: 10 * 60_000,
    retry: 2,
  })

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error,
    refetch: () => void query.refetch(),
  }
}
