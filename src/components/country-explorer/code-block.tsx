'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface CodeBlockProps {
  code: string
  title?: string
  language?: string
}

/**
 * Read-only code panel with copy-to-clipboard. Uses <pre><code> for native
 * accessibility; whitespace and indentation are preserved.
 */
export function CodeBlock({ code, title, language = 'tsx' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Code copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  return (
    <div className="rounded-lg border bg-muted/40 overflow-hidden">
      <div className="flex items-center justify-between border-b px-3 py-1.5 bg-muted/80">
        <span className="text-xs font-mono text-muted-foreground">
          {title ?? language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy
            </>
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed max-h-[28rem]">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  )
}
