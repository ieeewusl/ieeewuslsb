'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface ParallaxHeroProps {
  imageSrc: string
  alt?: string
}

export default function ParallaxHero({ imageSrc, alt = 'Hero background' }: ParallaxHeroProps) {
  const [offsetY, setOffsetY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY
          // Only calculate if hero is visible within viewport
          if (scrollY < window.innerHeight * 1.5) {
            setOffsetY(scrollY * 0.35)
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-[10%] -left-[5%] -right-[5%] h-[125%] w-[110%] parallax-bg"
        style={{
          transform: `translate3d(0, ${offsetY}px, 0)`,
        }}
      >
        <Image
          src={imageSrc}
          alt={alt}
          fill
          priority
          className="object-cover object-center scale-105"
        />
      </div>
      {/* Dynamic atmospheric lighting layers */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-navy)]/95 via-[var(--color-navy)]/80 to-[var(--color-navy)]/65" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-navy)] via-transparent to-transparent" />
      {/* Decorative subtle ambient tech grid */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />
    </div>
  )
}

