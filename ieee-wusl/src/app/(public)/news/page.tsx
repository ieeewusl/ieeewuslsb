import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Radio, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { NewsArticle } from '@/types/database'

export const metadata: Metadata = {
  title: 'News & Announcements',
  description: 'Latest news, announcements, event recaps, and updates from the IEEE Student Branch at Wayamba University of Sri Lanka.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { mockNews } from '@/lib/mock-data'

async function getArticles(): Promise<Partial<NewsArticle>[]> {
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-wusl')
  )

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('news_articles')
      .select('id,title,slug,summary,cover_url,published_at,tags,author_name')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (isSupabaseConfigured && !error && data) {
      return data
    }
    if (data && data.length > 0) return data
    return isSupabaseConfigured ? [] : mockNews
  } catch {
    return isSupabaseConfigured ? [] : mockNews
  }
}

export default async function NewsPage() {
  const articles = await getArticles()
  const [featured, ...rest] = articles

  return (
    <>
      <section className="pt-32 pb-16 bg-gradient-to-b from-[var(--color-navy)] to-[var(--color-navy-800)]">
        <div className="container">
          <div className="section-label" style={{ color: 'var(--color-bright-light)' }}>
            <span>News & Announcements</span>
          </div>
          <h1 className="text-white mb-4">Latest from IEEE WUSL</h1>
          <p className="text-white/60 text-lg max-w-xl">
            Event recaps, project updates, competition results, and branch announcements.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {articles.length === 0 ? (
            <div className="text-center py-24">
              <Radio className="w-16 h-16 text-[var(--color-muted-light)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">No news yet</h2>
              <p className="text-[var(--color-muted)]">Check back soon for updates and announcements.</p>
            </div>
          ) : (
            <>
              {/* Featured */}
              {featured && (
                <Link href={`/news/${featured.slug}`} className="card group flex flex-col md:flex-row gap-0 mb-10 overflow-hidden">
                  <div className="relative aspect-video md:aspect-auto md:w-1/2 shrink-0 bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-primary)]">
                    <Image
                      src={featured.cover_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'}
                      alt={featured.title ?? ''}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    {featured.tags && featured.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {featured.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="badge badge-primary">{tag}</span>
                        ))}
                      </div>
                    )}
                    <h2 className="text-2xl font-bold text-[var(--color-text)] mb-3 group-hover:text-[var(--color-primary)] transition-colors">
                      {featured.title}
                    </h2>
                    {featured.summary && (
                      <p className="text-[var(--color-muted)] leading-relaxed mb-5 line-clamp-3">{featured.summary}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-[var(--color-muted-light)]">
                      {featured.published_at && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(featured.published_at)}
                        </span>
                      )}
                      {featured.author_name && <span>By {featured.author_name}</span>}
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map(article => (
                    <Link key={article.id} href={`/news/${article.slug}`} className="card group flex flex-col overflow-hidden">
                      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[var(--color-navy-800)] to-[var(--color-navy)]">
                        <Image
                          src={article.cover_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80'}
                          alt={article.title ?? ''}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {article.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="badge badge-muted text-[0.7rem]">{tag}</span>
                            ))}
                          </div>
                        )}
                        <h3 className="font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        {article.summary && (
                          <p className="text-sm text-[var(--color-muted)] line-clamp-3 flex-1">{article.summary}</p>
                        )}
                        <div className="flex items-center gap-3 mt-4 text-xs text-[var(--color-muted-light)]">
                          {article.published_at && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" />
                              {formatDate(article.published_at)}
                            </span>
                          )}
                          {article.author_name && <span>· {article.author_name}</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
