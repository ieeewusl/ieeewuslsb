'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import ImageUpload from './ImageUpload'

interface SettingsFormProps {
  initialSettings: Record<string, unknown>
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [settings, setSettings] = useState({
    site_logo_url: (initialSettings.site_logo_url as string) || '/wusl-sb-logo.png',
    university_name: (initialSettings.university_name as string) || 'Wayamba University of Sri Lanka',
    tagline: (initialSettings.tagline as string) || 'Empowering Future Engineers & Technologists',
    contact_email: (initialSettings.contact_email as string) || 'ieee.wusl@gmail.com',
    contact_phone: (initialSettings.contact_phone as string) || '+94 37 228 1414',
    address: (initialSettings.address as string) || 'Wayamba University of Sri Lanka, Kuliyapitiya, Sri Lanka',
    social_linkedin: (initialSettings.social_linkedin as string) || 'https://linkedin.com/company/ieee-wusl',
    social_facebook: (initialSettings.social_facebook as string) || 'https://facebook.com/ieeewusl',
    social_instagram: (initialSettings.social_instagram as string) || 'https://instagram.com/ieee_wusl',
    social_twitter: (initialSettings.social_twitter as string) || 'https://x.com/ieee_wusl',
    social_youtube: (initialSettings.social_youtube as string) || 'https://youtube.com/@ieeewusl',
    stat_members: (initialSettings.stat_members as number) || 120,
    stat_events: (initialSettings.stat_events as number) || 45,
    stat_chapters: (initialSettings.stat_chapters as number) || 4,
    stat_projects: (initialSettings.stat_projects as number) || 18,
  })

  function set(field: string, value: unknown) {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const supabase = createClient()

      // Upsert each setting key-value pair
      const entries = Object.entries(settings)
      let failed = false

      for (const [key, val] of entries) {
        const { error } = await supabase.from('site_settings').upsert({
          key,
          value: typeof val === 'number' ? val : String(val),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' })

        if (error) {
          setError(error.message)
          failed = true
          break
        }
      }

      if (!failed) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          router.refresh()
        }, 2000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* IEEE WUSL Student Branch Logo */}
      <div className="card p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-[var(--color-text)]">IEEE WUSL Student Branch Logo</h2>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            Upload the official Student Branch logo to display across the site navigation, footer, and admin dashboard.
          </p>
        </div>

        <ImageUpload
          label="Student Branch Logo"
          value={settings.site_logo_url}
          onChange={url => set('site_logo_url', url || '/wusl-sb-logo.png')}
          folder="logos"
          description="Upload WUSL SB LOGO (PNG with transparent background recommended, Max 10MB)"
          aspectRatio="wide"
        />
      </div>

      {/* General Information */}
      <div className="card p-6 space-y-5">
        <h2 className="text-base font-bold text-[var(--color-text)]">General Information</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">University Name</label>
            <input
              type="text"
              value={settings.university_name}
              onChange={e => set('university_name', e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={e => set('tagline', e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Contact Email</label>
            <input
              type="email"
              value={settings.contact_email}
              onChange={e => set('contact_email', e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Contact Phone</label>
            <input
              type="text"
              value={settings.contact_phone}
              onChange={e => set('contact_phone', e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">Physical Address</label>
          <input
            type="text"
            value={settings.address}
            onChange={e => set('address', e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Social Media Links */}
      <div className="card p-6 space-y-5">
        <h2 className="text-base font-bold text-[var(--color-text)]">Social Media Profiles</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">LinkedIn URL</label>
            <input
              type="url"
              value={settings.social_linkedin}
              onChange={e => set('social_linkedin', e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Facebook URL</label>
            <input
              type="url"
              value={settings.social_facebook}
              onChange={e => set('social_facebook', e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="label">Instagram URL</label>
            <input
              type="url"
              value={settings.social_instagram}
              onChange={e => set('social_instagram', e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Twitter / X URL</label>
            <input
              type="url"
              value={settings.social_twitter}
              onChange={e => set('social_twitter', e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">YouTube URL</label>
            <input
              type="url"
              value={settings.social_youtube}
              onChange={e => set('social_youtube', e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Key Branch Statistics */}
      <div className="card p-6 space-y-5">
        <h2 className="text-base font-bold text-[var(--color-text)]">Key Statistics (Display on Homepage)</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Active Members</label>
            <input
              type="number"
              value={settings.stat_members}
              onChange={e => set('stat_members', parseInt(e.target.value, 10) || 0)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Events Conducted</label>
            <input
              type="number"
              value={settings.stat_events}
              onChange={e => set('stat_events', parseInt(e.target.value, 10) || 0)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Chapters & Affinity</label>
            <input
              type="number"
              value={settings.stat_chapters}
              onChange={e => set('stat_chapters', parseInt(e.target.value, 10) || 0)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Projects Completed</label>
            <input
              type="number"
              value={settings.stat_projects}
              onChange={e => set('stat_projects', parseInt(e.target.value, 10) || 0)}
              className="input"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isPending}
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Save Site Settings
        </button>
      </div>
    </form>
  )
}
