'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  {
    label: 'Chapters',
    href: '/chapters',
    children: [
      { label: 'Computer Society', href: '/chapters/computer-society' },
      { label: 'Robotics & Automation', href: '/chapters/robotics-automation' },
      { label: 'Women in Engineering', href: '/chapters/women-in-engineering' },
      { label: 'Power & Energy', href: '/chapters/power-energy' },
    ],
  },
  { label: 'Events', href: '/events' },
  { label: 'Team', href: '/team' },
  { label: 'News', href: '/news' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setMobileOpen(false)
    setActiveDropdown(null)
  }

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-[var(--color-border)]'
            : 'bg-transparent'
        )}
      >
        <nav className="container" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center group py-2"
              aria-label="IEEE WUSL Student Branch Home"
            >
              <Image
                src={scrolled ? '/wusl-sb-logo.png' : '/wusl-sb-logo-white.png'}
                alt="IEEE Student Branch Wayamba University of Sri Lanka"
                width={260}
                height={40}
                className="h-8 sm:h-9 md:h-10 w-auto max-w-[200px] sm:max-w-[250px] md:max-w-[290px] object-contain transition-all duration-300"
                priority
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label} className="relative">
                    <button
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === link.label ? null : link.label
                        )
                      }
                      className={cn(
                        'flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                        scrolled
                          ? isActive(link.href)
                            ? 'text-[var(--color-primary)] bg-blue-50'
                            : 'text-[var(--color-text)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)]'
                          : isActive(link.href)
                          ? 'text-white bg-white/15'
                          : 'text-white/85 hover:text-white hover:bg-white/10'
                      )}
                      aria-expanded={activeDropdown === link.label}
                      aria-haspopup="true"
                    >
                      {link.label}
                      <ChevronDown
                        className={cn(
                          'w-3.5 h-3.5 transition-transform duration-200',
                          activeDropdown === link.label && 'rotate-180'
                        )}
                      />
                    </button>
                    {activeDropdown === link.label && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[var(--color-border)] py-1.5 z-50 animate-in fade-in-0 zoom-in-95">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              'flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)]',
                              isActive(child.href)
                                ? 'text-[var(--color-primary)] bg-blue-50/60'
                                : 'text-[var(--color-text)]'
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      'px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      scrolled
                        ? isActive(link.href)
                          ? 'text-[var(--color-primary)] bg-blue-50'
                          : 'text-[var(--color-text)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)]'
                        : isActive(link.href)
                        ? 'text-white bg-white/15'
                        : 'text-white/85 hover:text-white hover:bg-white/10'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>

            {/* CTA + Mobile toggle */}
            <div className="flex items-center gap-3">
              <Link
                href="/join"
                className={cn(
                  'hidden md:inline-flex btn btn-sm',
                  scrolled ? 'btn-primary' : 'btn-white'
                )}
              >
                Join Us
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={cn(
                  'lg:hidden p-2 rounded-lg transition-colors',
                  scrolled
                    ? 'text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                    : 'text-white hover:bg-white/10'
                )}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel */}
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <Link href="/" className="flex items-center">
                <Image
                  src="/wusl-sb-logo.png"
                  alt="IEEE WUSL Student Branch"
                  width={200}
                  height={32}
                  className="h-8 w-auto object-contain"
                  priority
                />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-muted)] transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-0.5" role="list">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={cn(
                        'flex items-center px-3.5 py-3 rounded-lg font-medium text-sm transition-colors',
                        isActive(link.href)
                          ? 'text-[var(--color-primary)] bg-blue-50'
                          : 'text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                      )}
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <ul className="ml-3.5 mt-0.5 space-y-0.5 border-l-2 border-[var(--color-border)] pl-3.5">
                        {link.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={cn(
                                'flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors',
                                isActive(child.href)
                                ? 'text-[var(--color-primary)] font-medium'
                                : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                              )}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--color-border)]">
              <Link href="/join" className="btn btn-primary w-full justify-center">
                Join IEEE WUSL
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
