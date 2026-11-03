import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChapterForm from '@/components/admin/ChapterForm'
import type { Chapter } from '@/types/database'

export default async function EditChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: chapter } = await supabase.from('chapters').select('*').eq('id', id).single()

  if (!chapter) notFound()

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Edit Chapter</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1 truncate">{(chapter as Chapter).name}</p>
      </div>
      <ChapterForm initialData={chapter as Chapter} mode="edit" />
    </div>
  )
}
