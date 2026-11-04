'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Cpu,
  Newspaper,
  Image as ImageIcon,
  Settings,
  UserCog,
  Globe,
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
  { label: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
  { label: 'Settings', href: '/admin/settings', icon: Settings, roles: ['super_admin', 'administrator'] },
  { label: 'Users', href: '/admin/users', icon: UserCog, roles: ['super_admin'] },
]

interface SidebarContentProps {
  items: typeof navItems
  pathname: string
  onNavigate?: () => void
}

function SidebarContent({ items, pathname, onNavigate }: SidebarContentProps) {
  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <Link href="/admin" className="block" onClick={onNavigate}>
          <Image
            src="/wusl-sb-logo.png"
            alt="IEEE WUSL Student Branch Logo"
            width={220}
            height={36}
            className="h-8 w-auto max-w-[210px] object-contain"
            priority
          />
        </Link>
        <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-muted)] mt-1.5 px-0.5">
          Admin Dashboard
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Admin navigation">
        <div className="space-y-0.5">
          {items.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
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
          <Globe className="w-3.5 h-3.5" />
          View Public Site
        </Link>
      </div>
    </div>
  )
}

export default function AdminSidebar({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleItems = navItems.filter(item =>
    !item.roles || item.roles.includes(userRole)
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-[var(--color-border)] z-30 flex-col">
        <SidebarContent items={visibleItems} pathname={pathname} />
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
              <Image
                src="/wusl-sb-logo.png"
                alt="IEEE WUSL Logo"
                width={180}
                height={30}
                className="h-7 w-auto object-contain"
              />
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <SidebarContent items={visibleItems} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  )
}
