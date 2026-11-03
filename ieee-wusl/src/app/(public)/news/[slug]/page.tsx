import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { NewsArticle } from '@/types/database'

export const revalidate = 60

import { mockNews } from '@/lib/mock-data'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('news_articles').select('title,summary').eq('slug', slug).single()
    if (data) return { title: data.title, description: data.summary ?? undefined }
  } catch {}
  const mock = mockNews.find(n => n.slug === slug)
  if (mock) return { title: mock.title, description: mock.summary ?? undefined }
  return { title: 'Article Not Found' }
}

async function getArticle(slug: string): Promise<NewsArticle | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('news_articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    if (data) return data as NewsArticle
  } catch {}
  const mock = mockNews.find(n => n.slug === slug)
  return mock || null
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-0 bg-[var(--color-navy)]">
        <div className="container pb-12">
          <Link href="/news" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to News
          </Link>
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {article.tags.map(tag => (
                <span key={tag} className="badge badge-dark">{tag}</span>
              ))}
            </div>
          )}
          <h1 className="text-white max-w-3xl mb-4">{article.title}</h1>
          {article.summary && (
            <p className="text-white/65 text-lg max-w-2xl leading-relaxed mb-6">{article.summary}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
            {article.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(article.published_at)}
              </span>
            )}
            {article.author_name && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {article.author_name}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container max-w-3xl">
          {article.cover_url && (
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl mb-10">
              <Image src={article.cover_url} alt={article.title} fill className="object-cover" />
            </div>
          )}
          {article.content ? (
            <div className="prose-content" dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <p className="text-[var(--color-muted)]">{article.summary ?? 'No content available.'}</p>
          )}
        </div>
      </section>
    </>
  )
}
