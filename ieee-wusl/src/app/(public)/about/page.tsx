import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Target, Users, Lightbulb, Globe, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about the IEEE Student Branch at Wayamba University of Sri Lanka — our mission, objectives, and how we serve the engineering community.',
}

const objectives = [
  'Provide technical education and learning opportunities beyond the classroom.',
  'Connect students with the global IEEE network and engineering community.',
  'Foster innovation through workshops, hackathons, and project initiatives.',
  'Develop professional skills including leadership, communication, and teamwork.',
  'Bridge the gap between academia and industry through mentorship and visits.',
  'Promote diversity and inclusion in engineering and technology fields.',
  'Support students in academic and career development throughout their studies.',
  'Represent WUSL in regional and international IEEE competitions and conferences.',
]

const pillars = [
  {
    icon: BookOpen,
    title: 'Technical Learning',
    desc: 'Hands-on workshops, bootcamps, and seminars on cutting-edge topics in engineering, programming, AI, robotics, and more.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Users,
    title: 'Student Development',
    desc: 'Leadership programs, mentoring sessions, and skill-building events that prepare students for professional engineering careers.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Globe,
    title: 'Community Impact',
    desc: 'Outreach initiatives, STEM education for schools, and community service programs that make engineering relevant to society.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Lightbulb,
    title: 'Industry Engagement',
    desc: 'Industry talks, company visits, career fairs, and networking events that connect students directly with engineering professionals.',
    color: 'bg-amber-50 text-amber-600',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-[var(--color-navy)] to-[var(--color-navy-800)]">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(22,135,217,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(0,98,155,0.3) 0%, transparent 50%)`,
          }}
        />
        <div className="container relative">
          <div className="max-w-3xl">
            <div className="section-label" style={{ color: 'var(--color-bright-light)' }}>
              <span>About IEEE WUSL</span>
            </div>
            <h1 className="text-white mb-6">
              More than a student club — a community of engineers.
            </h1>
            <p className="text-white/65 text-xl leading-relaxed max-w-2xl">
              The IEEE Student Branch at Wayamba University of Sri Lanka unites engineering students under a shared mission: to learn deeply, build meaningfully, and contribute to Sri Lanka&apos;s technological future.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="section-label">Mission</div>
              <h2 className="section-title">Why we exist</h2>
              <p className="text-[var(--color-muted)] text-lg leading-relaxed mb-6">
                Our mission is to foster technological innovation and excellence through education, collaboration, and community engagement — empowering Wayamba University students to become world-class engineers and leaders.
              </p>
              <p className="text-[var(--color-muted)] leading-relaxed mb-8">
                As part of the world&apos;s largest technical professional organization, we give every student access to a global network, cutting-edge resources, and opportunities that extend far beyond the classroom.
              </p>
              <div className="flex items-start gap-3 p-5 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/15">
                <Target className="w-6 h-6 text-[var(--color-primary)] mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-[var(--color-text)] mb-1">Our Vision</div>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                    To be the most impactful and innovative IEEE Student Branch in Sri Lanka — recognized for technical excellence, inclusive community, and meaningful contribution to engineering education.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[var(--color-text)]">Our Objectives</h3>
              <ul className="space-y-3">
                {objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)] mt-0.5 shrink-0" />
                    <span className="text-[var(--color-muted)] text-sm leading-relaxed">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars */}
      <section className="section section-surface">
        <div className="container">
          <div className="section-header-center">
            <div className="section-label justify-center">What We Do</div>
            <h2 className="section-title">Four pillars of our work</h2>
            <p className="section-desc section-desc-center">
              Every activity we organize falls within one of these core focus areas.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card p-6 flex flex-col">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[var(--color-text)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed flex-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About the University */}
      <section className="section">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
              <Image src="/about.jpg" alt="Wayamba University lecture hall" fill className="object-cover" />
            </div>
            <div>
              <div className="section-label">University</div>
              <h2 className="section-title">Wayamba University of Sri Lanka</h2>
              <p className="text-[var(--color-muted)] leading-relaxed mb-4">
                Established in 1999, Wayamba University of Sri Lanka is one of the country&apos;s leading state universities, known for academic excellence in engineering, technology, business, and science.
              </p>
              <p className="text-[var(--color-muted)] leading-relaxed mb-6">
                Located in Kuliyapitiya, the Faculty of Technology hosts our IEEE Student Branch — a community of the university&apos;s most passionate engineering students united by their love of technology and innovation.
              </p>
              <a
                href="https://www.wyb.ac.lk"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                Visit University Website <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-dark">
        <div className="container text-center">
          <h2 className="text-white mb-4">Become part of our story.</h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto">
            Whether you&apos;re a freshman or a final-year student, there&apos;s a place for you in IEEE WUSL.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/join" className="btn btn-primary btn-lg">
              Join Us Today <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/team" className="btn btn-white-outline btn-lg">
              Meet the Team
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
