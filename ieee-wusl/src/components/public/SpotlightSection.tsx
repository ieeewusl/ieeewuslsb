'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Flame, Calendar, MapPin, Users, ArrowRight } from 'lucide-react'
import { formatDateTime, isEventPast, categoryLabel } from '@/lib/utils'
import type { Event } from '@/types/database'
import EventCountdown from './EventCountdown'

interface SpotlightSectionProps {
  events: Event[]
  hideSection?: boolean
}

export default function SpotlightSection({ events, hideSection = false }: SpotlightSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // If admin selected to hide, or there are no spotlight events, hide section completely
  if (hideSection || !events || events.length === 0) {
    return null
  }

  const currentEvent = events[selectedIndex] || events[0]
  if (!currentEvent) return null

  const isPast = isEventPast(currentEvent.end_at, currentEvent.start_at)
  // Default show_countdown to true unless explicitly set to false
  const showCountdown = currentEvent.show_countdown !== false

  return (
    <section className="section section-dark overflow-hidden relative" aria-label="Spotlight Events">
      {/* Ambient background glows */}
      <div
        className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 left-10 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-15"
        style={{
          background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
        }}
      />

      <div className="container relative z-10">
        {/* If multiple events, render a stylish switcher tab bar */}
        {events.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10 pb-4 border-b border-white/10">
            <span className="text-xs font-bold text-white/50 uppercase tracking-widest mr-2 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              Spotlights:
            </span>
            {events.map((event, idx) => (
              <button
                key={event.id}
                onClick={() => setSelectedIndex(idx)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                  selectedIndex === idx
                    ? 'bg-[var(--color-accent)] text-white shadow-lg shadow-amber-500/25 scale-105'
                    : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white border border-white/10'
                }`}
              >
                <span>{event.title}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-black/30 text-white/90 uppercase">
                  {categoryLabel(event.category)}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Event Content & Countdown */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 text-[var(--color-accent)] text-xs font-bold uppercase tracking-wider mb-5">
              <Flame className="w-4 h-4 animate-pulse text-[var(--color-accent)]" />
              <span>Spotlight Event</span>
              <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
              <span>{categoryLabel(currentEvent.category)}</span>
            </div>

            <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 leading-[1.15]">
              {currentEvent.title}
            </h2>

            <p className="text-white/75 text-base sm:text-lg leading-relaxed mb-6 max-w-2xl">
              {currentEvent.summary || currentEvent.description}
            </p>

            {/* Event meta tags */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80 mb-8 pb-6 border-b border-white/10 w-full">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span>{formatDateTime(currentEvent.start_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span>
                  {currentEvent.is_online
                    ? 'Virtual / Online Stream'
                    : (currentEvent.venue ?? 'WUSL Main Campus')}
                </span>
              </div>
              {currentEvent.organizer && (
                <div className="flex items-center gap-2 text-white/60 text-xs w-full">
                  <Users className="w-3.5 h-3.5 text-white/40 shrink-0" />
                  <span>Organized by {currentEvent.organizer}</span>
                </div>
              )}
            </div>

            {/* Live Countdown (if enabled for this event) */}
            {showCountdown && (
              <div className="w-full mb-8">
                <EventCountdown targetDate={currentEvent.start_at} eventTitle={currentEvent.title} />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4">
              {currentEvent.registration_url && !isPast && (
                <a
                  href={currentEvent.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-accent text-white font-bold px-6 py-3 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all"
                >
                  Register Now
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              )}
              <Link
                href={`/events/${currentEvent.slug}`}
                className="btn btn-outline text-white border-white/30 hover:bg-white/10 hover:border-white px-6 py-3"
              >
                View Event Details
              </Link>
            </div>
          </div>

          {/* Event Cover Image & Badge */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] border border-white/15 group">
              <Image
                key={currentEvent.id}
                src={currentEvent.cover_url || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80'}
                alt={currentEvent.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-navy)]/80 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 font-medium">
                  IEEE WUSL Premier
                </span>
                <span className="px-3 py-1 rounded-full bg-[var(--color-accent)] text-white font-bold uppercase tracking-wider text-[10px]">
                  {isPast ? 'Past Event' : 'Registration Active'}
                </span>
              </div>
            </div>

            {/* Decorative border backdrop */}
            <div className="absolute -top-4 -right-4 w-32 h-32 rounded-3xl bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)]/40 -z-10 blur-sm" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-3xl bg-[var(--color-primary)]/20 border-2 border-[var(--color-primary)]/40 -z-10 blur-sm" />
          </div>
        </div>
      </div>
    </section>
  )
}

