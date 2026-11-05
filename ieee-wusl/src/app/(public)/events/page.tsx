import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calendar, Clock, MapPin, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime, isEventPast, categoryLabel } from '@/lib/utils'
import type { Event } from '@/types/database'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Discover upcoming and past IEEE WUSL events — workshops, seminars, competitions, hackathons, and more.',
}

export const revalidate = 60

import { mockEvents } from '@/lib/mock-data'

async function getEvents() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('start_at', { ascending: false })
    if (data && data.length > 0) return data as Event[]
    return mockEvents
  } catch {
    return mockEvents
  }
}

const categoryColors: Record<string, string> = {
  workshop: 'badge-primary',
  seminar: 'badge-accent',
  competition: 'badge-error',
  hackathon: 'badge-warning',
  social: 'badge-success',
  webinar: 'badge-muted',
  conference: 'badge-dark',
  other: 'badge-muted',
}

export default async function EventsPage() {
  const events = await getEvents()
  const upcoming = events.filter(e => !isEventPast(e.end_at, e.start_at))
  const past = events.filter(e => isEventPast(e.end_at, e.start_at))

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-[var(--color-navy)] to-[var(--color-navy-800)]">
        <div className="container">
          <div className="section-label" style={{ color: 'var(--color-bright-light)' }}>
            <span>Events</span>
          </div>
          <h1 className="text-white mb-4">Events & Activities</h1>
          <p className="text-white/60 text-lg max-w-xl">
            Workshops, seminars, competitions, hackathons, and more — discover everything happening at IEEE WUSL.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-8 flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--color-success)]"></span>
                Upcoming Events
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-8 flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--color-border-dark)]"></span>
                Past Events
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {past.map(event => (
                  <EventCard key={event.id} event={event} past />
                ))}
              </div>
            </div>
          )}

          {events.length === 0 && (
            <div className="text-center py-24">
              <Calendar className="w-16 h-16 text-[var(--color-muted-light)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-3">No events yet</h2>
              <p className="text-[var(--color-muted)] max-w-sm mx-auto">
                Events will be published here as they are scheduled. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function EventCard({ event, past = false }: { event: Event; past?: boolean }) {
  return (
    <Link href={`/events/${event.slug}`} className="card group flex flex-col overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-primary)]">
        <Image
          src={event.cover_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80'}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className={`badge ${categoryColors[event.category] ?? 'badge-muted'}`}>
            {categoryLabel(event.category)}
          </span>
          {past && <span className="badge badge-muted">Past</span>}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
          {event.title}
        </h3>
        {event.summary && (
          <p className="text-sm text-[var(--color-muted)] line-clamp-2 mb-4 flex-1">{event.summary}</p>
        )}
        <div className="space-y-1.5 mt-auto">
          <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
            <Clock className="w-3.5 h-3.5" /> {formatDateTime(event.start_at)}
          </div>
          {event.venue && (
            <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
              <MapPin className="w-3.5 h-3.5" /> {event.venue}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
