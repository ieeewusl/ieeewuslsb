import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Calendar, Users, Newspaper, Code2, Image, Cpu,
  TrendingUp, Plus, ArrowRight, Clock, AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate, timeAgo } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dashboard | Admin' }

async function getDashboardStats() {
  try {
    const supabase = await createClient()
    const [events, members, articles, projects, chapters] = await Promise.all([
      supabase.from('events').select('id, status, title, start_at, created_at').order('created_at', { ascending: false }),
      supabase.from('team_members').select('id, status'),
      supabase.from('news_articles').select('id, status, title, created_at').order('created_at', { ascending: false }),
      supabase.from('projects').select('id, status'),
      supabase.from('chapters').select('id, status'),
    ])
    return {
      events: events.data ?? [],
      members: members.data ?? [],
      articles: articles.data ?? [],
      projects: projects.data ?? [],
      chapters: chapters.data ?? [],
    }
  } catch {
    return { events: [], members: [], articles: [], projects: [], chapters: [] }
  }
}

export default async function AdminDashboardPage() {
  const { events, members, articles, projects, chapters } = await getDashboardStats()

  const stats = [
    {
      label: 'Published Events',
      value: events.filter(e => e.status === 'published').length,
      total: events.length,
      icon: Calendar,
      href: '/admin/events',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Team Members',
      value: members.filter(m => m.status === 'published').length,
      total: members.length,
      icon: Users,
      href: '/admin/team',
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Published Articles',
      value: articles.filter(a => a.status === 'published').length,
      total: articles.length,
      icon: Newspaper,
      href: '/admin/news',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Active Chapters',
      value: chapters.filter(c => c.status === 'published').length,
      total: chapters.length,
      icon: Cpu,
      href: '/admin/chapters',
      color: 'text-amber-600 bg-amber-50',
    },
  ]

  const quickActions = [
    { label: 'New Event', href: '/admin/events/new', icon: Calendar },
    { label: 'New Article', href: '/admin/news/new', icon: Newspaper },
    { label: 'Add Team Member', href: '/admin/team/new', icon: Users },
    { label: 'New Album', href: '/admin/gallery/new', icon: Image },
  ]

  const recentActivity = [
    ...events.slice(0, 3).map(e => ({ type: 'Event', title: e.title, date: e.created_at, status: e.status, href: `/admin/events/${e.id}/edit` })),
    ...articles.slice(0, 3).map(a => ({ type: 'Article', title: a.title, date: a.created_at, status: a.status, href: `/admin/news/${a.id}/edit` })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6)

  const draftsCount =
    events.filter(e => e.status === 'draft').length +
    articles.filter(a => a.status === 'draft').length +
    members.filter(m => m.status === 'draft').length

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Dashboard</h1>
        <p className="text-[var(--color-muted)] text-sm mt-1">Overview of your IEEE WUSL website content.</p>
      </div>

      {/* Draft alert */}
      {draftsCount > 0 && (
        <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-amber-50 border border-amber-100">
          <AlertCircle className="w-4.5 h-4.5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="text-sm font-medium text-amber-800">
              {draftsCount} draft{draftsCount !== 1 ? 's' : ''} pending publication
            </span>
            <p className="text-xs text-amber-700 mt-0.5">
              Review and publish your draft content to make it visible on the public site.
            </p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, total, icon: Icon, href, color }) => (
          <Link key={label} href={href} className="card p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--color-muted-light)] group-hover:text-[var(--color-primary)] transition-colors" />
            </div>
            <div className="text-3xl font-bold text-[var(--color-text)]">{value}</div>
            <div className="text-sm text-[var(--color-muted)] mt-0.5">{label}</div>
            {total > value && (
              <div className="text-xs text-[var(--color-muted-light)] mt-1">{total - value} draft{total - value !== 1 ? 's' : ''}</div>
            )}
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="card p-5">
          <h2 className="font-bold text-[var(--color-text)] mb-4 text-sm uppercase tracking-wide">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-[var(--color-surface)] transition-colors text-sm text-[var(--color-text)] group"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/8 flex items-center justify-center group-hover:bg-[var(--color-primary)]/15 transition-colors">
                  <Icon className="w-4 h-4 text-[var(--color-primary)]" />
                </div>
                {label}
                <Plus className="w-3.5 h-3.5 ml-auto text-[var(--color-muted-light)]" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-bold text-[var(--color-text)] mb-4 text-sm uppercase tracking-wide">Recent Content</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)] text-center py-8">No content yet. Start by creating an event or article.</p>
          ) : (
            <div className="space-y-1">
              {recentActivity.map((item, i) => (
                <Link key={i} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-surface)] transition-colors group">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${item.status === 'published' ? 'bg-green-400' : item.status === 'draft' ? 'bg-amber-400' : 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-[var(--color-text)] truncate block">{item.title}</span>
                    <span className="text-xs text-[var(--color-muted-light)]">{item.type}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`badge text-[0.65rem] ${item.status === 'published' ? 'badge-success' : item.status === 'draft' ? 'badge-warning' : 'badge-muted'}`}>
                      {item.status}
                    </span>
                    <span className="text-xs text-[var(--color-muted-light)] hidden sm:block">{timeAgo(item.date)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
