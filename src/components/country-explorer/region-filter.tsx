'use client'

import { REGIONS, type Region } from '@/lib/countries'
import { cn } from '@/lib/utils'

interface RegionFilterProps {
  value: Region
  onChange: (r: Region) => void
}

/**
 * Horizontal pill-style region filter. Each pill is a real <button> so the
 * component is fully keyboard accessible.
 */
export function RegionFilter({ value, onChange }: RegionFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter countries by region"
      className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-muted/60"
    >
      {REGIONS.map((r) => {
        const active = r === value
        return (
          <button
            key={r}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(r)}
            className={cn(
              'px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {r}
          </button>
        )
      })}
    </div>
  )
}
