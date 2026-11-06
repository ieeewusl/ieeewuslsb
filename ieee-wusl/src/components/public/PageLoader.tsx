'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function PageLoader() {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Start fade-out after a brief loading period
    const fadeTimer = setTimeout(() => setFadeOut(true), 900)
    // Remove from DOM after fade animation completes
    const removeTimer = setTimeout(() => setVisible(false), 1500)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[var(--color-navy)] flex items-center justify-center transition-all duration-[600ms] ease-out ${
        fadeOut ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-8">
        {/* IEEE WUSL Logo */}
        <div className={`transition-all duration-700 ${fadeOut ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
          <Image
            src="/White WUSL SB LOGOv02.png"
            alt="IEEE WUSL Student Branch"
            width={300}
            height={50}
            className="w-56 sm:w-72 h-auto animate-pulse"
            priority
          />
        </div>

        {/* Progress bar */}
        <div className="w-48 h-[3px] bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)] rounded-full animate-loader-progress" />
        </div>

        {/* Floating dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/50 animate-loader-dot"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

