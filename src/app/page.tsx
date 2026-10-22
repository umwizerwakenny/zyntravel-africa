'use client'

import { useState, useMemo } from 'react'
import { Globe2, Github, AlertCircle, RotateCw, Code2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { ThemeToggle } from '@/components/theme-toggle'
import { SearchBar } from '@/components/country-explorer/search-bar'
import { RegionFilter } from '@/components/country-explorer/region-filter'
import { CountryCard } from '@/components/country-explorer/country-card'
import { CountryDetailDialog } from '@/components/country-explorer/country-detail-dialog'
import { CountryGridSkeleton } from '@/components/country-explorer/country-grid-skeleton'
import { MethodSelector } from '@/components/country-explorer/method-selector'
import { CodeBlock } from '@/components/country-explorer/code-block'

import { useCountries, ENGINE_LABELS, type FetchEngine } from '@/hooks/use-countries'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { REGIONS, type Region, type Country } from '@/lib/countries'
import { CODE_SNIPPETS, CODE_FILENAMES } from '@/lib/code-snippets'

const PAGE_SIZE = 24

export default function Home() {
  // ─── UI state ──────────────────────────────────────────────────────
  const [engine, setEngine] = useState<FetchEngine>('react-query')
  const [region, setRegion] = useState<Region>('All')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 250)

  // Pagination: we slice the (possibly cached) result list client-side
  const [page, setPage] = useState(1)
  // Reset page when filters change — uses the "adjust state during render"
  // pattern recommended by React docs (https://react.dev/reference/react/useState#storing-information-from-previous-renders)
  const filtersKey = `${engine}|${region}|${debouncedSearch}`
  const [lastFiltersKey, setLastFiltersKey] = useState(filtersKey)
  if (filtersKey !== lastFiltersKey) {
    setLastFiltersKey(filtersKey)
    setPage(1)
  }

  // Selected country for detail dialog
  const [selected, setSelected] = useState<Country | null>(null)

  // Mobile sheet for source code
  const [codeOpen, setCodeOpen] = useState(false)

  // ─── Data: single fetch via the selected engine ─────────────────────
  const { data, loading, error, refetch } = useCountries(engine)

  // Client-side filtering (region + name search). Since we have all 250
  // countries in memory, this is instant — no extra network request.
  const filtered = useMemo(() => {
    if (!data) return []
    const q = debouncedSearch.trim().toLowerCase()
    return data.filter((c) => {
      if (region !== 'All' && c.region !== region) return false
      if (!q) return true
      // match against common + official + alt spellings + ISO codes
      const haystack = [
        c.name.common,
        c.name.official,
        ...(c.altSpellings ?? []),
        c.cca2,
        c.cca3,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [data, debouncedSearch, region])

  const visible = useMemo(
    () => filtered.slice(0, page * PAGE_SIZE),
    [filtered, page],
  )

  const total = filtered.length
  const hasMore = visible.length < total

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shrink-0">
              <Globe2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm sm:text-base leading-tight truncate">
                Country Explorer
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight truncate">
                React API fetching lab · {ENGINE_LABELS[engine].label}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              className="sm:hidden"
              onClick={() => setCodeOpen(true)}
            >
              <Code2 className="h-4 w-4" />
            </Button>
            <a
              href="https://github.com/mledoze/countries"
              target="_blank"
              rel="noreferrer noopener"
              className="hidden sm:inline-flex"
            >
              <Button variant="outline" size="sm" className="gap-1.5">
                <Github className="h-4 w-4" /> Data source
              </Button>
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <main className="flex-1 container mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Intro */}
        <section className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Explore every country on Earth
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Data from the{' '}
            <a
              className="underline"
              href="https://github.com/mledoze/countries"
              target="_blank"
              rel="noreferrer noopener"
            >
              mledoze/countries
            </a>{' '}
            dataset (250 countries, single static JSON). Switch the data-fetching
            engine below to see how <strong>native fetch</strong>,{' '}
            <strong>Axios</strong>, <strong>SWR</strong> and{' '}
            <strong>TanStack Query</strong> each handle the exact same request.
            Switch engines back and forth and watch the network tab — caching
            libraries return instantly, manual ones refetch every time.
          </p>
        </section>

        {/* Engine selector */}
        <section className="space-y-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fetching engine
            </h3>
            <Badge variant="outline" className="text-[10px] font-normal">
              {ENGINE_LABELS[engine].tagline}
            </Badge>
          </div>
          <MethodSelector value={engine} onChange={setEngine} />
        </section>

        {/* Search + filters */}
        <section className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1 min-w-0">
            <SearchBar value={search} onChange={setSearch} loading={loading} />
          </div>
          <RegionFilter value={region} onChange={setRegion} />
        </section>

        {/* Stats row */}
        <section className="flex items-center justify-between gap-3 flex-wrap text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {loading && !data ? (
              <>
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
                <span>Fetching…</span>
              </>
            ) : error ? (
              <>
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Error</span>
              </>
            ) : (
              <span>
                {total} {total === 1 ? 'country' : 'countries'}
                {debouncedSearch && (
                  <> matching &ldquo;{debouncedSearch}&rdquo;</>
                )}
                {region !== 'All' && <> in {region}</>}
                {data && total !== data.length && (
                  <span className="ml-1">
                    (of {data.length} total)
                  </span>
                )}
              </span>
            )}
          </div>
          {data && !loading && (
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <RotateCw className="h-3 w-3" /> Refresh
            </button>
          )}
        </section>

        {/* Grid */}
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Couldn&rsquo;t load countries</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-3">
              <span className="text-sm">{error.message}</span>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : loading && !data ? (
          <CountryGridSkeleton count={12} />
        ) : data && visible.length === 0 ? (
          <EmptyState search={debouncedSearch} region={region} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {visible.map((c) => (
              <CountryCard key={c.cca3} country={c} onSelect={setSelected} />
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => setPage((n) => n + 1)}
              className="min-w-40"
            >
              Load more ({total - visible.length} remaining)
            </Button>
          </div>
        )}

        {/* Source code (desktop) */}
        <section className="hidden sm:block space-y-2 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Source — {CODE_FILENAMES[engine]}
            </h3>
          </div>
          <CodeBlock
            code={CODE_SNIPPETS[engine]}
            title={CODE_FILENAMES[engine]}
          />
        </section>
      </main>

      {/* ── Footer (sticky bottom) ──────────────────────────────────── */}
      <footer className="mt-auto border-t bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>
            Built with Next.js 16 · TanStack Query · SWR · Axios · shadcn/ui
          </p>
          <p>
            Data:{' '}
            <a
              href="https://github.com/mledoze/countries"
              target="_blank"
              rel="noreferrer noopener"
              className="underline hover:text-foreground"
            >
              mledoze/countries
            </a>{' '}
            · Flags:{' '}
            <a
              href="https://flagcdn.com"
              target="_blank"
              rel="noreferrer noopener"
              className="underline hover:text-foreground"
            >
              flagcdn.com
            </a>
          </p>
        </div>
      </footer>

      {/* ── Mobile code sheet ───────────────────────────────────────── */}
      <Sheet open={codeOpen} onOpenChange={setCodeOpen}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Code2 className="h-4 w-4" /> {CODE_FILENAMES[engine]}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <CodeBlock code={CODE_SNIPPETS[engine]} title={CODE_FILENAMES[engine]} />
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Detail dialog ───────────────────────────────────────────── */}
      <CountryDetailDialog
        country={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  )
}

function EmptyState({ search, region }: { search: string; region: Region }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
        <Globe2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-medium">No countries found</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        {search
          ? `Nothing matched "${search}". Try a different spelling or pick another region.`
          : `No countries in the ${region} region. Pick another region above.`}
      </p>
    </div>
  )
}

// Touch REGIONS export so tree-shaking keeps it for the docs panel
void REGIONS
