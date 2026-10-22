/**
 * Shared types + data source constants.
 *
 * Data source: the `mledoze/countries` dataset on GitHub
 *   https://github.com/mledoze/countries/blob/master/countries.json
 *
 * It's a single 1.4 MB static JSON file containing 250 countries with rich
 * metadata. CORS-enabled, no API key, no rate limit. The original REST
 * Countries API was a wrapper around this exact data — but REST Countries v3
 * was deprecated in 2026 and v5 now requires an API key, so we use the
 * source file directly.
 *
 * Flags come from flagcdn.com (also CORS-enabled, free, by ISO 3166-1 alpha-2
 * code): https://flagcdn.com/{cca2_lowercased}.svg
 *
 * Because the URL is always the same (a static JSON file), the four engines
 * all hit one URL. The difference in caching behaviour becomes VERY visible:
 *   - fetch engine    → always re-fetches on mount / engine switch
 *   - axios engine    → always re-fetches on mount / engine switch
 *   - swr engine      → caches the URL, second hit is instant
 *   - react-query engine → caches the URL, second hit is instant
 *
 * Region filtering + name search happen client-side after the data is loaded
 * — which is the standard pattern for small (<5MB) reference datasets.
 */

export const COUNTRIES_DATA_URL =
  'https://raw.githubusercontent.com/mledoze/countries/master/countries.json'

export const FLAG_CDN_BASE = 'https://flagcdn.com'

/** Region filter options shown in the UI. */
export const REGIONS = ['All', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'] as const
export type Region = (typeof REGIONS)[number]

/** Country entity — matches the mledoze/countries JSON schema (subset). */
export interface Country {
  name: {
    common: string
    official: string
    native?: Record<string, { common: string; official: string }>
  }
  cca2: string
  ccn3?: string
  cca3: string
  independent?: boolean
  status?: string
  unMember?: boolean
  currencies?: Record<string, { name: string; symbol: string }>
  capital?: string[]
  altSpellings?: string[]
  region: string
  subregion?: string
  languages?: Record<string, string>
  latlng?: [number, number]
  landlocked?: boolean
  borders?: string[]
  area?: number
  flag?: string // emoji 🇷🇼
  demonyms?: Record<string, { f: string; m: string }>
  tld?: string[]
  idd?: { root: string; suffixes?: string[] }
}

/** Common return shape for every fetching engine. */
export interface FetchResult<T> {
  data: T | undefined
  loading: boolean
  error: Error | null
  refetch: () => void
}

/** Build a flag image URL from an ISO 3166-1 alpha-2 country code. */
export function flagUrl(cca2: string): string {
  return `${FLAG_CDN_BASE}/${cca2.toLowerCase()}.svg`
}

/** Format an area number into "1.4M km²" / "44K km²" / "12.3K km²" style. */
export function formatArea(km2?: number): string {
  if (!km2) return '—'
  if (km2 >= 1_000_000) return `${(km2 / 1_000_000).toFixed(2)}M km²`
  if (km2 >= 1_000) return `${(km2 / 1_000).toFixed(1)}K km²`
  return `${km2} km²`
}

/** Convert an object like { eng: 'English', fra: 'French' } to 'English, French'. */
export function languagesToList(langs?: Record<string, string>): string {
  if (!langs) return '—'
  return Object.values(langs).join(', ') || '—'
}

/** Convert currencies object to a readable string. */
export function currenciesToString(c?: Record<string, { name: string; symbol: string }>): string {
  if (!c) return '—'
  return Object.values(c)
    .map((x) => `${x.name} (${x.symbol})`)
    .join(', ')
}
