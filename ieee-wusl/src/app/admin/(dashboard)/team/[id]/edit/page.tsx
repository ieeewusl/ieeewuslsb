import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TeamMemberForm from '@/components/admin/TeamMemberForm'
import type { TeamMember, CommitteeTerm } from '@/types/database'

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const [memberRes, termsRes] = await Promise.all([
    supabase.from('team_members').select('*').eq('id', id).single(),
    supabase.from('committee_terms').select('*').order('start_year', { ascending: false }),
  ])
  if (!memberRes.data) notFound()

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Edit Team Member</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">{memberRes.data.full_name}</p>
      </div>
      <TeamMemberForm
        initialData={memberRes.data as TeamMember}
        terms={(termsRes.data ?? []) as CommitteeTerm[]}
        mode="edit"
      />
    </div>
  )
}
