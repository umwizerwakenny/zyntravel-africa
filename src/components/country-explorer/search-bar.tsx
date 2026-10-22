'use client'

import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  loading?: boolean
}

/**
 * Search input with a debounce handled by the parent (via useDebouncedValue).
 * Shows a small spinner in place of the search icon while a request is in flight.
 */
export function SearchBar({ value, onChange, loading = false }: SearchBarProps) {
  return (
    <div className="relative w-full">
      {loading ? (
        <Loader2
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin"
          aria-hidden="true"
        />
      ) : (
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
      )}
      <Input
        type="search"
        placeholder="Search by country name (e.g. Rwanda, Japan, Brazil)…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 w-full"
        aria-label="Search countries by name"
      />
    </div>
  )
}
