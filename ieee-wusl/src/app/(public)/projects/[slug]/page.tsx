import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, Users, Tag, Code2 } from 'lucide-react'
import { GithubIcon } from '@/components/ui/SocialIcons'
import { createClient } from '@/lib/supabase/server'
import type { Project } from '@/types/database'

import { mockProjects, mockChapters } from '@/lib/mock-data'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('projects').select('title,summary').eq('slug', slug).single()
    if (data) return { title: `${data.title} | IEEE WUSL Projects`, description: data.summary ?? undefined }
  } catch {}
  const mock = mockProjects.find(p => p.slug === slug)
  if (mock) return { title: `${mock.title} | IEEE WUSL Projects`, description: mock.summary ?? undefined }
  return { title: 'Project Not Found' }
}

async function getProject(slug: string): Promise<Project | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('projects')
      .select('*, chapters(*)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    if (data) return data as Project
  } catch {}
  const mock = mockProjects.find(p => p.slug === slug)
  if (mock) {
    const chapter = mockChapters.find(c => c.id === mock.chapter_id)
    return { ...mock, chapters: chapter }
  }
  return null
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProject(slug)

  if (!project) notFound()

  return (
    <>
      {/* Hero Header */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-[var(--color-navy)] to-[var(--color-navy-800)]">
        <div className="container">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>
          <div className="max-w-3xl">
            {project.featured && (
              <span className="badge badge-accent mb-4">Featured Project</span>
            )}
            <h1 className="text-white mb-4">{project.title}</h1>
            {project.summary && (
              <p className="text-white/70 text-lg leading-relaxed mb-6">{project.summary}</p>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Live Demo <ExternalLink className="w-4 h-4 ml-1.5" />
                </a>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-white-outline"
                >
                  <GithubIcon size={16} className="mr-1.5" /> Source Code
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column: Cover & Description */}
            <div className="lg:col-span-2 space-y-8">
              {project.cover_url && (
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-[var(--color-border)]">
                  <Image
                    src={project.cover_url}
                    alt={project.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              <div className="card p-8">
                <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">About the Project</h2>
                <div className="prose max-w-none text-[var(--color-muted)] leading-relaxed whitespace-pre-line">
                  {project.description || project.summary || 'Detailed project overview coming soon.'}
                </div>
              </div>
            </div>

            {/* Right Column: Project Meta Sidebar */}
            <div className="space-y-6">
              <div className="card p-6 space-y-6">
                <h3 className="font-bold text-[var(--color-text)] text-base border-b border-[var(--color-border)] pb-3">
                  Project Details
                </h3>

                {/* Chapter Affiliation */}
                {project.chapters && (
                  <div>
                    <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider block mb-1">
                      Chapter
                    </span>
                    <Link
                      href={`/chapters/${project.chapters.slug}`}
                      className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
                    >
                      {project.chapters.name}
                    </Link>
                  </div>
                )}

                {/* Team Members */}
                {project.members && project.members.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Contributors
                    </span>
                    <ul className="space-y-1.5">
                      {project.members.map((member, i) => (
                        <li key={i} className="text-sm text-[var(--color-text)] font-medium">
                          • {member}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Timeline */}
                {(project.start_date || project.end_date) && (
                  <div>
                    <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Timeline
                    </span>
                    <span className="text-sm text-[var(--color-text)]">
                      {project.start_date || 'Ongoing'} {project.end_date ? `— ${project.end_date}` : ''}
                    </span>
                  </div>
                )}

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> Tech Stack & Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span key={tag} className="badge badge-primary text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Call to join */}
              <div className="card p-6 bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-navy-800)] text-white">
                <Code2 className="w-8 h-8 text-[var(--color-accent)] mb-3" />
                <h4 className="font-bold text-base mb-2">Want to build projects like this?</h4>
                <p className="text-xs text-white/70 mb-4 leading-relaxed">
                  Join an IEEE WUSL technical chapter and work on real engineering solutions with peers and mentors.
                </p>
                <Link href="/join" className="btn btn-accent btn-sm w-full justify-center">
                  Join IEEE WUSL
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
