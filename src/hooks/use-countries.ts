/**
 * Unified hook: returns whichever engine the user has selected from the UI.
 * -----------------------------------------------------------------------
 * All 4 engines (fetch / axios / SWR / TanStack Query) return the SAME shape:
 *   { data, loading, error, refetch }
 * So the rest of the UI doesn't care which one is active.
 *
 * The signature is just `(engine, enabled)` because our data source is a
 * single static JSON file — search + region filtering happen client-side
 * after the data is loaded.
 *
 * Calling the unused engines would still cause them to run their effects, so
 * we use a conditional approach: only the active engine has `enabled=true`.
 */

import type { Country } from '@/lib/countries'
import { useCountriesFetch } from './use-countries-fetch'
import { useCountriesAxios } from './use-countries-axios'
import { useCountriesSWR } from './use-countries-swr'
import { useCountriesQuery } from './use-countries-query'

export type FetchEngine = 'fetch' | 'axios' | 'swr' | 'react-query'

export const ENGINE_LABELS: Record<
  FetchEngine,
  { label: string; tagline: string; color: string }
> = {
  fetch: {
    label: 'Native fetch',
    tagline: 'Built into the browser · useEffect + useState',
    color: 'bg-emerald-500',
  },
  axios: {
    label: 'Axios',
    tagline: 'Auto JSON parse · interceptors · timeouts',
    color: 'bg-purple-500',
  },
  swr: {
    label: 'SWR',
    tagline: 'Vercel · stale-while-revalidate · 4 KB',
    color: 'bg-rose-500',
  },
  'react-query': {
    label: 'TanStack Query',
    tagline: 'Production-grade · cache · mutations · devtools',
    color: 'bg-orange-500',
  },
}

export interface CountriesResult {
  data: Country[] | undefined
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useCountries(engine: FetchEngine): CountriesResult {
  // All four hooks are called unconditionally (Rules of Hooks), but only the
  // one matching `engine` actually fires a request — the others receive
  // `enabled=false` and short-circuit.
  const fetchEngine = useCountriesFetch(engine === 'fetch')
  const axiosEngine = useCountriesAxios(engine === 'axios')
  const swrEngine = useCountriesSWR(engine === 'swr')
  const queryEngine = useCountriesQuery(engine === 'react-query')

  switch (engine) {
    case 'fetch':
      return fetchEngine
    case 'axios':
      return axiosEngine
    case 'swr':
      return swrEngine
    case 'react-query':
      return queryEngine
  }
}
