import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, MapPin, ExternalLink, Users, ArrowRight } from 'lucide-react'
import { LinkedinIcon, FacebookIcon, InstagramIcon, TwitterIcon, WhatsAppIcon } from '@/components/ui/SocialIcons'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Join IEEE WUSL',
  description: 'Become a member of the IEEE Student Branch at Wayamba University of Sri Lanka. Discover membership benefits and how to join.',
}

const benefits = [
  'Access to IEEE Xplore digital library with 5M+ technical documents',
  'Global network of 420,000+ engineering professionals',
  'Exclusive workshops, seminars, and technical training',
  'Leadership and professional development opportunities',
  'Eligibility for IEEE Student competitions and conferences',
  'Access to technical papers and research resources',
  'Recognition and certification for technical achievements',
  'Discounts on IEEE conferences, courses, and publications',
]

const steps = [
  { step: '01', title: 'Create an IEEE Account', desc: 'Visit ieee.org and create a free account using your university email address.' },
  { step: '02', title: 'Purchase Student Membership', desc: 'Select the IEEE Student Membership option. Student rates are highly discounted.' },
  { step: '03', title: 'Join WUSL Student Branch', desc: 'Contact us to be added to the WUSL branch and start participating in activities.' },
  { step: '04', title: 'Get Involved', desc: 'Attend events, join a technical chapter, and contribute to our community.' },
]

export default async function JoinPage() {
  let whatsappChannelUrl = process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL || 'https://whatsapp.com/channel/'

  try {
    const supabase = await createClient()
    const { data: settingsData } = await supabase
      .from('site_settings')
      .select('key, value')
      .eq('key', 'whatsapp_channel_url')
      .single()

    if (settingsData && settingsData.value) {
      whatsappChannelUrl = String(settingsData.value)
    }
  } catch {}

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-navy)]">
        <div className="container">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20">
              <Users className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-semibold text-white tracking-wider uppercase">Open Membership</span>
            </div>
            <h1 className="text-white mb-6">Join IEEE WUSL</h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Become part of Sri Lanka&apos;s most vibrant engineering student community. Access global resources, build skills, and connect with tomorrow&apos;s technology leaders.
            </p>
          </div>
        </div>
      </section>

      {/* Official WhatsApp Channel Section */}
      <section className="py-10 bg-emerald-50/70 border-b border-emerald-100">
        <div className="container">
          <div className="card p-7 sm:p-9 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white relative overflow-hidden shadow-xl border-none">
            {/* Background WhatsApp watermark */}
            <div className="absolute right-0 top-0 bottom-0 w-80 opacity-10 pointer-events-none flex items-center justify-center">
              <WhatsAppIcon size={260} />
            </div>

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                Official Community Channel
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                Join our Official WhatsApp Channel
              </h2>

              <p className="text-white/85 text-sm sm:text-base leading-relaxed mb-6">
                Get real-time announcements on upcoming competitions, hands-on workshops, volunteer recruitment, chapter events, and branch opportunities directly on your WhatsApp.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={whatsappChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn bg-white text-emerald-900 hover:bg-emerald-50 hover:text-emerald-950 font-bold px-5 py-3 rounded-xl shadow-lg inline-flex items-center gap-2.5 transition-all text-sm sm:text-base active:scale-95"
                >
                  <WhatsAppIcon size={20} className="text-emerald-600" />
                  Follow WhatsApp Channel
                  <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
                </a>

                <span className="text-xs text-white/80 font-medium">
                  ✓ Free to join · Open to all undergraduates
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="section">
        <div className="container">
          <div className="section-header-center">
            <div className="section-label justify-center">How to Join</div>
            <h2 className="section-title">Four simple steps</h2>
            <p className="section-desc section-desc-center">Joining IEEE WUSL takes less than 15 minutes.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="card p-6 flex flex-col">
                <div className="text-4xl font-bold text-[var(--color-border-dark)] mb-4">{step}</div>
                <h3 className="font-bold text-[var(--color-text)] mb-2 text-base">{title}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a
              href="https://www.ieee.org/membership/students/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg"
            >
              Start on IEEE.org <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section section-surface">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="section-label">Member Benefits</div>
              <h2 className="section-title">Why become an IEEE member?</h2>
              <p className="text-[var(--color-muted)] leading-relaxed mb-8">
                IEEE student membership gives you access to the world&apos;s largest technical professional organization — and our branch gives you a local home for that global community.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                    </div>
                    <span className="text-sm text-[var(--color-muted)] leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact card */}
            <div>
              <div className="card p-8">
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">Get in touch</h3>
                <p className="text-sm text-[var(--color-muted)] mb-6">
                  Have questions about membership? Reach out to the committee and we&apos;ll be happy to help.
                </p>
                <div className="space-y-4 mb-6">
                  <a href="mailto:ieee.wusl@gmail.com" className="flex items-center gap-3 text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-surface)] flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
                      <Mail className="w-4 h-4 text-[var(--color-primary)]" />
                    </div>
                    ieee.wusl@gmail.com
                  </a>
                  <div className="flex items-start gap-3 text-sm text-[var(--color-muted)]">
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-surface)] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                    </div>
                    <span>Wayamba University of Sri Lanka,<br />Kuliyapitiya, Sri Lanka</span>
                  </div>
                </div>
                <div className="border-t border-[var(--color-border)] pt-5">
                  <div className="text-xs text-[var(--color-muted)] mb-3">Find us on social media</div>
                  <div className="flex items-center gap-2">
                    <a
                      href={whatsappChannelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-600 hover:text-emerald-700 transition-colors"
                      title="Follow our WhatsApp Channel"
                    >
                      <WhatsAppIcon size={18} />
                    </a>
                    {[LinkedinIcon, FacebookIcon, InstagramIcon, TwitterIcon].map((Icon, i) => (
                      <a key={i} href="#" className="w-9 h-9 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors">
                        <Icon className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
