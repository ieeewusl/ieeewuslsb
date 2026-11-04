'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { PublicationStatus, Chapter, Project } from '@/types/database'
import ImageUpload from './ImageUpload'

interface ProjectFormProps {
  initialData?: Partial<Project> & { id?: string }
  chapters: Chapter[]
  mode: 'create' | 'edit'
}

export default function ProjectForm({ initialData, chapters, mode }: ProjectFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    title: initialData?.title ?? '',
    slug: initialData?.slug ?? '',
    summary: initialData?.summary ?? '',
    description: initialData?.description ?? '',
    cover_url: initialData?.cover_url ?? '',
    github_url: initialData?.github_url ?? '',
    demo_url: initialData?.demo_url ?? '',
    chapter_id: initialData?.chapter_id ?? '',
    members: (initialData?.members ?? []).join(', '),
    tags: (initialData?.tags ?? []).join(', '),
    start_date: initialData?.start_date ?? '',
    end_date: initialData?.end_date ?? '',
    featured: initialData?.featured ?? false,
    status: (initialData?.status ?? 'published') as PublicationStatus,
  })

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value
    setForm(prev => ({
      ...prev,
      title,
      slug: mode === 'create' ? slugify(title) : prev.slug,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.title.trim() || !form.slug.trim()) {
      setError('Project title and slug are required.')
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const payload = {
        title: form.title,
        slug: form.slug,
        summary: form.summary || null,
        description: form.description || null,
        cover_url: form.cover_url || null,
        github_url: form.github_url || null,
        demo_url: form.demo_url || null,
        chapter_id: form.chapter_id || null,
        members: form.members ? form.members.split(',').map(s => s.trim()).filter(Boolean) : [],
        tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        featured: form.featured,
        status: form.status,
      }

      let err
      if (mode === 'edit' && initialData?.id) {
        const { error } = await supabase.from('projects').update(payload).eq('id', initialData.id)
        err = error
      } else {
        const { error } = await supabase.from('projects').insert([payload])
        err = error
      }

      if (err) {
        setError(err.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/admin/projects')
          router.refresh()
        }, 1000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Project {mode === 'create' ? 'created' : 'saved'} successfully! Redirecting...</span>
        </div>
      )}

      <div className="card p-6 space-y-5">
        <h2 className="text-base font-bold text-[var(--color-text)]">Project Overview</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Project Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Autonomous Maze Solving Robot"
              value={form.title}
              onChange={handleTitleChange}
              className="input"
            />
          </div>

          <div>
            <label className="label">Slug (URL) *</label>
            <input
              type="text"
              required
              placeholder="autonomous-maze-solving-robot"
              value={form.slug}
              onChange={e => set('slug', slugify(e.target.value))}
              className="input font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <label className="label">Short Summary</label>
          <input
            type="text"
            placeholder="A one-line punchy description of the project"
            value={form.summary}
            onChange={e => set('summary', e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="label">Full Details & Documentation</label>
          <textarea
            rows={5}
            placeholder="Technical details, methodology, achievements, outcomes..."
            value={form.description}
            onChange={e => set('description', e.target.value)}
            className="input"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Technical Chapter / Affinity</label>
            <select
              value={form.chapter_id}
              onChange={e => set('chapter_id', e.target.value)}
              className="input"
            >
              <option value="">None / IEEE WUSL General</option>
              {chapters.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Team Members (comma-separated)</label>
            <input
              type="text"
              placeholder="Kamal Perera, Nimal Silva"
              value={form.members}
              onChange={e => set('members', e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div>
          <ImageUpload
            label="Cover Image"
            value={form.cover_url}
            onChange={url => set('cover_url', url)}
            folder="projects"
            description="Upload project banner or showcase photo (PNG, JPG, WEBP)"
            aspectRatio="wide"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">GitHub Repository URL</label>
            <input
              type="url"
              placeholder="https://github.com/..."
              value={form.github_url}
              onChange={e => set('github_url', e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Live Demo / Paper URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={form.demo_url}
              onChange={e => set('demo_url', e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="label">Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="Robotics, Arduino, C++"
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={form.start_date}
              onChange={e => set('start_date', e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">End Date (optional)</label>
            <input
              type="date"
              value={form.end_date}
              onChange={e => set('end_date', e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-3 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3 pt-6">
            <input
              id="featured"
              type="checkbox"
              checked={form.featured}
              onChange={e => set('featured', e.target.checked)}
              className="w-4 h-4 rounded text-[var(--color-primary)]"
            />
            <label htmlFor="featured" className="text-sm font-medium text-[var(--color-text)] cursor-pointer">
              Feature on Homepage & Projects showcase
            </label>
          </div>

          <div>
            <label className="label">Status</label>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value as PublicationStatus)}
              className="input"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-secondary"
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isPending}
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {mode === 'create' ? 'Create Project' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
