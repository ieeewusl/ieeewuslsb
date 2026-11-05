'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollToTop() {
    if (typeof window !== 'undefined') {
      const lenisInstance = (window as unknown as { __lenis?: { scrollTo: (target: number | string | HTMLElement, opts?: { duration?: number }) => void } }).__lenis
      if (lenisInstance) {
        lenisInstance.scrollTo(0, { duration: 1.4 })
        return
      }
    }
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={cn(
        'fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[var(--color-primary)] text-white shadow-lg hover:bg-[var(--color-primary-light)] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-bright)] focus:ring-offset-2 transition-all duration-300 transform cursor-pointer',
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'
      )}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  )
}
