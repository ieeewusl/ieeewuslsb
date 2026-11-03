import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EventForm from '@/components/admin/EventForm'
import type { Chapter, Event } from '@/types/database'

export const metadata: Metadata = { title: 'Edit Event | Admin' }

async function getData(id: string) {
  const supabase = await createClient()
  const [eventRes, chaptersRes] = await Promise.all([
    supabase.from('events').select('*').eq('id', id).single(),
    supabase.from('chapters').select('*').eq('status', 'published').order('display_order'),
  ])
  return {
    event: eventRes.data as Event | null,
    chapters: (chaptersRes.data ?? []) as Chapter[],
  }
}

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { event, chapters } = await getData(id)
  if (!event) notFound()

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Edit Event</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1 truncate">{event.title}</p>
      </div>
      <EventForm initialData={event} chapters={chapters} mode="edit" />
    </div>
  )
}
