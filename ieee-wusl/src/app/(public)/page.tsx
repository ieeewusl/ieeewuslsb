import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Calendar,
  Users,
  Cpu,
  Zap,
  Globe,
  Award,
  ChevronRight,
  MapPin,
  Clock,
  Monitor,
  Bot,
  Radio,
  Flame,
  Mail,
} from 'lucide-react'
import { LinkedinIcon } from '@/components/ui/SocialIcons'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatDateTime, isEventPast, getInitials } from '@/lib/utils'
import type { Event, Chapter, NewsArticle, TeamMember } from '@/types/database'
import { mockEvents, mockChapters, mockNews, mockTeamMembers } from '@/lib/mock-data'

export const metadata: Metadata = {
  title: 'IEEE Student Branch — Wayamba University of Sri Lanka',
  description:
    'The IEEE Student Branch at Wayamba University of Sri Lanka. Engineering Ideas. Creating Impact.',
}

export const revalidate = 60

async function getHomeData() {
  try {
    const supabase = await createClient()

    const [eventsRes, chaptersRes, newsRes, teamRes] = await Promise.all([
      supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('start_at', { ascending: true })
        .limit(3),
      supabase
        .from('chapters')
        .select('*')
        .eq('status', 'published')
        .order('display_order', { ascending: true }),
      supabase
        .from('news_articles')
        .select('id,title,slug,summary,cover_url,published_at,tags')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3),
      supabase
        .from('team_members')
        .select('*')
        .eq('status', 'published')
        .order('display_order', { ascending: true })
        .limit(4),
    ])

    const events = (eventsRes.data && eventsRes.data.length > 0) ? (eventsRes.data as Event[]) : mockEvents.slice(0, 3)
    const chapters = (chaptersRes.data && chaptersRes.data.length > 0) ? (chaptersRes.data as Chapter[]) : mockChapters
    const news = (newsRes.data && newsRes.data.length > 0) ? (newsRes.data as Partial<NewsArticle>[]) : mockNews.slice(0, 3)
    const team = (teamRes.data && teamRes.data.length > 0) ? (teamRes.data as TeamMember[]) : mockTeamMembers.slice(0, 4)

    return { events, chapters, news, team }
  } catch {
    return {
      events: mockEvents.slice(0, 3),
      chapters: mockChapters,
      news: mockNews.slice(0, 3),
      team: mockTeamMembers.slice(0, 4),
    }
  }
}

const chapterIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'computer-society': Monitor,
  'robotics-automation': Bot,
  'women-in-engineering': Users,
  'power-energy': Zap,
}

const chapterColors: Record<string, string> = {
  'computer-society': 'from-blue-600 to-blue-800',
  'robotics-automation': 'from-purple-600 to-purple-800',
  'women-in-engineering': 'from-rose-500 to-rose-700',
  'power-energy': 'from-amber-500 to-orange-600',
}

