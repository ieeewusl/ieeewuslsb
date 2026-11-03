import { createClient } from '@/lib/supabase/server'
import TeamMemberForm from '@/components/admin/TeamMemberForm'
import type { CommitteeTerm } from '@/types/database'

export default async function NewTeamMemberPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('committee_terms').select('*').order('start_year', { ascending: false })
  const terms = (data ?? []) as CommitteeTerm[]

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Add Team Member</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">Add a new committee member.</p>
      </div>
      <TeamMemberForm terms={terms} mode="create" />
    </div>
  )
}
