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
import { formatDate, formatDateTime, isEventPast, getInitials, categoryLabel } from '@/lib/utils'
import type { Event, Chapter, NewsArticle, TeamMember } from '@/types/database'
import { mockEvents, mockChapters, mockNews, mockTeamMembers } from '@/lib/mock-data'
import SpotlightSection from '@/components/public/SpotlightSection'
import ParallaxHero from '@/components/public/ParallaxHero'

export const metadata: Metadata = {
  title: 'IEEE Student Branch — Wayamba University of Sri Lanka',
  description:
    'The IEEE Student Branch at Wayamba University of Sri Lanka. Engineering Ideas. Creating Impact.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getHomeData() {
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-wusl')
  )

  try {
    const supabase = await createClient()

    const [eventsRes, chaptersRes, newsRes, teamRes, hotEventsRes, settingsRes] = await Promise.all([
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
        .limit(7),
      supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .eq('featured', true)
        .order('start_at', { ascending: true }),
      supabase
        .from('site_settings')
        .select('*'),
    ])

    // If Supabase is connected, trust its database results directly (so deletions/empty states work properly)
    const events = isSupabaseConfigured && !eventsRes.error && eventsRes.data
      ? (eventsRes.data as Event[])
      : (eventsRes.data && eventsRes.data.length > 0) ? (eventsRes.data as Event[]) : mockEvents.slice(0, 3)

    const chapters = isSupabaseConfigured && !chaptersRes.error && chaptersRes.data
      ? (chaptersRes.data as Chapter[])
      : (chaptersRes.data && chaptersRes.data.length > 0) ? (chaptersRes.data as Chapter[]) : mockChapters

    const news = isSupabaseConfigured && !newsRes.error && newsRes.data
      ? (newsRes.data as Partial<NewsArticle>[])
      : (newsRes.data && newsRes.data.length > 0) ? (newsRes.data as Partial<NewsArticle>[]) : mockNews.slice(0, 3)

    const team = isSupabaseConfigured && !teamRes.error && teamRes.data
      ? (teamRes.data as TeamMember[])
      : (teamRes.data && teamRes.data.length > 0) ? (teamRes.data as TeamMember[]) : mockTeamMembers.slice(0, 7)

    // For Hot Events: if Supabase is connected, whatever is in the DB is truth! If 0 featured events, hotEvents is [] and spotlight hides.
    const hotEvents = isSupabaseConfigured && !hotEventsRes.error && hotEventsRes.data
      ? (hotEventsRes.data as Event[])
      : (hotEventsRes.data && hotEventsRes.data.length > 0) ? (hotEventsRes.data as Event[]) : mockEvents.filter(e => e.featured)

    const settingsMap: Record<string, unknown> = {}
    if (settingsRes.data) {
      settingsRes.data.forEach((s: { key: string; value: unknown }) => {
        settingsMap[s.key] = s.value
      })
    }
    const hideSpotlight = settingsMap.show_spotlight_section === false || settingsMap.show_spotlight_section === 'false'

    return { events, chapters, news, team, hotEvents, hideSpotlight }
  } catch {
    return {
      events: isSupabaseConfigured ? [] : mockEvents.slice(0, 3),
      chapters: isSupabaseConfigured ? [] : mockChapters,
      news: isSupabaseConfigured ? [] : mockNews.slice(0, 3),
      team: isSupabaseConfigured ? [] : mockTeamMembers.slice(0, 7),
      hotEvents: isSupabaseConfigured ? [] : mockEvents.filter(e => e.featured),
      hideSpotlight: false,
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
  const { events, chapters, news, team, hotEvents, hideSpotlight } = await getHomeData()

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[var(--color-navy)]" aria-label="Hero">
        {/* Parallax Background image & lighting layers */}
        <ParallaxHero
          imageSrc="/hero.jpg"
          alt="Engineering students collaborating in a university lab"
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
                  <div className="text-xs text-[var(--color-muted)] uppercase tracking-wider">WUSL</div>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {chapters.length > 0
              ? chapters.map((chapter) => {
                const Icon = chapterIcons[chapter.slug] ?? Cpu
                const gradient = chapterColors[chapter.slug] ?? 'from-blue-600 to-blue-800'
                return (
                  <Link
                    key={chapter.id}
                    href={`/chapters/${chapter.slug}`}
                    className="card group p-6 flex flex-col items-center text-center hover:scale-[1.02] hover:shadow-xl transition-all duration-300 border border-[var(--color-border)]"
                  >
                    {/* Big Centered Chapter Logo */}
                    <div className="relative w-full h-28 sm:h-32 rounded-2xl bg-white border border-[var(--color-border)]/80 shadow-sm p-4 flex items-center justify-center mb-5 mx-auto group-hover:shadow-md group-hover:border-[var(--color-primary)]/40 transition-all overflow-hidden">
                      {chapter.logo_url ? (
                        <Image
                          src={chapter.logo_url}
                          alt={`${chapter.name} logo`}
                          fill
                          className="object-contain p-2.5 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-primary)] transition-colors text-center line-clamp-2">
                      IEEE {chapter.name}
                    </h3>

                    <p className="text-sm text-[var(--color-muted)] leading-relaxed flex-1 text-center line-clamp-3 mb-4">
                      {chapter.short_desc}
                    </p>

                    <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] pt-3 border-t border-[var(--color-border)] w-full">
                      Explore Chapter <ChevronRight className="w-3.5 h-3.5" />
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
                  <Link
                    key={slug}
                    href={`/chapters/${slug}`}
                    className="card group p-6 flex flex-col items-center text-center hover:scale-[1.02] hover:shadow-xl transition-all duration-300 border border-[var(--color-border)]"
                  >
                    <div className="relative w-full h-28 sm:h-32 rounded-2xl bg-white border border-[var(--color-border)]/80 shadow-sm p-4 flex items-center justify-center mb-5 mx-auto group-hover:shadow-md group-hover:border-[var(--color-primary)]/40 transition-all overflow-hidden">
                      <Image
                        src={`/chapters/${slug}.svg`}
                        alt={`IEEE ${name} logo`}
                        fill
                        className="object-contain p-2.5 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-base font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-primary)] transition-colors text-center line-clamp-2">
                      IEEE {name}
                    </h3>
                    <p className="text-sm text-[var(--color-muted)] leading-relaxed flex-1 text-center line-clamp-3 mb-4">{desc}</p>
                    <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] pt-3 border-t border-[var(--color-border)] w-full">
                      Explore Chapter <ChevronRight className="w-3.5 h-3.5" />
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
                <article key={event.id} className="card group flex flex-col overflow-hidden">
                  {/* Event Cover Image */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-primary)]">
                    <Image
                      src={event.cover_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80'}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="badge badge-primary">{categoryLabel(event.category)}</span>
                      {isPast ? (
                        <span className="badge badge-muted">Past</span>
                      ) : (
                        <span className="badge badge-success">Upcoming</span>
                      )}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                      <Link href={`/events/${event.slug}`}>
                        {event.title}
                      </Link>
                    </h3>

                    <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4 flex-1 line-clamp-3">
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

      {/* ── HOT EVENTS SPOTLIGHT ── */}
      <SpotlightSection events={hotEvents} hideSection={hideSpotlight} />

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
              <article key={article.id} className="card group flex flex-col overflow-hidden">
                <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-primary)]">
                  <Image
                    src={article.cover_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80'}
                    alt={article.title ?? 'Article cover'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
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

          <div className="space-y-6">
            {[team.slice(0, 3), team.slice(3, 7)].map((row, rowIndex) => row.length > 0 && (
              <div
                key={rowIndex}
                className={`grid grid-cols-1 ${rowIndex === 0 ? 'sm:grid-cols-3' : 'sm:grid-cols-4'} gap-6`}
              >
                {row.map((member) => (
                  <div key={member.id} className="card group flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 border border-[var(--color-border)]">
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

                {/* Name Tag & Details */}
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
                          aria-label={`${member.full_name}'s LinkedIn`}
                        >
                          <LinkedinIcon size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                  </div>
                ))}
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
              src="/ieee.png"
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
