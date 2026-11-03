import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewsForm from '@/components/admin/NewsForm'
import type { NewsArticle } from '@/types/database'

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('news_articles').select('*').eq('id', id).single()
  if (!data) notFound()

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Edit Article</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1 truncate">{data.title}</p>
      </div>
      <NewsForm initialData={data as NewsArticle} mode="edit" />
    </div>
  )
}
