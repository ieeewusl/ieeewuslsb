'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Link2, Check, AlertCircle } from 'lucide-react'

interface ImageUploadProps {
  label: string
  value?: string | null
  onChange: (url: string) => void
  folder?: string
  description?: string
  aspectRatio?: 'wide' | 'square' | 'any'
}

export default function ImageUpload({
  label,
  value,
  onChange,
  folder = 'logos',
  description = 'PNG, JPG, SVG or WEBP (Max 10MB)',
  aspectRatio = 'wide',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState(value || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file.')
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
      formData.append('folder', folder)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const data = await res.json()
      if (data.url) {
        onChange(data.url)
        setUrlInput(data.url)
      } else {
        throw new Error('No URL returned from upload')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.'
      setError(msg)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleRemove() {
    onChange('')
    setUrlInput('')
    setError(null)
  }

  function handleManualUrlApply() {
    onChange(urlInput.trim())
    setShowUrlInput(false)
  }

  const previewHeight = aspectRatio === 'wide' ? 'h-24 md:h-28' : 'h-32 w-32'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="label mb-0">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
        >
          <Link2 className="w-3 h-3" />
          {showUrlInput ? 'Hide URL input' : 'Enter URL instead'}
        </button>
      </div>

      {showUrlInput && (
        <div className="flex items-center gap-2 p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] mb-3">
          <input
            type="text"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="input text-sm py-1.5 flex-1"
          />
          <button
            type="button"
            onClick={handleManualUrlApply}
            className="btn btn-primary btn-sm shrink-0"
          >
            <Check className="w-3.5 h-3.5" /> Apply
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {value ? (
        <div className="relative border border-[var(--color-border)] rounded-xl p-4 bg-white flex flex-col sm:flex-row items-center gap-4">
          <div className={`relative ${previewHeight} max-w-full flex items-center justify-center bg-[var(--color-surface)] rounded-lg p-2 overflow-hidden border border-dashed border-[var(--color-border)]`}>
            {value.startsWith('http') || value.startsWith('/') || value.startsWith('data:') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt="Logo preview"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-xs text-[var(--color-muted)]">Invalid image source</span>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-medium text-[var(--color-text)] truncate max-w-xs md:max-w-md">
              {value.startsWith('data:') ? 'Custom uploaded image' : value.split('/').pop()}
            </p>
            <p className="text-[11px] text-[var(--color-muted)] mt-0.5">
              Logo is set and active
            </p>
            <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn btn-outline btn-sm py-1 px-2.5 text-xs inline-flex items-center gap-1.5"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Change Image
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="btn btn-sm py-1 px-2.5 text-xs text-red-600 hover:bg-red-50 border border-red-200 inline-flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] bg-[var(--color-surface)] hover:bg-white rounded-xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
        >
          {uploading ? (
            <div className="py-4 flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
              <p className="text-sm font-medium text-[var(--color-text)]">Uploading logo...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-[var(--color-primary)] mb-3 transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-[var(--color-text)] mb-1">
                Click to upload logo or drag & drop
              </p>
              <p className="text-xs text-[var(--color-muted)]">{description}</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  )
}
