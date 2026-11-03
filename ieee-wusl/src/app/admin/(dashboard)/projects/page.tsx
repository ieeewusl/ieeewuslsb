import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Edit, Code2, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Project } from '@/types/database'
import AdminDeleteButton from '@/components/admin/AdminDeleteButton'
import AdminStatusToggle from '@/components/admin/AdminStatusToggle'

export const metadata: Metadata = { title: 'Projects | Admin' }

async function getProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*, chapters(name)')
    .order('created_at', { ascending: false })
  return (data ?? []) as Project[]
}

export default async function AdminProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Projects</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Manage student technical projects, innovations, and research initiatives.
          </p>
        </div>
        <Link href="/admin/projects/new" className="btn btn-primary self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-1.5" /> New Project
        </Link>
      </div>

      <div className="card overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-12 text-center">
            <Code2 className="w-12 h-12 text-[var(--color-muted-light)] mx-auto mb-3" />
            <h3 className="font-bold text-[var(--color-text)] mb-1">No projects found</h3>
            <p className="text-sm text-[var(--color-muted)] mb-4">Showcase student innovations by creating the first project.</p>
            <Link href="/admin/projects/new" className="btn btn-primary btn-sm">
              <Plus className="w-4 h-4 mr-1" /> Add Project
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--color-surface)] text-[var(--color-muted)] text-xs uppercase font-semibold border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Chapter</th>
                  <th className="px-6 py-4">Tags</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-[var(--color-surface)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--color-text)] flex items-center gap-2">
                        {proj.title}
                        {proj.featured && (
                          <span className="badge badge-accent text-[10px]">Featured</span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--color-muted)] font-mono mt-0.5">/{proj.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-muted)]">
                      {proj.chapters?.name || 'General'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {proj.tags?.slice(0, 3).map(tag => (
                          <span key={tag} className="badge badge-primary text-[10px]">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <AdminStatusToggle
                        id={proj.id}
                        currentStatus={proj.status}
                        table="projects"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/projects/${proj.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)] transition-colors"
                          title="View on site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/projects/${proj.id}/edit`}
                          className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)] transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <AdminDeleteButton
                          id={proj.id}
                          table="projects"
                          label={proj.title}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
