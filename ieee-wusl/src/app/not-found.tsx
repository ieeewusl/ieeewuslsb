import Link from 'next/link'
import { ArrowLeft, Home, Zap } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-navy)] flex items-center justify-center p-6 text-white text-center">
      <div className="max-w-md mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-primary)] shadow-lg mb-6">
          <Zap className="w-8 h-8 text-white" fill="currentColor" />
        </div>
        <div className="text-sm font-semibold uppercase tracking-widest text-[var(--color-bright-light)] mb-2">
          404 Error
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Page not found
        </h1>
        <p className="text-white/65 text-base mb-8 leading-relaxed">
          The page you are looking for doesn&apos;t exist, has been moved, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn btn-primary">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link href="/events" className="btn btn-white-outline">
            Browse Events
          </Link>
        </div>
      </div>
    </div>
  )
}

