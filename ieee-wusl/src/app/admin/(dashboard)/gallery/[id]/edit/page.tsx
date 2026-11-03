import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GalleryAlbumForm from '@/components/admin/GalleryAlbumForm'
import type { GalleryAlbum, GalleryImage } from '@/types/database'
import Image from 'next/image'

export default async function EditGalleryAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [albumRes, imagesRes] = await Promise.all([
    supabase.from('gallery_albums').select('*').eq('id', id).single(),
    supabase.from('gallery_images').select('*').eq('album_id', id).order('display_order', { ascending: true }),
  ])

  if (!albumRes.data) notFound()

  const album = albumRes.data as GalleryAlbum
  const images = (imagesRes.data ?? []) as GalleryImage[]

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Edit Album</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1 truncate">{album.title}</p>
      </div>

      <GalleryAlbumForm initialData={album} mode="edit" />

      {/* Album Images Section */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <h2 className="text-base font-bold text-[var(--color-text)]">
            Album Images ({images.length})
          </h2>
        </div>

        {images.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)] py-4 text-center">
            No images in this album yet. Add images via Supabase Storage or direct upload.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-[var(--color-border)] bg-slate-900">
                <Image src={img.url} alt={img.alt_text || 'Album image'} fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
