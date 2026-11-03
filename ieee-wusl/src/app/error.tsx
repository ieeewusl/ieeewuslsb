'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center p-6 text-center">
      <div className="max-w-md mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 text-red-600 shadow-sm mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-3">
          Something went wrong
        </h1>
        <p className="text-[var(--color-muted)] text-sm mb-8 leading-relaxed">
          An unexpected error occurred. You can attempt to reload the section or navigate back to safety.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => reset()} className="btn btn-primary">
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <Link href="/" className="btn btn-outline">
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
