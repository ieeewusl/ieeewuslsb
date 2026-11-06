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
    <div className="card group flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 border border-[var(--color-border)]">
      {/* Full-size Square Photo (Badge Style) */}
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-primary)]">
        {member.photo_url ? (
          <>
            <Image
              src={member.photo_url}
              alt={member.full_name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-white/95 text-[var(--color-primary)] shadow-md backdrop-blur-sm">
                {member.role_title}
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white">
            <span className="text-4xl font-extrabold tracking-tight mb-2 opacity-90">
              {getInitials(member.full_name)}
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-white/20 text-white backdrop-blur-sm">
              {member.role_title}
            </span>
          </div>
        )}
      </div>

      {/* Name Tag & Bio */}
      <div className="p-5 flex flex-col flex-1 bg-[var(--color-card)]">
        <h3 className="font-bold text-[var(--color-text)] text-base group-hover:text-[var(--color-primary)] transition-colors line-clamp-1 mb-1">
          {member.full_name}
        </h3>
        <p className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider mb-2">
          {member.role_title}
        </p>

        {member.bio && (
          <p className="text-xs text-[var(--color-muted)] line-clamp-2 leading-relaxed mb-4 flex-1">
            {member.bio}
          </p>
        )}

        <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between mt-auto">
          <span className="text-[11px] font-medium text-[var(--color-muted)]">
            IEEE WUSL
          </span>
          <div className="flex items-center gap-1.5">
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="w-7 h-7 rounded-lg bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-blue-50 flex items-center justify-center transition-colors"
                aria-label={`Email ${member.full_name}`}
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            )}
            {member.linkedin_url && (
              <a
                href={member.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-blue-50 flex items-center justify-center transition-colors"
                aria-label={`${member.full_name} on LinkedIn`}
              >
                <LinkedinIcon size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
