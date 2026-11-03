import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Code2, ArrowRight } from 'lucide-react'
import { GithubIcon } from '@/components/ui/SocialIcons'
import { createClient } from '@/lib/supabase/server'
import type { Project } from '@/types/database'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Discover student engineering projects, technical initiatives, and innovative solutions built by IEEE WUSL members.',
}

export const revalidate = 60

import { mockProjects } from '@/lib/mock-data'

async function getProjects(): Promise<Project[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    if (data && data.length > 0) return data as Project[]
    return mockProjects
  } catch {
    return mockProjects
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <>
      <section className="pt-32 pb-16 bg-gradient-to-b from-[var(--color-navy)] to-[var(--color-navy-800)]">
        <div className="container">
          <div className="section-label" style={{ color: 'var(--color-bright-light)' }}>
            <span>Projects</span>
          </div>
          <h1 className="text-white mb-4">Student Projects & Initiatives</h1>
          <p className="text-white/60 text-lg max-w-xl">
            Engineering solutions, research initiatives, and technical projects built by IEEE WUSL members.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {projects.length === 0 ? (
            <div className="text-center py-24">
              <Code2 className="w-16 h-16 text-[var(--color-muted-light)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">Projects coming soon</h2>
              <p className="text-[var(--color-muted)]">Member projects will be showcased here.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <Link key={project.id} href={`/projects/${project.slug}`} className="card group flex flex-col">
                  <div className="relative aspect-video overflow-hidden">
                    {project.cover_url ? (
                      <Image src={project.cover_url} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--color-navy-800)] to-[var(--color-primary)] flex items-center justify-center">
                        <Code2 className="w-10 h-10 text-white/30" />
                      </div>
                    )}
                    {project.featured && (
                      <div className="absolute top-3 left-3">
                        <span className="badge badge-accent">Featured</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                      {project.title}
                    </h3>
                    {project.summary && (
                      <p className="text-sm text-[var(--color-muted)] line-clamp-3 flex-1">{project.summary}</p>
                    )}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {project.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="badge badge-primary text-[0.7rem]">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--color-border)]">
                      {project.github_url && (
                        <span className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
                          <GithubIcon size={14} /> GitHub
                        </span>
                      )}
                      {project.demo_url && (
                        <span className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
                          <ExternalLink className="w-3.5 h-3.5" /> Demo
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
