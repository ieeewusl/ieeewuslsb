import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import SettingsForm from '@/components/admin/SettingsForm'

export const metadata: Metadata = { title: 'Site Settings | Admin' }

async function getSettings(): Promise<Record<string, unknown>> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('site_settings').select('*')
    if (!data) return {}
    return (data as Array<{ key: string; value: unknown }>).reduce((acc, row) => {
      acc[row.key] = row.value
      return acc
    }, {} as Record<string, unknown>)
  } catch {
    return {}
  }
}

export default async function AdminSettingsPage() {
  const settings = await getSettings()

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Site Settings</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Configure global site information, contact details, social links, and public statistics.
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  )
}
