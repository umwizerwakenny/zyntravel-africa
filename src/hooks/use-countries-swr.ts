/**
 * ENGINE 3 — SWR (stale-while-revalidate)
 * -------------------------------------------------------------
 * SWR is Vercel's tiny data-fetching library (https://swr.vercel.app).
 * Compared to manual useEffect + useState:
 *   - automatic dedup: 10 components using the same key share one request
 *   - revalidate on focus / on reconnect (configurable)
 *   - lightweight: ~4KB
 *   - keepPreviousData: not needed here since the key never changes
 *
 * Because our data source is a single static JSON file (one URL), the SWR
 * cache survives engine switches: switching away from SWR and back is
 * INSTANT because SWR still has the data in memory.
 */

import useSWR from 'swr'
import { COUNTRIES_DATA_URL, type Country } from '@/lib/countries'

const fetcher = async (url: string): Promise<Country[]> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = (await res.json()) as Country[]
  if (!Array.isArray(json)) throw new Error('Unexpected payload')
  json.sort((a, b) => a.name.common.localeCompare(b.name.common))
  return json
}

export function useCountriesSWR(enabled = true) {
  // Pass `null` as key when disabled — SWR treats a null key as "don't fetch".
  const key = enabled ? COUNTRIES_DATA_URL : null

  const { data, error, isLoading, mutate } = useSWR<Country[]>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
    errorRetryCount: 2,
  })

  return {
    data,
    loading: enabled ? isLoading : false,
    error: error ?? null,
    refetch: () => void mutate(),
  }
}
