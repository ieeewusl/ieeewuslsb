import type { Metadata } from 'next'
import GalleryAlbumForm from '@/components/admin/GalleryAlbumForm'

export const metadata: Metadata = { title: 'New Album | Admin' }

export default function NewGalleryAlbumPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Create Album</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Create a new photo album for branch events and milestones.
        </p>
      </div>
      <GalleryAlbumForm mode="create" />
    </div>
  )
}
