import Image from 'next/image'
import Link from 'next/link'
import { Mail, MapPin, ExternalLink } from 'lucide-react'
import { LinkedinIcon, FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon } from '@/components/ui/SocialIcons'

const footerLinks = {
  organization: [
    { label: 'About IEEE WUSL', href: '/about' },
    { label: 'Executive Committee', href: '/team' },
    { label: 'Technical Chapters', href: '/chapters' },
    { label: 'Join Us', href: '/join' },
  ],
  activities: [
    { label: 'Events', href: '/events' },
    { label: 'News & Announcements', href: '/news' },
    { label: 'Photo Gallery', href: '/gallery' },
  ],
  ieee: [
    { label: 'IEEE.org', href: 'https://www.ieee.org', external: true },
    { label: 'IEEE Region 10', href: 'https://ieeer10.org', external: true },
    { label: 'IEEE Sri Lanka Section', href: 'https://site.ieee.org/srilanka', external: true },
    { label: 'Membership Info', href: 'https://www.ieee.org/membership', external: true },
  ],
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[var(--color-navy)] text-white">
      {/* CTA Banner */}
      <div className="border-b border-white/10">
        <div className="container py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Ready to engineer your future?
              </h2>
              <p className="text-white/65 text-base max-w-lg">
                Join Sri Lanka&apos;s vibrant IEEE community at Wayamba University and connect with tomorrow&apos;s technology leaders.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/join" className="btn btn-accent">
                Join IEEE WUSL
              </Link>
              <Link href="/about" className="btn btn-white-outline">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-5" aria-label="IEEE WUSL Home">
              <Image
                src="/wusl-sb-logo-white.png"
                alt="IEEE Student Branch Wayamba University of Sri Lanka"
                width={280}
                height={44}
                className="h-10 md:h-11 w-auto max-w-[280px] object-contain"
              />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs mb-6">
              Connecting engineers, driving innovation, and building the future of technology at Wayamba University of Sri Lanka.
            </p>

            {/* Contact info */}
            <div className="space-y-2.5">
              <a
                href="mailto:ieee.wusl@gmail.com"
                className="flex items-center gap-2.5 text-sm text-white/60 hover:text-white transition-colors group"
              >
                <Mail className="w-4 h-4 text-white/40 group-hover:text-[var(--color-accent)] transition-colors" />
                ieee.wusl@gmail.com
              </a>
              <div className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
                <span>Wayamba University of Sri Lanka,<br />Kuliyapitiya, Sri Lanka</span>
              </div>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2 mt-6">
              {[
                { icon: LinkedinIcon, href: '#', label: 'LinkedIn' },
                { icon: FacebookIcon, href: '#', label: 'Facebook' },
                { icon: InstagramIcon, href: '#', label: 'Instagram' },
                { icon: TwitterIcon, href: '#', label: 'Twitter/X' },
                { icon: YoutubeIcon, href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/8 hover:bg-[var(--color-primary)] flex items-center justify-center transition-colors text-white/60 hover:text-white"
                  aria-label={label}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">
              Organization
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.organization.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">
              Activities
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.activities.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">
              IEEE
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.ieee.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors group"
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/40">
              © {year} IEEE Student Branch, Wayamba University of Sri Lanka. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-xs text-white/30 hover:text-white/60 transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
