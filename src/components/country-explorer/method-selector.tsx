'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ENGINE_LABELS, type FetchEngine } from '@/hooks/use-countries'

interface MethodSelectorProps {
  value: FetchEngine
  onChange: (e: FetchEngine) => void
}

/**
 * Tabs row letting the user switch the active data-fetching engine.
 * Each tab shows the label + a colored dot that matches the legend colours.
 */
export function MethodSelector({ value, onChange }: MethodSelectorProps) {
  const engines = Object.keys(ENGINE_LABELS) as FetchEngine[]

  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as FetchEngine)}
      className="w-full"
    >
      <TabsList className="w-full sm:w-auto flex-wrap h-auto">
        {engines.map((e) => (
          <TabsTrigger key={e} value={e} className="gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${ENGINE_LABELS[e].color}`}
              aria-hidden="true"
            />
            {ENGINE_LABELS[e].label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
