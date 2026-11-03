import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import EventForm from '@/components/admin/EventForm'
import type { Chapter } from '@/types/database'

export const metadata: Metadata = { title: 'New Event | Admin' }

async function getChapters(): Promise<Chapter[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('chapters').select('*').eq('status', 'published').order('display_order')
  return (data ?? []) as Chapter[]
}

export default async function NewEventPage() {
  const chapters = await getChapters()
  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">New Event</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">Fill in the details to create a new event.</p>
      </div>
      <EventForm chapters={chapters} mode="create" />
    </div>
  )
}
