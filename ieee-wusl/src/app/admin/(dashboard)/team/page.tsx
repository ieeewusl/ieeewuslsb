import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getInitials } from '@/lib/utils'
import type { TeamMember, CommitteeTerm } from '@/types/database'
import AdminDeleteButton from '@/components/admin/AdminDeleteButton'
import AdminStatusToggle from '@/components/admin/AdminStatusToggle'

export const metadata: Metadata = { title: 'Team | Admin' }
export const revalidate = 0

async function getData() {
  const supabase = await createClient()
  const [membersRes, termsRes] = await Promise.all([
    supabase.from('team_members').select('*, committee_terms(label)').order('display_order'),
    supabase.from('committee_terms').select('*').order('start_year', { ascending: false }),
  ])
  return {
    members: (membersRes.data ?? []) as TeamMember[],
    terms: (termsRes.data ?? []) as CommitteeTerm[],
  }
}

export default async function AdminTeamPage() {
  const { members, terms } = await getData()

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Team Members</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">{members.length} members</p>
        </div>
        <Link href="/admin/team/new" className="btn btn-primary btn-sm">
          <Plus className="w-4 h-4" /> Add Member
        </Link>
      </div>

      {members.length === 0 ? (
        <div className="card p-16 text-center">
          <Users className="w-12 h-12 text-[var(--color-muted-light)] mx-auto mb-4" />
          <h2 className="font-bold text-[var(--color-text)] mb-2">No team members</h2>
          <p className="text-sm text-[var(--color-muted)] mb-6">Add committee members to display them on the public site.</p>
          <Link href="/admin/team/new" className="btn btn-primary btn-sm mx-auto">
            <Plus className="w-4 h-4" /> Add First Member
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">Member</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide hidden md:table-cell">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide hidden lg:table-cell">Term</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-[var(--color-surface)] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-navy)] flex items-center justify-center shrink-0">
                        {member.photo_url ? (
                          member.photo_url.startsWith('data:') ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={member.photo_url} alt={member.full_name} className="object-cover w-full h-full" />
                          ) : (
                            <Image src={member.photo_url} alt={member.full_name} width={32} height={32} className="object-cover w-full h-full" />
                          )
                        ) : (
                          <span className="text-xs font-bold text-white">{getInitials(member.full_name)}</span>
                        )}
                      </div>
                      <span className="font-medium text-[var(--color-text)]">{member.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-[var(--color-muted)]">{member.role_title}</td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-[var(--color-muted)] text-xs">
                    {(member as any).committee_terms?.label ?? '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <AdminStatusToggle id={member.id} table="team_members" currentStatus={member.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <Link href={`/admin/team/${member.id}/edit`} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <AdminDeleteButton id={member.id} table="team_members" label={member.full_name} />
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
