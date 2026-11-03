import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Cpu, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Chapter } from '@/types/database'

export const metadata: Metadata = {
  title: 'Technical Chapters',
  description: 'Explore the IEEE technical chapters and affinity groups at Wayamba University of Sri Lanka.',
}

export const revalidate = 60

import { mockChapters } from '@/lib/mock-data'

async function getChapters(): Promise<Chapter[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('chapters')
      .select('*')
      .eq('status', 'published')
      .order('display_order', { ascending: true })
    if (data && data.length > 0) return data as Chapter[]
    return mockChapters
  } catch {
    return mockChapters
  }
}

const chapterGradients: Record<string, string> = {
  'computer-society': 'from-blue-600 to-blue-900',
  'robotics-automation': 'from-purple-600 to-purple-900',
  'women-in-engineering': 'from-rose-500 to-rose-800',
  'power-energy': 'from-amber-500 to-orange-700',
}

export default async function ChaptersPage() {
  const chapters = await getChapters()

  return (
    <>
      <section className="pt-32 pb-16 bg-gradient-to-b from-[var(--color-navy)] to-[var(--color-navy-800)]">
        <div className="container">
          <div className="section-label" style={{ color: 'var(--color-bright-light)' }}>
            <span>Technical Chapters</span>
          </div>
          <h1 className="text-white mb-4">Our Technical Communities</h1>
          <p className="text-white/60 text-lg max-w-xl">
            Deep technical expertise, professional development, and vibrant communities across multiple engineering disciplines.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {chapters.length === 0 ? (
            <div className="text-center py-24">
              <Cpu className="w-16 h-16 text-[var(--color-muted-light)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">Chapters coming soon</h2>
              <p className="text-[var(--color-muted)]">Our technical chapters will be published here.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {chapters.map(chapter => {
                const gradient = chapterGradients[chapter.slug] ?? 'from-blue-600 to-blue-900'
                return (
                  <Link key={chapter.id} href={`/chapters/${chapter.slug}`} className="card group flex gap-6 p-6 md:p-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-lg`}>
                      <Cpu className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                        IEEE {chapter.name}
                      </h2>
                      <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
                        {chapter.short_desc}
                      </p>
                      {chapter.founded_year && (
                        <p className="text-xs text-[var(--color-muted-light)]">Est. {chapter.founded_year}</p>
                      )}
                      <div className="flex items-center gap-1 mt-3 text-sm font-medium text-[var(--color-primary)]">
                        Explore chapter <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
