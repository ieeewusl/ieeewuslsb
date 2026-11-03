import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Edit, Newspaper } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { NewsArticle } from '@/types/database'
import AdminDeleteButton from '@/components/admin/AdminDeleteButton'
import AdminStatusToggle from '@/components/admin/AdminStatusToggle'

export const metadata: Metadata = { title: 'News | Admin' }
export const revalidate = 0

async function getArticles(): Promise<Partial<NewsArticle>[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('news_articles')
    .select('id,title,slug,status,published_at,author_name')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function AdminNewsPage() {
  const articles = await getArticles()

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">News & Articles</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">{articles.length} articles</p>
        </div>
        <Link href="/admin/news/new" className="btn btn-primary btn-sm">
          <Plus className="w-4 h-4" /> New Article
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="card p-16 text-center">
          <Newspaper className="w-12 h-12 text-[var(--color-muted-light)] mx-auto mb-4" />
          <h2 className="font-bold text-[var(--color-text)] mb-2">No articles yet</h2>
          <p className="text-sm text-[var(--color-muted)] mb-6">Create your first news article or announcement.</p>
          <Link href="/admin/news/new" className="btn btn-primary btn-sm mx-auto">
            <Plus className="w-4 h-4" /> Write Article
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide hidden md:table-cell">Author</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide hidden lg:table-cell">Published</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {articles.map(article => (
                <tr key={article.id} className="hover:bg-[var(--color-surface)] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-[var(--color-text)] line-clamp-1">{article.title}</div>
                    <div className="text-xs text-[var(--color-muted-light)] mt-0.5">{article.slug}</div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-[var(--color-muted)]">{article.author_name ?? '—'}</td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-[var(--color-muted)]">
                    {article.published_at ? formatDate(article.published_at) : '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <AdminStatusToggle id={article.id!} table="news_articles" currentStatus={article.status!} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <Link href={`/admin/news/${article.id}/edit`} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <AdminDeleteButton id={article.id!} table="news_articles" label={article.title!} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
