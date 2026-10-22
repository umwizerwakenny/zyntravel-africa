'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Theme toggle — uses next-themes (class strategy) wired up in <Providers>.
 * `mounted` avoids hydration mismatch: the server renders no icon, then the
 * client swaps in the correct icon after mount.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // next-themes needs to know the client has hydrated before rendering the
  // correct icon — this is the canonical SSR-mounted pattern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <Button variant="outline" size="icon" aria-label="Toggle theme" disabled>
      <Sun className="h-[1.2rem] w-[1.2rem]" />
    </Button>
  }

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  )
}
