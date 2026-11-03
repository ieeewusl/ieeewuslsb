'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { PublicationStatus, Chapter } from '@/types/database'

interface ChapterFormProps {
  initialData?: Partial<Chapter> & { id?: string }
  mode: 'create' | 'edit'
}

export default function ChapterForm({ initialData, mode }: ChapterFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    slug: initialData?.slug ?? '',
    short_desc: initialData?.short_desc ?? '',
    description: initialData?.description ?? '',
    website_url: initialData?.website_url ?? '',
    logo_url: initialData?.logo_url ?? '',
    founded_year: initialData?.founded_year ? String(initialData.founded_year) : '',
    display_order: initialData?.display_order ?? 0,
    status: (initialData?.status ?? 'published') as PublicationStatus,
  })

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    setForm(prev => ({
      ...prev,
      name,
      slug: mode === 'create' ? slugify(name) : prev.slug,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.name.trim() || !form.slug.trim()) {
      setError('Chapter name and slug are required.')
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const payload = {
        name: form.name,
        slug: form.slug,
        short_desc: form.short_desc || null,
        description: form.description || null,
        website_url: form.website_url || null,
        logo_url: form.logo_url || null,
        founded_year: form.founded_year ? parseInt(form.founded_year, 10) : null,
        display_order: Number(form.display_order) || 0,
        status: form.status,
      }

      let err
      if (mode === 'edit' && initialData?.id) {
        const { error } = await supabase.from('chapters').update(payload).eq('id', initialData.id)
        err = error
      } else {
        const { error } = await supabase.from('chapters').insert([payload])
        err = error
      }

      if (err) {
        setError(err.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/admin/chapters')
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
          <span>Chapter {mode === 'create' ? 'created' : 'saved'} successfully! Redirecting...</span>
        </div>
      )}

      <div className="card p-6 space-y-5">
        <h2 className="text-base font-bold text-[var(--color-text)]">Chapter Details</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Chapter Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Computer Society"
              value={form.name}
              onChange={handleNameChange}
              className="input"
            />
          </div>

          <div>
            <label className="label">Slug (URL) *</label>
            <input
              type="text"
              required
              placeholder="computer-society"
              value={form.slug}
              onChange={e => set('slug', slugify(e.target.value))}
              className="input font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <label className="label">Short Description</label>
          <input
            type="text"
            placeholder="A brief one-line description of the chapter"
            value={form.short_desc}
            onChange={e => set('short_desc', e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="label">Full Description & Mission</label>
          <textarea
            rows={5}
            placeholder="Detailed description, vision, and activities of this chapter..."
            value={form.description}
            onChange={e => set('description', e.target.value)}
            className="input"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="label">Founded Year</label>
            <input
              type="number"
              placeholder="2021"
              value={form.founded_year}
              onChange={e => set('founded_year', e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">External Website / IEEE Link</label>
            <input
              type="url"
              placeholder="https://computer.org"
              value={form.website_url}
              onChange={e => set('website_url', e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Logo Image URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={form.logo_url}
              onChange={e => set('logo_url', e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-3 border-t border-[var(--color-border)]">
          <div>
            <label className="label">Display Order</label>
            <input
              type="number"
              value={form.display_order}
              onChange={e => set('display_order', parseInt(e.target.value, 10) || 0)}
              className="input"
            />
            <span className="text-xs text-[var(--color-muted)] mt-1 block">
              Lower numbers appear first on the public chapters page.
            </span>
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
          {mode === 'create' ? 'Create Chapter' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
