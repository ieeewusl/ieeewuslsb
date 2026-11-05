'use client'

import { useState, useEffect } from 'react'

interface CountdownProps {
  targetDate: string | Date
  eventTitle?: string
  className?: string
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

function calculateTimeRemaining(target: string | Date): TimeRemaining {
  const difference = new Date(target).getTime() - new Date().getTime()

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isExpired: false,
  }
}

export default function EventCountdown({ targetDate, className = '' }: CountdownProps) {
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  })

  useEffect(() => {
    setMounted(true)
    setTimeLeft(calculateTimeRemaining(targetDate))

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(targetDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (!mounted) {
    return (
      <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm">
        {['DAYS', 'HOURS', 'MINS', 'SECS'].map((label) => (
          <div key={label} className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 sm:p-3 text-center border border-white/15">
            <span className="block text-2xl sm:text-3xl font-extrabold text-white">--</span>
            <span className="text-[10px] sm:text-xs font-semibold text-white/70 tracking-wider uppercase">{label}</span>
          </div>
        ))}
      </div>
    )
  }

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-sm tracking-wide">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        EVENT LIVE NOW / REGISTRATION IN PROGRESS
      </div>
    )
  }

  const items = [
    { label: 'DAYS', value: String(timeLeft.days).padStart(2, '0') },
    { label: 'HOURS', value: String(timeLeft.hours).padStart(2, '0') },
    { label: 'MINS', value: String(timeLeft.minutes).padStart(2, '0') },
    { label: 'SECS', value: String(timeLeft.seconds).padStart(2, '0') },
  ]

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm">
      {items.map(({ label, value }) => (
        <div
          key={label}
          className="bg-white/10 backdrop-blur-md rounded-xl p-2 sm:p-3 text-center border border-white/15 shadow-inner"
        >
          <span className="block text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            {value}
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold text-white/75 tracking-widest uppercase">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

