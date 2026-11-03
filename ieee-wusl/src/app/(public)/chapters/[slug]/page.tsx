import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Globe, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Chapter, Event } from '@/types/database'
import { formatDateTime } from '@/lib/utils'

export const revalidate = 60

import { mockChapters, mockEvents } from '@/lib/mock-data'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('chapters').select('name,short_desc').eq('slug', slug).single()
    if (data) return { title: `IEEE ${data.name}`, description: data.short_desc ?? undefined }
  } catch {}
  const mock = mockChapters.find(c => c.slug === slug)
  if (mock) return { title: `IEEE ${mock.name}`, description: mock.short_desc ?? undefined }
  return { title: 'Chapter Not Found' }
}

async function getChapter(slug: string) {
  try {
    const supabase = await createClient()
    const [chapterRes, eventsRes] = await Promise.all([
      supabase.from('chapters').select('*').eq('slug', slug).eq('status', 'published').single(),
      supabase.from('events').select('id,title,slug,start_at,category,summary').eq('status', 'published').order('start_at', { ascending: false }).limit(4),
    ])
    if (chapterRes.data) {
      return {
        chapter: chapterRes.data as Chapter,
        events: (eventsRes.data ?? []) as Partial<Event>[],
      }
    }
  } catch {}
  const mock = mockChapters.find(c => c.slug === slug)
  const relatedEvents = mockEvents.filter(e => e.chapter_id === mock?.id)
  return { chapter: mock || null, events: relatedEvents }
}

export default async function ChapterDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { chapter, events } = await getChapter(slug)
  if (!chapter) notFound()

  return (
    <>
      <section className="pt-28 pb-0 bg-gradient-to-b from-[var(--color-navy)] to-[var(--color-navy-800)]">
        <div className="container pb-12">
          <Link href="/chapters" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Chapters
          </Link>
          <div className="section-label" style={{ color: 'var(--color-bright-light)' }}>
            <span>Technical Chapter</span>
          </div>
          <h1 className="text-white mb-4">IEEE {chapter.name}</h1>
          {chapter.short_desc && (
            <p className="text-white/65 text-lg max-w-xl leading-relaxed">{chapter.short_desc}</p>
          )}
          {chapter.website_url && (
            <a href={chapter.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-5 text-[var(--color-bright-light)] hover:text-white text-sm transition-colors">
              <Globe className="w-4 h-4" /> Official Website <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              {chapter.logo_url && (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden mb-8 shadow-lg">
                  <Image src={chapter.logo_url} alt={`${chapter.name} logo`} fill className="object-contain p-2 bg-[var(--color-surface)]" />
                </div>
              )}
              {chapter.description ? (
                <div className="prose-content" dangerouslySetInnerHTML={{ __html: chapter.description }} />
              ) : (
                <p className="text-[var(--color-muted)] text-lg">{chapter.short_desc}</p>
              )}
            </div>
            <div className="space-y-5">
              {chapter.founded_year && (
                <div className="card p-5">
                  <div className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">Founded</div>
                  <div className="text-2xl font-bold text-[var(--color-primary)]">{chapter.founded_year}</div>
                </div>
              )}
              {events.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-bold text-[var(--color-text)] mb-4">Recent Events</h3>
                  <div className="space-y-3">
                    {events.slice(0, 3).map(event => (
                      <Link key={event.id} href={`/events/${event.slug}`} className="block text-sm text-[var(--color-primary)] hover:underline">
                        {event.title}
                      </Link>
                    ))}
                  </div>
                  <Link href="/events" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] mt-3 inline-block transition-colors">
                    View all events →
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
