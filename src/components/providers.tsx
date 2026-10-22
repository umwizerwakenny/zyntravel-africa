'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster as SonnerToaster } from 'sonner'

/**
 * Combined client providers:
 *  - ThemeProvider  → dark mode via next-themes (class strategy)
 *  - QueryClientProvider → TanStack Query for the "React Query" engine
 *  - SonnerToaster → lightweight toasts for refresh/error feedback
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // One QueryClient per browser session (avoid SSR re-creation pitfall)
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000, // 1 min fresh
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={client}>
        {children}
        <SonnerToaster position="top-right" richColors closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
