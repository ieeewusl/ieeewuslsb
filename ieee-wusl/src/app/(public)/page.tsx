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
            <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Zap className="w-3.5 h-3.5 text-[var(--color-accent)]" fill="currentColor" />
              <span className="text-xs font-semibold text-white/90 tracking-wider uppercase">
                IEEE Student Branch · Wayamba University of Sri Lanka
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6">
              Engineering
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-bright)] to-[var(--color-bright-light)]">
                Ideas.
              </span>
              <br />
              Creating
              <span className="text-[var(--color-accent)]"> Impact.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 max-w-xl leading-relaxed mb-10">
              Sri Lanka&apos;s most passionate IEEE chapter — where engineering curiosity meets real-world innovation, collaboration, and community.
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
                { value: '50+', label: 'Annual Events' },
                { value: '500+', label: 'Active Members' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/55">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/40" />
          <span className="text-xs tracking-widest uppercase">Scroll</span>
        </div>
      </section>

      {/* ── INTRO / MISSION ── */}
      <section className="section" aria-labelledby="intro-heading">
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
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Award, title: 'IEEE Affiliated', desc: 'Recognized IEEE Student Branch' },
                  { icon: Globe, title: 'Global Network', desc: '420,000+ IEEE members worldwide' },
                  { icon: Users, title: 'Community First', desc: 'Inclusive, collaborative culture' },
                  { icon: Cpu, title: 'Tech Focused', desc: 'Hands-on technical programs' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4.5 h-4.5 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--color-text)]">{title}</div>
                      <div className="text-xs text-[var(--color-muted)] mt-0.5">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/about" className="btn btn-primary">
                Our Story <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Image composition */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                <Image
                  src="/about.jpg"
                  alt="Students attending an IEEE workshop at Wayamba University"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 border border-[var(--color-border)] max-w-[220px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--color-text)]">Active Branch</div>
                    <div className="text-xs text-[var(--color-muted)]">2024/2025</div>
                  </div>
                </div>
                <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                  Recognized IEEE Student Branch in Sri Lanka Section.
                </p>
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
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
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
              View All Chapters <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ── */}
      <section className="section" aria-labelledby="events-heading">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="section-label">Events</div>
              <h2 id="events-heading" className="section-title mb-2">
                What&apos;s happening
              </h2>
              <p className="section-desc">
                Stay connected with our upcoming workshops, seminars, and competitions.
              </p>
            </div>
            <Link href="/events" className="btn btn-outline shrink-0">
              All Events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {events.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {events.map((event, i) => {
                const past = isEventPast(event.end_at, event.start_at)
                return (
                  <Link key={event.id} href={`/events/${event.slug}`} className="card group flex flex-col">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {event.cover_url ? (
                        <Image src={event.cover_url} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${i % 2 === 0 ? 'from-blue-600 to-blue-900' : 'from-purple-600 to-purple-900'} flex items-center justify-center`}>
                          <Calendar className="w-10 h-10 text-white/40" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className={`badge ${past ? 'badge-muted' : 'badge-accent'}`}>
                          {past ? 'Past' : 'Upcoming'}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                      {event.summary && (
                        <p className="text-sm text-[var(--color-muted)] line-clamp-2 mb-4 flex-1">
                          {event.summary}
                        </p>
                      )}
                      <div className="space-y-1.5 mt-auto">
                        <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDateTime(event.start_at)}
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.venue}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20 rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)]">
              <Calendar className="w-12 h-12 text-[var(--color-muted-light)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">Events coming soon</h3>
              <p className="text-[var(--color-muted)] text-sm max-w-sm mx-auto">
                Check back soon for upcoming workshops, seminars, and competitions.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── ROBOTICS / DARK FEATURE ── */}
      <section className="section-dark section" aria-label="Innovation highlight">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-square max-w-md mx-auto">
                <Image src="/robotics.jpg" alt="Student-built robotics arm in the lab" fill className="object-cover" />
              </div>
              <div className="absolute -top-5 -right-5 w-32 h-32 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm -z-10" />
            </div>
            <div className="order-1 lg:order-2">
              <div className="section-label">Innovation</div>
              <h2 className="section-title text-white mb-6">
                Building real things that matter.
              </h2>
              <p className="text-white/65 text-lg leading-relaxed mb-6">
                Our Robotics and Automation chapter has pioneered autonomous systems, industrial automation projects, and AI-driven solutions right here in Sri Lanka.
              </p>
              <p className="text-white/55 leading-relaxed mb-8">
                From competition robots to industry-partnered prototypes, our members gain hands-on experience that prepares them for world-class engineering careers.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { value: '10+', label: 'Projects Built' },
                  { value: '3+', label: 'Competition Wins' },
                  { value: '60+', label: 'Chapter Members' },
                  { value: '5+', label: 'Industry Partners' },
                ].map((s) => (
                  <div key={s.label} className="p-4 rounded-xl bg-white/6 border border-white/10">
                    <div className="text-2xl font-bold text-[var(--color-bright-light)]">{s.value}</div>
                    <div className="text-sm text-white/55">{s.label}</div>
                  </div>
                ))}
              </div>
              <Link href="/chapters/robotics-automation" className="btn btn-white">
                Explore RAS <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWS ── */}
      <section className="section" aria-labelledby="news-heading">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="section-label">News</div>
              <h2 id="news-heading" className="section-title mb-2">Latest from IEEE WUSL</h2>
              <p className="section-desc">Announcements, recaps, and updates.</p>
            </div>
            <Link href="/news" className="btn btn-outline shrink-0">
              All News <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {news.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {news.map((article, i) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className={`card group flex flex-col ${i === 0 ? 'md:col-span-1' : ''}`}
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {article.cover_url ? (
                      <Image src={article.cover_url} alt={article.title ?? ''} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--color-navy-800)] to-[var(--color-navy)] flex items-center justify-center">
                        <Radio className="w-10 h-10 text-white/25" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="text-sm text-[var(--color-muted)] line-clamp-3 flex-1">
                        {article.summary}
                      </p>
                    )}
                    {article.published_at && (
                      <div className="flex items-center gap-2 mt-4 text-xs text-[var(--color-muted-light)]">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(article.published_at)}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)]">
              <Radio className="w-10 h-10 text-[var(--color-muted-light)] mx-auto mb-3" />
              <h3 className="font-semibold text-[var(--color-text)] mb-1">News coming soon</h3>
              <p className="text-sm text-[var(--color-muted)]">Stay tuned for announcements and updates.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── EXECUTIVE COMMITTEE ── */}
      <section className="section section-surface" aria-labelledby="team-heading">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="section-label">Leadership</div>
              <h2 id="team-heading" className="section-title mb-2">Executive Committee</h2>
              <p className="section-desc">Meet the student leaders driving IEEE WUSL forward.</p>
            </div>
            <Link href="/team" className="btn btn-outline shrink-0">
              Meet All Members <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.id} className="card p-6 flex flex-col items-center text-center group">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 ring-2 ring-[var(--color-border)] group-hover:ring-[var(--color-primary)] transition-all">
                  {member.photo_url ? (
                    <Image src={member.photo_url} alt={member.full_name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-navy)] flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{getInitials(member.full_name)}</span>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-[var(--color-text)] text-base mb-1">{member.full_name}</h3>
                <p className="text-xs font-semibold text-[var(--color-primary)] tracking-wide uppercase mb-3">{member.role_title}</p>
                {member.bio && (
                  <p className="text-xs text-[var(--color-muted)] line-clamp-3 leading-relaxed mb-4 flex-1">{member.bio}</p>
                )}
                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-[var(--color-border)] w-full justify-center">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                      aria-label={`Email ${member.full_name}`}
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  {member.linkedin_url && (
                    <a
                      href={member.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                      aria-label={`${member.full_name} on LinkedIn`}
                    >
                      <LinkedinIcon size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN CTA ── */}
      <section className="section bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-navy-700)]" aria-label="Join call to action">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20">
              <Users className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-semibold text-white tracking-wider uppercase">
                Open Membership
              </span>
            </div>
            <h2 className="text-white mb-5 text-4xl md:text-5xl font-bold">
              Your engineering journey starts here.
            </h2>
            <p className="text-white/70 text-lg mb-10 leading-relaxed">
              Join a global network of innovators, gain hands-on technical experience, and become part of a community that&apos;s shaping the future of engineering in Sri Lanka.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/join" className="btn btn-white btn-lg">
                Join IEEE WUSL <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/about" className="btn btn-white-outline btn-lg">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
