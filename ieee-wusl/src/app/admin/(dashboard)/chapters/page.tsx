import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Edit, Cpu } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Chapter } from '@/types/database'
import AdminDeleteButton from '@/components/admin/AdminDeleteButton'
import AdminStatusToggle from '@/components/admin/AdminStatusToggle'

export const metadata: Metadata = { title: 'Chapters | Admin' }
export const revalidate = 0

async function getChapters(): Promise<Chapter[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('chapters').select('*').order('display_order')
  return (data ?? []) as Chapter[]
}

export default async function AdminChaptersPage() {
  const chapters = await getChapters()

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Technical Chapters</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">{chapters.length} chapters</p>
        </div>
        <Link href="/admin/chapters/new" className="btn btn-primary btn-sm">
          <Plus className="w-4 h-4" /> Add Chapter
        </Link>
      </div>

      {chapters.length === 0 ? (
        <div className="card p-16 text-center">
          <Cpu className="w-12 h-12 text-[var(--color-muted-light)] mx-auto mb-4" />
          <p className="text-[var(--color-muted)]">No chapters yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chapters.map(chapter => (
            <div key={chapter.id} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[var(--color-text)]">{chapter.name}</div>
                <div className="text-xs text-[var(--color-muted-light)] mt-0.5">/chapters/{chapter.slug}</div>
              </div>
              <AdminStatusToggle id={chapter.id} table="chapters" currentStatus={chapter.status} />
              <div className="flex items-center gap-1">
                <Link href={`/admin/chapters/${chapter.id}/edit`} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-muted)] transition-colors">
                  <Edit className="w-4 h-4" />
                </Link>
                <AdminDeleteButton id={chapter.id} table="chapters" label={chapter.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
