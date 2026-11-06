'use client'

import { useState, useEffect, useRef } from 'react'

interface ParallaxWrapperProps {
  children: React.ReactNode
  speed?: number // positive values move down slower, negative move up
  className?: string
}

export default function ParallaxWrapper({
  children,
  speed = 0.2,
  className = '',
}: ParallaxWrapperProps) {
  const [offsetY, setOffsetY] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!ref.current) {
            ticking = false
            return
          }
          const rect = ref.current.getBoundingClientRect()
          const viewportHeight = window.innerHeight
          // Calculate when in viewport
          if (rect.top < viewportHeight && rect.bottom > 0) {
            const distance = rect.top - viewportHeight / 2
            setOffsetY(distance * speed)
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return (
    <div
      ref={ref}
      className={`parallax-bg ${className}`}
      style={{
        transform: `translate3d(0, ${offsetY}px, 0)`,
      }}
    >
      {children}
    </div>
  )
}

