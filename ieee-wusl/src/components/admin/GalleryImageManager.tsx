'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Link2,
  Upload,
  Plus,
  Trash2,
  Loader2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  FileText,
  ImageIcon,
} from 'lucide-react'
import type { GalleryImage } from '@/types/database'

interface GalleryImageManagerProps {
  albumId: string
  initialImages: GalleryImage[]
}

export default function GalleryImageManager({ albumId, initialImages }: GalleryImageManagerProps) {
  const router = useRouter()
  const [images, setImages] = useState<GalleryImage[]>(initialImages)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Active tab: 'single-url' | 'bulk-urls' | 'upload'
  const [activeTab, setActiveTab] = useState<'single-url' | 'bulk-urls' | 'upload'>('single-url')

  // Form states
  const [singleUrl, setSingleUrl] = useState('')
  const [singleCaption, setSingleCaption] = useState('')
  const [singleAlt, setSingleAlt] = useState('')

  const [bulkUrls, setBulkUrls] = useState('')

  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function flashSuccess(msg: string) {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  // 1. Add single image by URL
  async function handleAddSingleUrl(e: React.FormEvent) {
    e.preventDefault()
    const cleanUrl = singleUrl.trim()
    if (!cleanUrl) {
      setError('Please provide a valid image URL.')
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/gallery/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            album_id: albumId,
            images: [
              {
                url: cleanUrl,
                caption: singleCaption.trim() || undefined,
                alt_text: singleAlt.trim() || undefined,
              },
            ],
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to add image')

        setSingleUrl('')
        setSingleCaption('')
        setSingleAlt('')
        flashSuccess('Image added successfully!')
        router.refresh()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to add image')
      }
    })
  }

  // 2. Add bulk images by pasting multiple URLs (one per line)
  async function handleAddBulkUrls(e: React.FormEvent) {
    e.preventDefault()
    const lines = bulkUrls
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && (line.startsWith('http://') || line.startsWith('https://') || line.startsWith('/')))

    if (lines.length === 0) {
      setError('Please paste at least one valid image URL (e.g. https://ik.imagekit.io/...)')
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/gallery/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            album_id: albumId,
            images: lines.map(url => ({ url })),
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to add images')

        setBulkUrls('')
        flashSuccess(`Added ${lines.length} images to the album!`)
        router.refresh()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to add images')
      }
    })
  }

  // 3. Upload file
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.')
      return
    }

    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'gallery')

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const uploadData = await uploadRes.json()
      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.error || 'Upload failed')
      }

      // Add to gallery_images
      const res = await fetch('/api/gallery/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          album_id: albumId,
          images: [{ url: uploadData.url, storage_path: uploadData.path || uploadData.url }],
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save image')

      flashSuccess('Image uploaded and added!')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // 4. Delete image
  async function handleDeleteImage(imageId: string) {
    if (!confirm('Are you sure you want to remove this photo from the album?')) return

    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/gallery/images?id=${imageId}`, {
          method: 'DELETE',
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to delete image')

        setImages(prev => prev.filter(img => img.id !== imageId))
        flashSuccess('Photo removed')
        router.refresh()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete image')
      }
    })
  }

  return (
    <div className="card p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[var(--color-primary)]" />
            Album Photos ({initialImages.length})
          </h2>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            Add images via direct URL (ImageKit/CDN) to save Supabase storage, or upload files directly.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Add Images Box */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Tab switchers */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('single-url')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
              activeTab === 'single-url'
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'bg-white text-[var(--color-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            Paste Single URL
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bulk-urls')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
              activeTab === 'bulk-urls'
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'bg-white text-[var(--color-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Paste Bulk URLs (Save Space)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
              activeTab === 'upload'
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'bg-white text-[var(--color-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
        </div>

        {/* Tab 1: Single URL */}
        {activeTab === 'single-url' && (
          <form onSubmit={handleAddSingleUrl} className="space-y-3">
            <div>
              <label className="label text-xs">Image URL (e.g. from ImageKit, Unsplash, or CDN) *</label>
              <input
                type="url"
                required
                value={singleUrl}
                onChange={e => setSingleUrl(e.target.value)}
                placeholder="https://ik.imagekit.io/your_id/photo.jpg"
                className="input text-sm"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label text-xs">Caption (optional)</label>
                <input
                  type="text"
                  value={singleCaption}
                  onChange={e => setSingleCaption(e.target.value)}
                  placeholder="e.g. Keynote speaker presentation"
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="label text-xs">Alt Text (optional)</label>
                <input
                  type="text"
                  value={singleAlt}
                  onChange={e => setSingleAlt(e.target.value)}
                  placeholder="e.g. Students working on robotics prototype"
                  className="input text-sm"
                />
              </div>
            </div>

            {/* Live Preview if valid URL */}
            {singleUrl && (singleUrl.startsWith('http') || singleUrl.startsWith('/')) && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[var(--color-border)]">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={singleUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="text-xs truncate flex-1">
                  <p className="font-semibold text-[var(--color-text)] truncate">{singleUrl}</p>
                  <p className="text-[var(--color-muted)] text-[11px] mt-0.5">Image preview ready</p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isPending || !singleUrl.trim()}
                className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" /> Add Image
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Bulk URLs */}
        {activeTab === 'bulk-urls' && (
          <form onSubmit={handleAddBulkUrls} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label text-xs mb-0">Paste Multiple Image URLs (One per line) *</label>
                <span className="text-[11px] text-[var(--color-primary)] font-medium">
                  {bulkUrls.split('\n').filter(l => l.trim().length > 0).length} URLs entered
                </span>
              </div>
              <textarea
                rows={5}
                required
                value={bulkUrls}
                onChange={e => setBulkUrls(e.target.value)}
                placeholder={'https://ik.imagekit.io/user/agm-photo-1.jpg\nhttps://ik.imagekit.io/user/agm-photo-2.jpg\nhttps://ik.imagekit.io/user/agm-photo-3.jpg'}
                className="input text-xs font-mono"
              />
              <p className="text-[11px] text-[var(--color-muted)] mt-1">
                💡 Paste links from ImageKit, Cloudinary, Imgur, or any image host. Each line will become a photo in this album without using any Supabase storage space!
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isPending || !bulkUrls.trim()}
                className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding Images...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" /> Add All Images
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Upload File */}
        {activeTab === 'upload' && (
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] bg-white rounded-xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center text-center"
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Loader2 className="w-7 h-7 text-[var(--color-primary)] animate-spin" />
                  <p className="text-xs font-medium text-[var(--color-text)]">Uploading file to storage...</p>
                </div>
              ) : (
                <>
                  <Upload className="w-7 h-7 text-[var(--color-primary)] mb-2" />
                  <p className="text-xs font-semibold text-[var(--color-text)] mb-0.5">
                    Click to browse and upload photo
                  </p>
                  <p className="text-[11px] text-[var(--color-muted)]">PNG, JPG, WEBP (Max 10MB)</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Grid of Existing Album Images */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">
          Current Album Photos ({initialImages.length})
        </h3>

        {initialImages.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[var(--color-border)] rounded-2xl p-6 bg-[var(--color-surface)]">
            <ImageIcon className="w-10 h-10 text-[var(--color-muted-light)] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[var(--color-text)]">No photos in this album yet</p>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              Paste image URLs above or upload images to fill this album.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {initialImages.map((img, index) => (
              <div
                key={img.id}
                className="group relative aspect-square rounded-xl overflow-hidden border border-[var(--color-border)] bg-slate-900 shadow-xs hover:shadow-md transition-all"
              >
                {img.url.startsWith('data:') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt={img.alt_text || 'Photo'} className="w-full h-full object-cover" />
                ) : (
                  <Image
                    src={img.url}
                    alt={img.alt_text || 'Album photo'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                )}

                {/* Overlay with buttons */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                  <div className="flex justify-end gap-1">
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/90 transition-colors"
                      title="Open full image in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDeleteImage(img.id)}
                      className="p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-700 transition-colors"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-white text-[11px] truncate">
                    <p className="font-medium truncate">{img.caption || `Photo ${index + 1}`}</p>
                    <p className="text-[10px] text-white/70 truncate">{img.url}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

