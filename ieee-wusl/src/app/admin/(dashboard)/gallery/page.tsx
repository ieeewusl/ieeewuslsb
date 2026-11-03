import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Edit, Camera, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { GalleryAlbum } from '@/types/database'
import AdminDeleteButton from '@/components/admin/AdminDeleteButton'
import AdminStatusToggle from '@/components/admin/AdminStatusToggle'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Gallery | Admin' }

async function getAlbums(): Promise<GalleryAlbum[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('gallery_albums')
    .select('*, gallery_images(count)')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
  return (data ?? []) as GalleryAlbum[]
}

export default async function AdminGalleryPage() {
  const albums = await getAlbums()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Gallery Albums</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Manage event photo collections, albums, and image galleries.
          </p>
        </div>
        <Link href="/admin/gallery/new" className="btn btn-primary self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-1.5" /> New Album
        </Link>
      </div>

      <div className="card overflow-hidden">
        {albums.length === 0 ? (
          <div className="p-12 text-center">
            <Camera className="w-12 h-12 text-[var(--color-muted-light)] mx-auto mb-3" />
            <h3 className="font-bold text-[var(--color-text)] mb-1">No albums found</h3>
            <p className="text-sm text-[var(--color-muted)] mb-4">Create your first album to share branch photos.</p>
            <Link href="/admin/gallery/new" className="btn btn-primary btn-sm">
              <Plus className="w-4 h-4 mr-1" /> Add Album
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--color-surface)] text-[var(--color-muted)] text-xs uppercase font-semibold border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-6 py-4">Album</th>
                  <th className="px-6 py-4">Event Date</th>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {albums.map((album) => (
                  <tr key={album.id} className="hover:bg-[var(--color-surface)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--color-text)]">{album.title}</div>
                      <div className="text-xs text-[var(--color-muted)] font-mono mt-0.5">/{album.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-muted)]">
                      {album.event_date ? formatDate(album.event_date) : '—'}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-muted)]">
                      {album.display_order}
                    </td>
                    <td className="px-6 py-4">
                      <AdminStatusToggle
                        id={album.id}
                        currentStatus={album.status}
                        table="gallery_albums"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/gallery/${album.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)] transition-colors"
                          title="View on site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/gallery/${album.id}/edit`}
                          className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)] transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <AdminDeleteButton
                          id={album.id}
                          table="gallery_albums"
                          label={album.title}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
