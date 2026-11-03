'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import { Loader2, AlertCircle, CheckCircle2, Upload, X } from 'lucide-react'
import type { PublicationStatus, CommitteeTerm, TeamMember } from '@/types/database'
import Image from 'next/image'

interface MemberFormData {
  full_name: string
  role_title: string
  bio: string
  email: string
  linkedin_url: string
  display_order: number
  term_id: string
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
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photo_url ?? null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const [form, setForm] = useState<MemberFormData>({
    full_name: initialData?.full_name ?? '',
    role_title: initialData?.role_title ?? '',
    bio: initialData?.bio ?? '',
    email: initialData?.email ?? '',
    linkedin_url: initialData?.linkedin_url ?? '',
    display_order: initialData?.display_order ?? 0,
    term_id: initialData?.term_id ?? '',
    status: initialData?.status ?? 'draft',
  })

  function set(field: keyof MemberFormData, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB.'); return }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setError(null)
  }

  async function uploadPhoto(file: File, memberId: string): Promise<string | null> {
    setUploadingPhoto(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `team/${memberId}.${ext}`
    const { error } = await supabase.storage.from('media').upload(path, file, { upsert: true })
    if (error) { setError(`Photo upload failed: ${error.message}`); setUploadingPhoto(false); return null }
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)
    setUploadingPhoto(false)
    return publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const supabase = createClient()
      const payload: Record<string, unknown> = {
        ...form,
        term_id: form.term_id || null,
        email: form.email || null,
        linkedin_url: form.linkedin_url || null,
        bio: form.bio || null,
      }

      let memberId = initialData?.id

      if (mode === 'create') {
        const { data, error } = await supabase.from('team_members').insert([payload]).select('id').single()
        if (error) { setError(error.message); return }
        memberId = data.id
      } else {
        const { error } = await supabase.from('team_members').update(payload).eq('id', memberId!)
        if (error) { setError(error.message); return }
      }

      if (photoFile && memberId) {
        const url = await uploadPhoto(photoFile, memberId)
        if (url) {
          await supabase.from('team_members').update({ photo_url: url, photo_path: `team/${memberId}.${photoFile.name.split('.').pop()}` }).eq('id', memberId)
        }
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
          <div className="card p-5">
            <h2 className="font-semibold text-[var(--color-text)] mb-4">Profile Photo</h2>
            {photoPreview ? (
              <div className="relative">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-3">
                  <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                </div>
                <button type="button" onClick={() => { setPhotoPreview(null); setPhotoFile(null) }} className="flex items-center gap-1.5 mx-auto text-xs text-red-500 hover:text-red-700 transition-colors">
                  <X className="w-3 h-3" /> Remove photo
                </button>
              </div>
            ) : (
              <label htmlFor="photo" className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] cursor-pointer transition-colors">
                <Upload className="w-8 h-8 text-[var(--color-muted-light)]" />
                <span className="text-sm text-[var(--color-muted)]">Click to upload photo</span>
                <span className="text-xs text-[var(--color-muted-light)]">JPG, PNG · Max 5 MB</span>
                <input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            )}
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
              <button type="submit" disabled={isPending || uploadingPhoto} className="btn btn-primary btn-sm flex-1 justify-center">
                {isPending || uploadingPhoto ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : mode === 'edit' ? 'Update Member' : 'Add Member'}
              </button>
              <button type="button" onClick={() => router.back()} className="btn btn-outline btn-sm">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
