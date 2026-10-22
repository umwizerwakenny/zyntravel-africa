'use client'

import { Globe2, Users, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Country } from '@/lib/countries'
import { flagUrl, formatArea } from '@/lib/countries'

interface CountryCardProps {
  country: Country
  onSelect: (c: Country) => void
}

/**
 * Single country tile: flag, name, capital, area, region badge.
 * Whole card is a button → accessible, keyboard-focusable.
 */
export function CountryCard({ country, onSelect }: CountryCardProps) {
  const capital = country.capital?.[0] ?? '—'
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect(country)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(country)
        }
      }}
      className="group cursor-pointer overflow-hidden py-0 gap-0 transition-all hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`View details for ${country.name.common}`}
    >
      {/* Flag */}
      <div className="relative aspect-[3/2] bg-muted overflow-hidden">
        <img
          src={flagUrl(country.cca2)}
          alt={`Flag of ${country.name.common}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>

      {/* Body */}
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-base leading-tight line-clamp-1">
          {country.name.common}
        </h3>
        <dl className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Capital</dt>
            <dd className="truncate">{capital}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Area</dt>
            <dd>{formatArea(country.area)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe2 className="h-3 w-3 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Region</dt>
            <dd className="truncate">{country.region}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
