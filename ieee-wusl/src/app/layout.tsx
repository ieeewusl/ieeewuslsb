import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'IEEE Student Branch — Wayamba University of Sri Lanka',
    template: '%s | IEEE WUSL',
  },
  description:
    'The IEEE Student Branch at Wayamba University of Sri Lanka — connecting engineers, driving innovation, and building the future of technology.',
  keywords: ['IEEE', 'student branch', 'Wayamba University', 'engineering', 'Sri Lanka', 'WUSL'],
  authors: [{ name: 'IEEE Student Branch WUSL' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'IEEE Student Branch WUSL',
    title: 'IEEE Student Branch — Wayamba University of Sri Lanka',
    description:
      'The IEEE Student Branch at Wayamba University of Sri Lanka — connecting engineers, driving innovation, and building the future of technology.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IEEE Student Branch WUSL',
    description: 'Connecting engineers, driving innovation.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
