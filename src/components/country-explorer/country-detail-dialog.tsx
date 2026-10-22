'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ExternalLink,
  MapPin,
  Globe2,
  Languages,
  Coins,
  Ruler,
  Compass,
} from 'lucide-react'
import type { Country } from '@/lib/countries'
import {
  flagUrl,
  formatArea,
  languagesToList,
  currenciesToString,
} from '@/lib/countries'

interface CountryDetailDialogProps {
  country: Country | null
  onOpenChange: (open: boolean) => void
}

/**
 * Modal that shows everything we have about a country from the mledoze dataset.
 * Uses shadcn's Dialog (radix-based) for a11y: focus trap, escape to close,
 * scroll lock — all handled.
 */
export function CountryDetailDialog({
  country,
  onOpenChange,
}: CountryDetailDialogProps) {
  return (
    <Dialog open={!!country} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        {country && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <img
                  src={flagUrl(country.cca2)}
                  alt={`Flag of ${country.name.common}`}
                  className="h-10 w-16 object-cover rounded shadow-sm"
                />
                <span>{country.name.common}</span>
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {country.name.official}
                {country.independent && ' · Independent state'}
                {country.unMember && ' · UN member'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 py-2">
              <DetailRow icon={<MapPin className="h-4 w-4" />} label="Capital">
                {country.capital?.[0] ?? '—'}
              </DetailRow>
              <DetailRow icon={<Globe2 className="h-4 w-4" />} label="Region">
                {country.region}
                {country.subregion ? ` · ${country.subregion}` : ''}
              </DetailRow>
              <DetailRow icon={<Ruler className="h-4 w-4" />} label="Area">
                {formatArea(country.area)}
              </DetailRow>
              <DetailRow icon={<Compass className="h-4 w-4" />} label="Coordinates">
                {country.latlng && country.latlng.length === 2
                  ? `${country.latlng[0].toFixed(2)}°, ${country.latlng[1].toFixed(2)}°`
                  : '—'}
              </DetailRow>
              <DetailRow icon={<Languages className="h-4 w-4" />} label="Languages">
                {languagesToList(country.languages)}
              </DetailRow>
              <DetailRow icon={<Coins className="h-4 w-4" />} label="Currencies">
                {currenciesToString(country.currencies)}
              </DetailRow>
              <DetailRow icon={<Globe2 className="h-4 w-4" />} label="ISO codes">
                <Badge variant="secondary" className="font-mono">
                  {country.cca2}
                </Badge>{' '}
                <Badge variant="outline" className="font-mono">
                  {country.cca3}
                </Badge>
                {country.ccn3 && (
                  <>
                    {' '}
                    <Badge variant="outline" className="font-mono">
                      {country.ccn3}
                    </Badge>
                  </>
                )}
              </DetailRow>
              <DetailRow icon={<Globe2 className="h-4 w-4" />} label="Top-level domain">
                {country.tld && country.tld.length > 0
                  ? country.tld.join(', ')
                  : '—'}
              </DetailRow>
            </div>

            {country.borders && country.borders.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Bordering countries (ISO3 codes)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {country.borders.map((b) => (
                      <Badge key={b} variant="outline" className="font-mono text-xs">
                        {b}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {country.latlng && country.latlng.length === 2 && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${country.latlng[0]},${country.latlng[1]}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                View on Google Maps
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground" aria-hidden="true">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  )
}
