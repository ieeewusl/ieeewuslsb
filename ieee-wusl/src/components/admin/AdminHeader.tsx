'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, ChevronDown, User, Bell } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import type { UserRole } from '@/types/database'

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  administrator: 'Administrator',
  editor: 'Editor',
}

export default function AdminHeader({
  userEmail,
  userName,
  userRole,
}: {
  userEmail: string
  userName: string
  userRole: UserRole
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-[var(--color-border)] px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Breadcrumb placeholder — pages override this */}
      <div className="lg:hidden w-8" />

      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--color-surface)] transition-colors"
            aria-expanded={open}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-navy)] flex items-center justify-center text-white text-xs font-bold">
              {getInitials(userName)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium text-[var(--color-text)] leading-tight">{userName}</div>
              <div className="text-xs text-[var(--color-muted)]">{roleLabels[userRole]}</div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[var(--color-muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl border border-[var(--color-border)] shadow-lg py-1.5 z-20">
                <div className="px-4 py-3 border-b border-[var(--color-border)]">
                  <div className="text-sm font-medium text-[var(--color-text)] truncate">{userName}</div>
                  <div className="text-xs text-[var(--color-muted)] truncate">{userEmail}</div>
                  <div className="text-xs font-medium text-[var(--color-primary)] mt-0.5">{roleLabels[userRole]}</div>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[var(--color-error)] hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {loading ? 'Signing out…' : 'Sign Out'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
