import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Users, Mail, ChevronDown } from 'lucide-react'
import { LinkedinIcon } from '@/components/ui/SocialIcons'
import { createClient } from '@/lib/supabase/server'
import { getInitials } from '@/lib/utils'
import type { TeamMember, CommitteeTerm } from '@/types/database'

export const metadata: Metadata = {
  title: 'Executive Committee',
  description: 'Meet the dedicated executive committee members leading the IEEE Student Branch at Wayamba University of Sri Lanka.',
}

export const revalidate = 60

import { mockTeamMembers } from '@/lib/mock-data'

const defaultTerms: CommitteeTerm[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    label: '2024/2025',
    start_year: 2024,
    end_year: 2025,
    is_current: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

async function getTeam() {
  try {
    const supabase = await createClient()
    const { data: terms } = await supabase
      .from('committee_terms')
      .select('*')
      .order('start_year', { ascending: false })

    const { data: members } = await supabase
      .from('team_members')
      .select('*, committee_terms(label)')
      .eq('status', 'published')
      .order('display_order', { ascending: true })

    if (members && members.length > 0) {
      return {
        terms: (terms ?? defaultTerms) as CommitteeTerm[],
        members: members as TeamMember[],
      }
    }
  } catch {}
  return { terms: defaultTerms, members: mockTeamMembers }
}

export default async function TeamPage() {
  const { terms, members } = await getTeam()
  const currentTerm = terms.find(t => t.is_current)

  // Group members by term
  const membersByTerm = terms.reduce((acc, term) => {
    acc[term.id] = members.filter(m => m.term_id === term.id)
    return acc
  }, {} as Record<string, TeamMember[]>)

  const ungrouped = members.filter(m => !m.term_id)

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-[var(--color-navy)] to-[var(--color-navy-800)]">
        <div className="container">
          <div className="section-label" style={{ color: 'var(--color-bright-light)' }}>
            <span>Executive Committee</span>
          </div>
          <h1 className="text-white mb-4">Meet the Team</h1>
          <p className="text-white/60 text-lg max-w-xl">
            Dedicated student leaders who drive our activities, initiatives, and community forward.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {members.length === 0 ? (
            <div className="text-center py-24">
              <Users className="w-16 h-16 text-[var(--color-muted-light)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-3">Committee coming soon</h2>
              <p className="text-[var(--color-muted)]">Team information will be published here.</p>
            </div>
          ) : (
            <>
              {/* Current term */}
              {currentTerm && membersByTerm[currentTerm.id]?.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center gap-3 mb-10">
                    <h2 className="text-2xl font-bold text-[var(--color-text)]">
                      {currentTerm.label} Committee
                    </h2>
                    <span className="badge badge-success">Current</span>
                  </div>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {membersByTerm[currentTerm.id].map(member => (
                      <MemberCard key={member.id} member={member} />
                    ))}
                  </div>
                </div>
              )}

              {/* Past terms */}
              {terms
                .filter(t => !t.is_current && membersByTerm[t.id]?.length > 0)
                .map(term => (
                  <div key={term.id} className="mb-14">
                    <h2 className="text-xl font-bold text-[var(--color-muted)] mb-8">
                      {term.label} Committee
                    </h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 opacity-80">
                      {membersByTerm[term.id].map(member => (
                        <MemberCard key={member.id} member={member} />
                      ))}
                    </div>
                  </div>
                ))}

              {/* Ungrouped */}
              {ungrouped.length > 0 && (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {ungrouped.map(member => <MemberCard key={member.id} member={member} />)}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="card p-5 flex flex-col items-center text-center group">
      <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 ring-2 ring-[var(--color-border)] group-hover:ring-[var(--color-primary)] transition-all">
        {member.photo_url ? (
          <Image src={member.photo_url} alt={member.full_name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-navy)] flex items-center justify-center">
            <span className="text-xl font-bold text-white">{getInitials(member.full_name)}</span>
          </div>
        )}
      </div>
      <h3 className="font-bold text-[var(--color-text)] text-sm mb-0.5">{member.full_name}</h3>
      <p className="text-xs text-[var(--color-primary)] font-medium mb-2">{member.role_title}</p>
      {member.bio && (
        <p className="text-xs text-[var(--color-muted)] line-clamp-3 leading-relaxed mb-3">{member.bio}</p>
      )}
      <div className="flex items-center gap-2 mt-auto">
        {member.email && (
          <a href={`mailto:${member.email}`} className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors" aria-label={`Email ${member.full_name}`}>
            <Mail className="w-4 h-4" />
          </a>
        )}
        {member.linkedin_url && (
          <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors" aria-label={`${member.full_name} on LinkedIn`}>
            <LinkedinIcon size={16} />
          </a>
        )}
      </div>
    </div>
  )
}
