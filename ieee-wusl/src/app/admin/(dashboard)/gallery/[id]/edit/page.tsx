import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GalleryAlbumForm from '@/components/admin/GalleryAlbumForm'
import GalleryImageManager from '@/components/admin/GalleryImageManager'
import type { GalleryAlbum, GalleryImage } from '@/types/database'

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

      {/* Album Photos Manager */}
      <GalleryImageManager albumId={album.id} initialImages={images} />
    </div>
  )
}
