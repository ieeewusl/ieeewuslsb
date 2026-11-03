import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Camera, Calendar, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { GalleryAlbum } from '@/types/database'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Photo Gallery',
  description: 'Explore photos and event memories from IEEE Student Branch at Wayamba University of Sri Lanka.',
}

import { mockGalleryAlbums } from '@/lib/mock-data'

async function getAlbums(): Promise<GalleryAlbum[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('gallery_albums')
      .select('*, gallery_images(count)')
      .eq('status', 'published')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (data && data.length > 0) return data as GalleryAlbum[]
    return mockGalleryAlbums
  } catch {
    return mockGalleryAlbums
  }
}

export default async function GalleryPage() {
  const albums = await getAlbums()

  return (
    <>
      <section className="pt-32 pb-16 bg-gradient-to-b from-[var(--color-navy)] to-[var(--color-navy-800)]">
        <div className="container">
          <div className="section-label" style={{ color: 'var(--color-bright-light)' }}>
            <span>Memories & Moments</span>
          </div>
          <h1 className="text-white mb-4">Branch Gallery</h1>
          <p className="text-white/60 text-lg max-w-xl">
            Moments of innovation, workshops, competitions, and community gatherings captured across our journey.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {albums.length === 0 ? (
            <div className="text-center py-24">
              <Camera className="w-16 h-16 text-[var(--color-muted-light)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">Gallery coming soon</h2>
              <p className="text-[var(--color-muted)]">Event photos and albums will be uploaded here shortly.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/gallery/${album.slug}`}
                  className="card group flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                    {album.cover_url ? (
                      <Image
                        src={album.cover_url}
                        alt={album.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/30">
                        <ImageIcon className="w-12 h-12 mb-2" />
                        <span className="text-xs">No cover image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                    {album.event_date && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white/90 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                        {formatDate(album.event_date)}
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-[var(--color-text)] text-lg mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                      {album.title}
                    </h3>
                    {album.description && (
                      <p className="text-sm text-[var(--color-muted)] line-clamp-2 leading-relaxed">
                        {album.description}
                      </p>
                    )}
                    <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-semibold text-[var(--color-primary)]">
                      <span>View Album</span>
                      <span>→</span>
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
