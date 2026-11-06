import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Clock, ExternalLink, Tag, ArrowLeft, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime, formatDate, isEventPast, categoryLabel } from '@/lib/utils'
import type { Event } from '@/types/database'
import EventCountdown from '@/components/public/EventCountdown'

export const revalidate = 60

import { mockEvents } from '@/lib/mock-data'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('events').select('title,summary').eq('slug', slug).single()
    if (data) return { title: data.title, description: data.summary ?? undefined }
  } catch {}
  const mock = mockEvents.find(e => e.slug === slug)
  if (mock) return { title: mock.title, description: mock.summary ?? undefined }
  return { title: 'Event Not Found' }
}

async function getEvent(slug: string): Promise<Event | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('events')
      .select('*, chapters(name,slug)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    if (data) return data as Event
  } catch {}
  const mock = mockEvents.find(e => e.slug === slug)
  return mock || null
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) notFound()

  const past = isEventPast(event.end_at, event.start_at)

  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 pb-0 bg-[var(--color-navy)]">
        {event.cover_url && (
          <div className="absolute inset-0">
            <Image src={event.cover_url} alt={event.title} fill className="object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-navy)]/80 to-[var(--color-navy)]" />
          </div>
        )}
        <div className="container relative pb-12">
          <Link href="/events" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`badge ${past ? 'badge-dark' : 'badge-accent'}`}>
              {past ? 'Past Event' : 'Upcoming'}
            </span>
            <span className="badge badge-dark">{categoryLabel(event.category)}</span>
          </div>
          <h1 className="text-white max-w-3xl mb-4">{event.title}</h1>
          {event.summary && (
            <p className="text-white/65 text-lg max-w-2xl leading-relaxed">{event.summary}</p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Content */}
            <div className="lg:col-span-2">
              {event.cover_url && (
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl mb-8">
                  <Image src={event.cover_url} alt={event.title} fill className="object-cover" />
                </div>
              )}
              {event.description ? (
                <div className="prose-content" dangerouslySetInnerHTML={{ __html: event.description }} />
              ) : (
                <p className="text-[var(--color-muted)]">No additional details available for this event.</p>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Live Countdown Card */}
              {!past && event.show_countdown !== false && (
                <div className="card p-6 bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-navy-800)] text-white shadow-xl border border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider mb-3">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Event Countdown</span>
                  </div>
                  <EventCountdown targetDate={event.start_at} eventTitle={event.title} />
                </div>
              )}

              {/* Details card */}
              <div className="card p-6">
                <h2 className="font-bold text-[var(--color-text)] mb-5">Event Details</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-4.5 h-4.5 text-[var(--color-primary)] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-[var(--color-text)]">Start</div>
                      <div className="text-sm text-[var(--color-muted)]">{formatDateTime(event.start_at)}</div>
                    </div>
                  </div>
                  {event.end_at && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-4.5 h-4.5 text-[var(--color-muted-light)] mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-[var(--color-text)]">End</div>
                        <div className="text-sm text-[var(--color-muted)]">{formatDateTime(event.end_at)}</div>
                      </div>
                    </div>
                  )}
                  {event.venue && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4.5 h-4.5 text-[var(--color-primary)] mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-[var(--color-text)]">Venue</div>
                        <div className="text-sm text-[var(--color-muted)]">{event.venue}</div>
                      </div>
                    </div>
                  )}
                  {event.is_online && event.meeting_url && (
                    <div className="flex items-start gap-3">
                      <Globe className="w-4.5 h-4.5 text-[var(--color-primary)] mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-[var(--color-text)]">Online Event</div>
                        <a href={event.meeting_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-primary)] hover:underline">
                          Join Meeting
                        </a>
                      </div>
                    </div>
                  )}
                  {event.organizer && (
                    <div className="flex items-start gap-3">
                      <Tag className="w-4.5 h-4.5 text-[var(--color-primary)] mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-[var(--color-text)]">Organizer</div>
                        <div className="text-sm text-[var(--color-muted)]">{event.organizer}</div>
                      </div>
                    </div>
                  )}
                </div>

                {event.registration_url && !past && (
                  <a
                    href={event.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary w-full justify-center mt-6"
                  >
                    Register Now <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Chapter link */}
              {event.chapters && (
                <div className="card p-5">
                  <div className="text-xs text-[var(--color-muted)] uppercase tracking-widest mb-2">Organized by</div>
                  <Link href={`/chapters/${event.chapters.slug}`} className="font-semibold text-[var(--color-primary)] hover:underline">
                    IEEE {event.chapters.name}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
