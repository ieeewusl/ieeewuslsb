'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { PublicationStatus, GalleryAlbum } from '@/types/database'

interface GalleryAlbumFormProps {
  initialData?: Partial<GalleryAlbum> & { id?: string }
  mode: 'create' | 'edit'
}

export default function GalleryAlbumForm({ initialData, mode }: GalleryAlbumFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    title: initialData?.title ?? '',
    slug: initialData?.slug ?? '',
    description: initialData?.description ?? '',
    cover_url: initialData?.cover_url ?? '',
    event_date: initialData?.event_date ?? '',
    display_order: initialData?.display_order ?? 0,
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
      setError('Title and slug are required.')
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const payload = {
        title: form.title,
        slug: form.slug,
        description: form.description || null,
        cover_url: form.cover_url || null,
        event_date: form.event_date || null,
        display_order: Number(form.display_order) || 0,
        status: form.status,
      }

      let err
      if (mode === 'edit' && initialData?.id) {
        const { error } = await supabase.from('gallery_albums').update(payload).eq('id', initialData.id)
        err = error
      } else {
        const { error } = await supabase.from('gallery_albums').insert([payload])
        err = error
      }

      if (err) {
        setError(err.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/admin/gallery')
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
          <span>Album {mode === 'create' ? 'created' : 'saved'} successfully! Redirecting...</span>
        </div>
      )}

      <div className="card p-6 space-y-5">
        <h2 className="text-base font-bold text-[var(--color-text)]">Album Information</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Album Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Annual General Meeting 2024"
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
              placeholder="agm-2024"
              value={form.slug}
              onChange={e => set('slug', slugify(e.target.value))}
              className="input font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            rows={4}
            placeholder="A brief overview or memories from this event..."
            value={form.description}
            onChange={e => set('description', e.target.value)}
            className="input"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Cover Image URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={form.cover_url}
              onChange={e => set('cover_url', e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Event Date</label>
            <input
              type="date"
              value={form.event_date}
              onChange={e => set('event_date', e.target.value)}
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
              Lower numbers appear first in the gallery.
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
          {mode === 'create' ? 'Create Album' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
