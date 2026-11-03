import type { Metadata } from 'next'
import ChapterForm from '@/components/admin/ChapterForm'

export const metadata: Metadata = {
  title: 'New Chapter | Admin',
}

export default function NewChapterPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Create Chapter</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Add a new technical chapter or student affinity group to IEEE WUSL.
        </p>
      </div>
      <ChapterForm mode="create" />
    </div>
  )
}
