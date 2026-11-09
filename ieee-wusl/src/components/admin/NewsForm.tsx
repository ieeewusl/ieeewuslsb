'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { PublicationStatus, NewsArticle } from '@/types/database'
import ImageUpload from './ImageUpload'

interface NewsFormProps {
  initialData?: Partial<NewsArticle> & { id?: string }
  mode: 'create' | 'edit'
}

export default function NewsForm({ initialData, mode }: NewsFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    title: initialData?.title ?? '',
    slug: initialData?.slug ?? '',
    summary: initialData?.summary ?? '',
    content: initialData?.content ?? '',
    cover_url: initialData?.cover_url ?? '',
    author_name: initialData?.author_name ?? '',
    tags: (initialData?.tags ?? []).join(', '),
    status: (initialData?.status ?? 'draft') as PublicationStatus,
    featured: initialData?.featured ?? false,
    published_at: initialData?.published_at
      ? new Date(initialData.published_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  })

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const supabase = createClient()
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
      const publishedAtValue = form.published_at
        ? new Date(form.published_at).toISOString()
        : form.status === 'published'
        ? new Date().toISOString()
        : null

      const payload = {
        title: form.title,
        slug: form.slug,
        summary: form.summary || null,
        content: form.content || null,
        cover_url: form.cover_url || null,
        author_name: form.author_name || null,
        tags,
        status: form.status,
        featured: form.featured,
        published_at: publishedAtValue,
      }

      let err
      if (mode === 'edit' && initialData?.id) {
        const { error } = await supabase.from('news_articles').update(payload).eq('id', initialData.id)
        err = error
      } else {
        const { error } = await supabase.from('news_articles').insert([payload])
        err = error
      }

      if (err) { setError(err.message); return }

      setSuccess(true)
      setTimeout(() => { router.push('/admin/news'); router.refresh() }, 800)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700">
          <AlertCircle className="w-4.5 h-4.5 mt-0.5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700">
          <CheckCircle2 className="w-4.5 h-4.5" />
          <span className="text-sm">Article saved successfully!</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-[var(--color-text)]">Article Content</h2>

            <div>
              <label className="label" htmlFor="article-title">Title <span className="text-red-500">*</span></label>
              <input
                id="article-title"
                type="text"
                required
                value={form.title}
                onChange={e => { const v = e.target.value; setForm(p => ({ ...p, title: v, slug: mode === 'create' ? slugify(v) : p.slug })) }}
                className="input text-lg font-semibold"
                placeholder="Article title…"
              />
            </div>

            <div>
              <label className="label" htmlFor="article-slug">URL Slug <span className="text-red-500">*</span></label>
              <input id="article-slug" type="text" required value={form.slug} onChange={e => set('slug', e.target.value)} className="input font-mono text-sm" />
            </div>

            <div>
              <label className="label" htmlFor="summary">Summary / Excerpt</label>
              <textarea id="summary" value={form.summary} onChange={e => set('summary', e.target.value)} rows={3} className="input resize-none" placeholder="Brief description of this article…" />
            </div>

            <div>
              <label className="label" htmlFor="content">Content (HTML)</label>
              <textarea
                id="content"
                value={form.content}
                onChange={e => set('content', e.target.value)}
                rows={16}
                className="input resize-y font-mono text-sm"
                placeholder="<p>Article content (HTML is supported)…</p>"
              />
              <p className="text-xs text-[var(--color-muted)] mt-1.5">HTML formatting is supported. Use &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;strong&gt;, etc.</p>
            </div>
          </div>

          {/* Article Cover Image */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-[var(--color-text)]">Cover Photo & Banner</h2>
            <ImageUpload
              label="Article Featured Image"
              value={form.cover_url}
              onChange={url => set('cover_url', url)}
              folder="news"
              description="Upload featured image or banner (PNG, JPG, WEBP - Max 10MB)"
              aspectRatio="wide"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-[var(--color-text)]">Publish</h2>

            <div>
              <label className="label" htmlFor="art-status">Status</label>
              <select id="art-status" value={form.status} onChange={e => set('status', e.target.value as PublicationStatus)} className="input">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="label" htmlFor="published_at">Publication Date & Time</label>
              <input
                id="published_at"
                type="datetime-local"
                value={form.published_at}
                onChange={e => set('published_at', e.target.value)}
                className="input text-sm"
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">Articles are sorted by this date (newest date appears first).</p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60">
              <div className="flex items-start gap-2.5">
                <input
                  id="featured"
                  type="checkbox"
                  checked={form.featured}
                  onChange={e => set('featured', e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer shrink-0"
                />
                <div>
                  <label htmlFor="featured" className="text-sm font-semibold text-amber-950 cursor-pointer block leading-tight">
                    Feature on homepage
                  </label>
                  <p className="text-xs text-amber-900/70 mt-0.5 leading-snug">
                    Pins this article to the top of the Homepage news section.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={isPending} className="btn btn-primary btn-sm flex-1 justify-center">
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : mode === 'edit' ? 'Update Article' : 'Publish'}
              </button>
              <button type="button" onClick={() => router.back()} className="btn btn-outline btn-sm">Cancel</button>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-[var(--color-text)]">Author & Tags</h2>
            <div>
              <label className="label" htmlFor="author_name">Author Name</label>
              <input id="author_name" type="text" value={form.author_name} onChange={e => set('author_name', e.target.value)} className="input" placeholder="John Doe" />
            </div>
            <div>
              <label className="label" htmlFor="tags">Tags (comma separated)</label>
              <input id="tags" type="text" value={form.tags} onChange={e => set('tags', e.target.value)} className="input" placeholder="ai, robotics, workshop" />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
