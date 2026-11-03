import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProjectForm from '@/components/admin/ProjectForm'
import type { Chapter } from '@/types/database'

export const metadata: Metadata = { title: 'New Project | Admin' }

export default async function NewProjectPage() {
  const supabase = await createClient()
  const { data: chapters } = await supabase.from('chapters').select('id,name').order('name')

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Create Project</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Publish a new student technical project or research endeavor.
        </p>
      </div>
      <ProjectForm chapters={(chapters ?? []) as Chapter[]} mode="create" />
    </div>
  )
}
