'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { PublicationStatus, CommitteeTerm, TeamMember } from '@/types/database'
import ImageUpload from './ImageUpload'

interface MemberFormData {
  full_name: string
  role_title: string
  bio: string
  email: string
  linkedin_url: string
  photo_url: string | null
  display_order: number
  term_id: string
  committee_type: 'executive' | 'standing'
  status: PublicationStatus
}

interface MemberFormProps {
  initialData?: (Partial<MemberFormData> | Partial<TeamMember>) & { id?: string; photo_url?: string | null }
  terms: CommitteeTerm[]
  mode: 'create' | 'edit'
}

export default function TeamMemberForm({ initialData, terms, mode }: MemberFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState<MemberFormData>({
    full_name: initialData?.full_name ?? '',
    role_title: initialData?.role_title ?? '',
    bio: initialData?.bio ?? '',
    email: initialData?.email ?? '',
    linkedin_url: initialData?.linkedin_url ?? '',
    photo_url: initialData?.photo_url ?? null,
    display_order: initialData?.display_order ?? 0,
    term_id: initialData?.term_id ?? '',
    committee_type: (initialData as any)?.committee_type ?? 'executive',
    status: initialData?.status ?? 'draft',
  })

  function set(field: keyof MemberFormData, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.full_name.trim() || !form.role_title.trim()) {
      setError('Full name and role/title are required.')
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const payload: Record<string, unknown> = {
        full_name: form.full_name,
        role_title: form.role_title,
        bio: form.bio || null,
        email: form.email || null,
        linkedin_url: form.linkedin_url || null,
        photo_url: form.photo_url || null,
        photo_path: form.photo_url || null,
        display_order: Number(form.display_order) || 0,
        term_id: form.term_id || null,
        committee_type: form.committee_type,
        status: form.status,
      }

      let memberId = initialData?.id

      if (mode === 'create') {
        let { data, error } = await supabase.from('team_members').insert([payload]).select('id').single()
        if (error && error.message.toLowerCase().includes('committee_type')) {
          const fallbackPayload = { ...payload }
          delete fallbackPayload.committee_type
          const res = await supabase.from('team_members').insert([fallbackPayload]).select('id').single()
          data = res.data
          error = res.error
        }
        if (error || !data) { setError(error?.message || 'Failed to create member'); return }
        memberId = data.id
      } else {
        let { error } = await supabase.from('team_members').update(payload).eq('id', memberId!)
        if (error && error.message.toLowerCase().includes('committee_type')) {
          const fallbackPayload = { ...payload }
          delete fallbackPayload.committee_type
          const res = await supabase.from('team_members').update(fallbackPayload).eq('id', memberId!)
          error = res.error
        }
        if (error) { setError(error.message); return }
      }

      setSuccess(true)
      setTimeout(() => { router.push('/admin/team'); router.refresh() }, 800)
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
          <span className="text-sm">Member saved!</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-[var(--color-text)]">Member Information</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="full_name">Full Name <span className="text-red-500">*</span></label>
                <input id="full_name" type="text" required value={form.full_name} onChange={e => set('full_name', e.target.value)} className="input" placeholder="Ashan Perera" />
              </div>
              <div>
                <label className="label" htmlFor="role_title">Role / Title <span className="text-red-500">*</span></label>
                <input id="role_title" type="text" required value={form.role_title} onChange={e => set('role_title', e.target.value)} className="input" placeholder="Chairperson" />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="bio">Biography</label>
              <textarea id="bio" value={form.bio} onChange={e => set('bio', e.target.value)} rows={4} className="input resize-none" placeholder="Brief biography…" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="email">Email (optional)</label>
                <input id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input" placeholder="member@wusl.ac.lk" />
              </div>
              <div>
                <label className="label" htmlFor="linkedin_url">LinkedIn URL (optional)</label>
                <input id="linkedin_url" type="url" value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} className="input" placeholder="https://linkedin.com/in/…" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* Photo upload */}
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-[var(--color-text)]">Profile Photo</h2>
            <ImageUpload
              label="Member Photo"
              value={form.photo_url}
              onChange={url => set('photo_url', url)}
              folder="team"
              description="Square portrait photo (PNG, JPG, WEBP - Max 10MB)"
              aspectRatio="square"
            />
          </div>

          {/* Publish */}
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

            <div>
              <label className="label" htmlFor="committee_type">Committee Type</label>
              <select
                id="committee_type"
                value={form.committee_type}
                onChange={e => set('committee_type', e.target.value as 'executive' | 'standing')}
                className="input"
              >
                <option value="executive">Executive Committee</option>
                <option value="standing">Standing Committee</option>
              </select>
              <span className="text-xs text-[var(--color-muted)] mt-1 block">
                Executive members appear on both the Home Page and Team page. Standing members appear under Standing Committee on the Team page.
              </span>
            </div>

            <div>
              <label className="label" htmlFor="term_id">Committee Term</label>
              <select id="term_id" value={form.term_id} onChange={e => set('term_id', e.target.value)} className="input">
                <option value="">— No term —</option>
                {terms.map(t => (
                  <option key={t.id} value={t.id}>{t.label}{t.is_current ? ' (Current)' : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="display_order">Display Order</label>
              <input id="display_order" type="number" min={0} value={form.display_order} onChange={e => set('display_order', parseInt(e.target.value) || 0)} className="input" />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={isPending} className="btn btn-primary btn-sm flex-1 justify-center">
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : mode === 'edit' ? 'Update Member' : 'Add Member'}
              </button>
              <button type="button" onClick={() => router.back()} className="btn btn-outline btn-sm">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