export default async function HomePage() {
  const { events, chapters, news, team } = await getHomeData()

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[var(--color-navy)]" aria-label="Hero">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/hero.jpg"
            alt="Engineering students collaborating in a university lab"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          {/* Overlay — gradient left to right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071A2B]/95 via-[#071A2B]/75 to-[#071A2B]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071A2B]/60 via-transparent to-transparent" />
        </div>

        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(22,135,217,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(22,135,217,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="container relative z-10 py-32 md:py-40">
          <div className="max-w-3xl">
            {/* Branch label */}
            <div className="inline-flex items-center gap-2.5 mb-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Image
                src="/wusl-sb-emblem.png"
                alt="IEEE"
                width={20}
                height={20}
                className="h-5 w-auto object-contain brightness-0 invert"
              />
              <span className="text-xs font-semibold text-white tracking-wider uppercase">
                IEEE Student Branch · Wayamba University of Sri Lanka
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6">
              Building Future
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-bright)] to-[var(--color-bright-light)]">
                Engineers, Innovators, and Leaders
              </span>
              <br />
              Through 
              <span className="text-[var(--color-accent)]"> IEEE.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 max-w-xl leading-relaxed mb-10">
              We are a community of students passionate about technology, research, and impact. From workshops to industry talks and community projects,
        our branch empowers members to learn, create, and lead.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/join" className="btn btn-accent btn-lg">
                Join IEEE WUSL
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/events" className="btn btn-white-outline btn-lg">
                Explore Events
              </Link>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 mt-14 pt-10 border-t border-white/15">
              {[
                { value: '4', label: 'Technical Chapters' },
                { value: '10+', label: 'Annual Events' },
                { value: '150+', label: 'Active Members' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/55">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator with smooth scrolling */}
        <a
          href="#intro-heading"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 hover:text-white transition-all group cursor-pointer"
          aria-label="Scroll to content"
        >
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/50 group-hover:to-white group-hover:h-12 transition-all" />
          <span className="text-xs tracking-widest uppercase group-hover:tracking-wider transition-all">Scroll</span>
        </a>
      </section>

      {/* ── INTRO / MISSION ── */}
      <section className="section" id="intro" aria-labelledby="intro-heading">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-label">
                <span>About Us</span>
              </div>
              <h2 id="intro-heading" className="section-title">
                Building tomorrow&apos;s engineers, today.
              </h2>
              <p className="text-[var(--color-muted)] text-lg leading-relaxed mb-6">
                The IEEE Student Branch at Wayamba University of Sri Lanka is a community of passionate engineers and technologists dedicated to learning, collaboration, and creating real-world impact.
              </p>
              <p className="text-[var(--color-muted)] leading-relaxed mb-8">
                From cutting-edge technical workshops and hackathons to robotics competitions and industry visits, we provide the platform for every engineering student to grow, connect, and excel.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/about" className="btn btn-outline">
                  About IEEE WUSL
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/team" className="btn btn-white-outline" style={{ color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}>
                  Meet the Team
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                <Image
                  src="/about.jpg"
                  alt="Wayamba University campus and students"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Floating stat card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl border border-[var(--color-border)] hidden sm:flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[var(--color-primary)] flex items-center justify-center font-bold text-lg">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-[var(--color-muted)] uppercase tracking-wider">Region 10</div>
                  <div className="font-bold text-[var(--color-text)]">Active SB Community</div>
                </div>
              </div>
              {/* Accent decoration */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-[var(--color-primary)]/10 border-2 border-[var(--color-primary)]/20 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CHAPTERS ── */}
      <section className="section section-surface" aria-labelledby="chapters-heading">
        <div className="container">
          <div className="section-header-center">
            <div className="section-label justify-center">Technical Chapters</div>
            <h2 id="chapters-heading" className="section-title">
              Explore our technical communities
            </h2>
            <p className="section-desc section-desc-center">
              Our specialized chapters provide deep technical expertise, professional development, and vibrant communities for every engineering interest.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {chapters.length > 0
              ? chapters.map((chapter) => {
                  const Icon = chapterIcons[chapter.slug] ?? Cpu
                  const gradient = chapterColors[chapter.slug] ?? 'from-blue-600 to-blue-800'
                  return (
                    <Link
                      key={chapter.id}
                      href={`/chapters/${chapter.slug}`}
                      className="card group p-6 flex flex-col hover:scale-[1.02] transition-transform"
                    >
                      {chapter.logo_url ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden mb-4 p-1.5 bg-white border border-[var(--color-border)] shadow-sm flex items-center justify-center">
                          <Image src={chapter.logo_url} alt={`${chapter.name} logo`} fill className="object-contain p-1" />
                        </div>
                      ) : (
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <h3 className="text-base font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                        IEEE {chapter.name}
                      </h3>
                      <p className="text-sm text-[var(--color-muted)] leading-relaxed flex-1">
                        {chapter.short_desc}
                      </p>
                      <div className="flex items-center gap-1 mt-4 text-sm font-medium text-[var(--color-primary)]">
                        Learn more <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  )
                })
              : /* fallback cards */
                [
                  { slug: 'computer-society', name: 'Computer Society', desc: 'Advancing computer science and engineering.', Icon: Monitor },
                  { slug: 'robotics-automation', name: 'Robotics & Automation', desc: 'Exploring intelligent systems and automation.', Icon: Bot },
                  { slug: 'women-in-engineering', name: 'Women in Engineering', desc: 'Empowering women in technology.', Icon: Users },
                  { slug: 'power-energy', name: 'Power & Energy', desc: 'Sustainable energy innovation.', Icon: Zap },
                ].map(({ slug, name, desc, Icon }) => {
                  const gradient = chapterColors[slug] ?? 'from-blue-600 to-blue-800'
                  return (
                    <Link key={slug} href={`/chapters/${slug}`} className="card group p-6 flex flex-col hover:scale-[1.02] transition-transform">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-base font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                        IEEE {name}
                      </h3>
                      <p className="text-sm text-[var(--color-muted)] leading-relaxed flex-1">{desc}</p>
                      <div className="flex items-center gap-1 mt-4 text-sm font-medium text-[var(--color-primary)]">
                        Learn more <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  )
                })}
          </div>

          <div className="text-center mt-10">
            <Link href="/chapters" className="btn btn-outline">
              View All Technical Chapters
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ── */}
      <section className="section" aria-labelledby="events-heading">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="section-label">Events & Activities</div>
              <h2 id="events-heading" className="section-title mb-0">What&apos;s happening next</h2>
            </div>
            <Link href="/events" className="btn btn-outline self-start md:self-auto">
              All Events
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const isPast = isEventPast(event.end_at, event.start_at)
              return (
                <article key={event.id} className="card group flex flex-col">
                  {/* Card header */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="badge badge-primary">{event.category}</span>
                      {isPast ? (
                        <span className="badge badge-muted">Past</span>
                      ) : (
                        <span className="badge badge-success">Upcoming</span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                      <Link href={`/events/${event.slug}`}>
                        {event.title}
                      </Link>
                    </h3>

                    <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4 flex-1">
                      {event.summary}
                    </p>

                    <div className="space-y-2 pt-4 border-t border-[var(--color-border)] text-xs text-[var(--color-muted)]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" />
                        <span>{formatDateTime(event.start_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" />
                        <span>{event.is_online ? 'Online Event' : (event.venue ?? 'WUSL Campus')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="px-6 py-4 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex items-center justify-between">
                    <Link
                      href={`/events/${event.slug}`}
                      className="text-xs font-semibold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
                    >
                      Details & Registration
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                    {event.registration_url && !isPast && (
                      <a
                        href={event.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm py-1 px-3 text-xs"
                      >
                        Register
                      </a>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── ROBOTICS & FLAGSHIP HIGHLIGHT ── */}
      <section className="section section-dark overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 80% 50%, rgba(242,140,40,0.3) 0%, transparent 60%)`,
          }}
        />
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="section-label" style={{ color: 'var(--color-accent)' }}>
                <span>Flagship Activities</span>
              </div>
              <h2 className="text-white text-3xl md:text-4xl font-bold mb-6">
                Where engineering meets competition and creativity.
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                From national robotics competitions to inter-university hackathons, IEEE WUSL members regularly design, build, and deploy cutting-edge engineering solutions.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { title: 'Annual Robotics Symposium', desc: 'Autonomous robotics challenge open to all Sri Lankan university teams.' },
                  { title: 'WUSL Hackathon Series', desc: '48-hour software and hardware sprint solving national industrial problems.' },
                  { title: 'WIE Leadership Summit', desc: 'Empowering women engineers with leadership skills and industry networks.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5">
                      <Flame className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{item.title}</div>
                      <div className="text-white/60 text-xs mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/join" className="btn btn-accent">
                Participate in Next Flagship
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] border border-white/10">
                <Image
                  src="/robotics.jpg"
                  alt="Student working on robotics circuitry"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -top-4 -left-4 w-24 h-24 rounded-2xl bg-[var(--color-accent)]/15 border-2 border-[var(--color-accent)]/30 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ── LATEST NEWS ── */}
      <section className="section" aria-labelledby="news-heading">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="section-label">Branch News</div>
              <h2 id="news-heading" className="section-title mb-0">Latest updates & achievements</h2>
            </div>
            <Link href="/news" className="btn btn-outline self-start md:self-auto">
              All News
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article) => (
              <article key={article.id} className="card group flex flex-col">
                {article.cover_url && (
                  <div className="relative h-48 overflow-hidden bg-[var(--color-surface)]">
                    <Image
                      src={article.cover_url}
                      alt={article.title ?? 'Article cover'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {article.tags.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="badge badge-primary">{tag}</span>
                      ))}
                    </div>
                  )}

                  <h3 className="text-base font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                    <Link href={`/news/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h3>

                  <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4 flex-1 line-clamp-3">
                    {article.summary}
                  </p>

                  <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-muted)]">
                    <span>{article.published_at ? formatDate(article.published_at) : ''}</span>
                    <Link
                      href={`/news/${article.slug}`}
                      className="font-semibold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
                    >
                      Read story <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXECUTIVE COMMITTEE ── */}
      <section className="section section-surface" aria-labelledby="team-heading">
        <div className="container">
          <div className="section-header-center">
            <div className="section-label justify-center">Leadership</div>
            <h2 id="team-heading" className="section-title">
              Executive Committee
            </h2>
            <p className="section-desc section-desc-center">
              Dedicated student leaders driving the vision, operations, and community of IEEE WUSL.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.id} className="card p-6 flex flex-col items-center text-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xl font-bold shadow-md">
                  {member.photo_url ? (
                    <Image
                      src={member.photo_url}
                      alt={member.full_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>{getInitials(member.full_name)}</span>
                  )}
                </div>

                <h3 className="font-bold text-[var(--color-text)] text-base mb-1">{member.full_name}</h3>
                <p className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider mb-2">
                  {member.role_title}
                </p>

                {member.bio && (
                  <p className="text-xs text-[var(--color-muted)] leading-relaxed mb-4 line-clamp-2">
                    {member.bio}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-auto">
                  {member.linkedin_url && (
                    <a
                      href={member.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-lg bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:text-[var(--color-primary)] flex items-center justify-center transition-colors"
                      aria-label={`${member.full_name}'s LinkedIn`}
                    >
                      <LinkedinIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="w-7 h-7 rounded-lg bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:text-[var(--color-primary)] flex items-center justify-center transition-colors"
                      aria-label={`Email ${member.full_name}`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/team" className="btn btn-outline">
              Meet the Full Committee
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA / JOIN ── */}
      <section className="section bg-[var(--color-navy)] text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(22,135,217,0.5) 0%, transparent 60%)`,
          }}
        />
        <div className="container relative text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center p-3.5 bg-white rounded-2xl shadow-xl mb-6 mx-auto border border-white/20">
            <Image
              src="/ieee.jpg"
              alt="IEEE - Advancing Technology for Humanity"
              width={220}
              height={65}
              className="h-11 sm:h-12 w-auto object-contain"
            />
          </div>
          <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">
            Become an IEEE Member Today
          </h2>
          <p className="text-white/65 text-lg leading-relaxed mb-8">
            Access global resources, participate in international competitions, receive research publications, and build friendships that will define your engineering career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/join" className="btn btn-accent btn-lg">
              Join IEEE WUSL
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/about" className="btn btn-white-outline btn-lg">
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
