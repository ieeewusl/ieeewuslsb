import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { GalleryAlbum, GalleryImage } from '@/types/database'
import { formatDate } from '@/lib/utils'
import GalleryViewer from '@/components/public/GalleryViewer'

import { mockGalleryAlbums, mockGalleryImages } from '@/lib/mock-data'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('gallery_albums').select('title,description').eq('slug', slug).single()
    if (data) return { title: `${data.title} | IEEE WUSL Gallery`, description: data.description ?? undefined }
  } catch {}
  const mock = mockGalleryAlbums.find(a => a.slug === slug)
  if (mock) return { title: `${mock.title} | IEEE WUSL Gallery`, description: mock.description ?? undefined }
  return { title: 'Album Not Found' }
}

async function getAlbumData(slug: string) {
  try {
    const supabase = await createClient()
    const { data: album } = await supabase
      .from('gallery_albums')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (album) {
      const { data: images } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('album_id', album.id)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true })

      return {
        album: album as GalleryAlbum,
        images: (images ?? []) as GalleryImage[],
      }
    }
  } catch {}
  const mock = mockGalleryAlbums.find(a => a.slug === slug)
  const images = mockGalleryImages.filter(img => img.album_id === mock?.id)
  return { album: mock || null, images }
}

export default async function AlbumDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { album, images } = await getAlbumData(slug)

  if (!album) notFound()

  return (
    <>
      <section className="pt-32 pb-16 bg-gradient-to-b from-[var(--color-navy)] to-[var(--color-navy-800)]">
        <div className="container">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Gallery
          </Link>
          <div className="max-w-3xl">
            {album.event_date && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium mb-4">
                <Calendar className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                {formatDate(album.event_date)}
              </div>
            )}
            <h1 className="text-white mb-4">{album.title}</h1>
            {album.description && (
              <p className="text-white/70 text-lg leading-relaxed">{album.description}</p>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {images.length === 0 ? (
            <div className="text-center py-20 card p-8">
              <ImageIcon className="w-12 h-12 text-[var(--color-muted-light)] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">No photos in this album yet</h3>
              <p className="text-sm text-[var(--color-muted)]">Check back soon as we update this collection.</p>
            </div>
          ) : (
            <GalleryViewer images={images} albumTitle={album.title} />
          )}
        </div>
      </section>
    </>
  )
}
