'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Cpu,
  Newspaper,
  Code2,
  Image,
  Settings,
  UserCog,
  Zap,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/database'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Events', href: '/admin/events', icon: Calendar },
  { label: 'Team', href: '/admin/team', icon: Users },
  { label: 'Chapters', href: '/admin/chapters', icon: Cpu },
  { label: 'News', href: '/admin/news', icon: Newspaper },
  { label: 'Gallery', href: '/admin/gallery', icon: Image },
  { label: 'Settings', href: '/admin/settings', icon: Settings, roles: ['super_admin', 'administrator'] },
  { label: 'Users', href: '/admin/users', icon: UserCog, roles: ['super_admin'] },
]

export default function AdminSidebar({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleItems = navItems.filter(item =>
    !item.roles || item.roles.includes(userRole)
  )

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b border-[var(--color-border)]">
        <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" fill="currentColor" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold text-[var(--color-text)]">IEEE WUSL</div>
          <div className="text-xs text-[var(--color-muted)]">Admin Dashboard</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Admin navigation">
        <div className="space-y-0.5">
          {visibleItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive(href)
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
              )}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {label}
              {isActive(href) && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--color-border)]">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-all"
        >
          <Zap className="w-3.5 h-3.5" />
          View Public Site
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-[var(--color-border)] z-30 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-xl bg-white border border-[var(--color-border)] shadow-sm text-[var(--color-text)]"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute top-0 left-0 bottom-0 w-64 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <span className="font-bold text-[var(--color-text)] text-sm">Navigation</span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
