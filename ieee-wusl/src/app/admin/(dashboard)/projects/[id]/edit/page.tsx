import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProjectForm from '@/components/admin/ProjectForm'
import type { Project, Chapter } from '@/types/database'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [projectRes, chaptersRes] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).single(),
    supabase.from('chapters').select('id,name').order('name'),
  ])

  if (!projectRes.data) notFound()

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Edit Project</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1 truncate">{(projectRes.data as Project).title}</p>
      </div>
      <ProjectForm
        initialData={projectRes.data as Project}
        chapters={(chaptersRes.data ?? []) as Chapter[]}
        mode="edit"
      />
    </div>
  )
}
