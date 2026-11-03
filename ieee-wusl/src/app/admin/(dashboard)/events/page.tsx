import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, Calendar, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime, categoryLabel } from '@/lib/utils'
import type { Event } from '@/types/database'
import AdminDeleteButton from '@/components/admin/AdminDeleteButton'
import AdminStatusToggle from '@/components/admin/AdminStatusToggle'

export const metadata: Metadata = { title: 'Events | Admin' }

export const revalidate = 0

async function getEvents(): Promise<Event[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('start_at', { ascending: false })
    return (data ?? []) as Event[]
  } catch {
    return []
  }
}

export default async function AdminEventsPage() {
  const events = await getEvents()

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Events</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">{events.length} total events</p>
        </div>
        <Link href="/admin/events/new" className="btn btn-primary btn-sm">
          <Plus className="w-4 h-4" /> New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="card p-16 text-center">
          <Calendar className="w-12 h-12 text-[var(--color-muted-light)] mx-auto mb-4" />
          <h2 className="font-bold text-[var(--color-text)] mb-2">No events yet</h2>
          <p className="text-sm text-[var(--color-muted)] mb-6">Create your first event to get started.</p>
          <Link href="/admin/events/new" className="btn btn-primary btn-sm mx-auto">
            <Plus className="w-4 h-4" /> Create Event
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-muted)] text-xs uppercase tracking-wide">Event</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-muted)] text-xs uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-muted)] text-xs uppercase tracking-wide hidden lg:table-cell">Category</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-muted)] text-xs uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-muted)] text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {events.map(event => (
                <tr key={event.id} className="hover:bg-[var(--color-surface)] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-[var(--color-text)] line-clamp-1">{event.title}</div>
                    <div className="text-xs text-[var(--color-muted-light)] mt-0.5">{event.slug}</div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-[var(--color-muted)]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(event.start_at)}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="badge badge-muted">{categoryLabel(event.category)}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <AdminStatusToggle
                      id={event.id}
                      table="events"
                      currentStatus={event.status}
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <Link
                        href={`/events/${event.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                        title="View public"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <AdminDeleteButton
                        id={event.id}
                        table="events"
                        label={event.title}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
