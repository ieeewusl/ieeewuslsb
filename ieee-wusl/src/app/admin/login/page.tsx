'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white shadow-sm border border-[var(--color-border)] mb-4">
            <Image
              src="/wusl-sb-logo.png"
              alt="IEEE WUSL Student Branch"
              width={260}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Admin Dashboard</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">Wayamba University of Sri Lanka</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="text-lg font-bold text-[var(--color-text)] mb-1">Sign in</h2>
          <p className="text-sm text-[var(--color-muted)] mb-6">Enter your credentials to access the dashboard.</p>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 mb-5 rounded-xl bg-red-50 border border-red-100 text-red-700">
              <AlertCircle className="w-4.5 h-4.5 mt-0.5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="admin@example.com"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[var(--color-muted)] mt-6">
          Access restricted to authorized committee members only.
        </p>
      </div>
    </div>
  )
}
