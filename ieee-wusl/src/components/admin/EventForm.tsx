'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { PublicationStatus, EventCategory, Chapter, Event } from '@/types/database'

interface EventFormData {
  title: string
  slug: string
  summary: string
  description: string
  category: EventCategory
  start_at: string
  end_at: string
  venue: string
  is_online: boolean
  meeting_url: string
  registration_url: string
  organizer: string
  chapter_id: string
  status: PublicationStatus
  featured: boolean
}

interface EventFormProps {
  initialData?: (Partial<EventFormData> | Partial<Event>) & { id?: string }
  chapters: Chapter[]
  mode: 'create' | 'edit'
}

export default function EventForm({ initialData, chapters, mode }: EventFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState<EventFormData>({
    title: initialData?.title ?? '',
    slug: initialData?.slug ?? '',
    summary: initialData?.summary ?? '',
    description: initialData?.description ?? '',
    category: initialData?.category ?? 'other',
    start_at: initialData?.start_at ? new Date(initialData.start_at).toISOString().slice(0, 16) : '',
    end_at: initialData?.end_at ? new Date(initialData.end_at).toISOString().slice(0, 16) : '',
    venue: initialData?.venue ?? '',
    is_online: initialData?.is_online ?? false,
    meeting_url: initialData?.meeting_url ?? '',
    registration_url: initialData?.registration_url ?? '',
    organizer: initialData?.organizer ?? '',
    chapter_id: initialData?.chapter_id ?? '',
    status: initialData?.status ?? 'draft',
    featured: initialData?.featured ?? false,
  })

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value
    setForm(prev => ({
      ...prev,
      title,
      slug: mode === 'create' ? slugify(title) : prev.slug,
    }))
  }

  function set(field: keyof EventFormData, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const supabase = createClient()
      const payload = {
        ...form,
        start_at: form.start_at ? new Date(form.start_at).toISOString() : null,
        end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
        chapter_id: form.chapter_id || null,
        meeting_url: form.meeting_url || null,
        registration_url: form.registration_url || null,
        venue: form.venue || null,
        organizer: form.organizer || null,
      }

      let err
      if (mode === 'edit' && initialData?.id) {
        const { error } = await supabase.from('events').update(payload).eq('id', initialData.id)
        err = error
      } else {
        const { error } = await supabase.from('events').insert([payload])
        err = error
      }

      if (err) {
        setError(err.message)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/events')
        router.refresh()
      }, 800)
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
          <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
          <span className="text-sm">Event saved successfully!</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-[var(--color-text)]">Event Details</h2>

            <div>
              <label className="label" htmlFor="title">Title <span className="text-red-500">*</span></label>
              <input id="title" type="text" required value={form.title} onChange={handleTitleChange} className="input" placeholder="IEEE Workshop on Machine Learning" />
            </div>

            <div>
              <label className="label" htmlFor="slug">URL Slug <span className="text-red-500">*</span></label>
              <input id="slug" type="text" required value={form.slug} onChange={e => set('slug', e.target.value)} className="input font-mono text-sm" placeholder="ieee-workshop-machine-learning" />
            </div>

            <div>
              <label className="label" htmlFor="summary">Summary</label>
              <textarea id="summary" value={form.summary} onChange={e => set('summary', e.target.value)} rows={2} className="input resize-none" placeholder="Brief description of the event…" />
            </div>

            <div>
              <label className="label" htmlFor="description">Full Description</label>
              <textarea id="description" value={form.description} onChange={e => set('description', e.target.value)} rows={6} className="input resize-y" placeholder="Detailed event description…" />
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-[var(--color-text)]">Date & Location</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="start_at">Start Date & Time <span className="text-red-500">*</span></label>
                <input id="start_at" type="datetime-local" required value={form.start_at} onChange={e => set('start_at', e.target.value)} className="input" />
              </div>
              <div>
                <label className="label" htmlFor="end_at">End Date & Time</label>
                <input id="end_at" type="datetime-local" value={form.end_at} onChange={e => set('end_at', e.target.value)} className="input" />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="venue">Venue</label>
              <input id="venue" type="text" value={form.venue} onChange={e => set('venue', e.target.value)} className="input" placeholder="Main Auditorium, Wayamba University" />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="is_online"
                type="checkbox"
                checked={form.is_online}
                onChange={e => set('is_online', e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--color-primary)]"
              />
              <label htmlFor="is_online" className="text-sm font-medium text-[var(--color-text)]">Online event</label>
            </div>

            {form.is_online && (
              <div>
                <label className="label" htmlFor="meeting_url">Meeting URL</label>
                <input id="meeting_url" type="url" value={form.meeting_url} onChange={e => set('meeting_url', e.target.value)} className="input" placeholder="https://meet.google.com/…" />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-[var(--color-text)]">Publish</h2>

            <div>
              <label className="label" htmlFor="status">Status</label>
              <select id="status" value={form.status} onChange={e => set('status', e.target.value as PublicationStatus)} className="input">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input id="featured" type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 rounded accent-[var(--color-primary)]" />
              <label htmlFor="featured" className="text-sm font-medium text-[var(--color-text)]">Feature on homepage</label>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={isPending} className="btn btn-primary btn-sm flex-1 justify-center">
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : mode === 'edit' ? 'Update' : 'Create Event'}
              </button>
              <button type="button" onClick={() => router.back()} className="btn btn-outline btn-sm">Cancel</button>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-[var(--color-text)]">Meta</h2>

            <div>
              <label className="label" htmlFor="category">Category</label>
              <select id="category" value={form.category} onChange={e => set('category', e.target.value as EventCategory)} className="input">
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="competition">Competition</option>
                <option value="hackathon">Hackathon</option>
                <option value="webinar">Webinar</option>
                <option value="conference">Conference</option>
                <option value="social">Social</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="label" htmlFor="organizer">Organizer</label>
              <input id="organizer" type="text" value={form.organizer} onChange={e => set('organizer', e.target.value)} className="input" placeholder="IEEE WUSL" />
            </div>

            <div>
              <label className="label" htmlFor="chapter_id">Chapter</label>
              <select id="chapter_id" value={form.chapter_id} onChange={e => set('chapter_id', e.target.value)} className="input">
                <option value="">— None —</option>
                {chapters.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="registration_url">Registration URL</label>
              <input id="registration_url" type="url" value={form.registration_url} onChange={e => set('registration_url', e.target.value)} className="input" placeholder="https://forms.gle/…" />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
