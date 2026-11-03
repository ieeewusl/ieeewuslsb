'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import type { GalleryImage } from '@/types/database'

interface GalleryViewerProps {
  images: GalleryImage[]
  albumTitle: string
}

export default function GalleryViewer({ images, albumTitle }: GalleryViewerProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  const activeImage = activeIdx !== null ? images[activeIdx] : null

  function handlePrev() {
    if (activeIdx === null) return
    setActiveIdx((activeIdx - 1 + images.length) % images.length)
  }

  function handleNext() {
    if (activeIdx === null) return
    setActiveIdx((activeIdx + 1) % images.length)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') setActiveIdx(null)
    if (e.key === 'ArrowLeft') handlePrev()
    if (e.key === 'ArrowRight') handleNext()
  }

  return (
    <>
      {/* Grid of photos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            onClick={() => setActiveIdx(index)}
            className="group relative aspect-square rounded-xl overflow-hidden bg-slate-900 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
          >
            <Image
              src={image.url}
              alt={image.alt_text || `${albumTitle} image ${index + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Maximize2 className="w-5 h-5" />
              </div>
            </div>
            {image.caption && (
              <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-[11px] truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {image.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          onKeyDown={handleKeyDown}
          tabIndex={0}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
        >
          {/* Close button */}
          <button
            onClick={() => setActiveIdx(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
            aria-label="Close photo"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrev()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors z-50"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors z-50"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Main Photo */}
          <div className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center">
            <Image
              src={activeImage.url}
              alt={activeImage.alt_text || albumTitle}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Caption & Counter */}
          <div className="mt-4 text-center max-w-xl text-white">
            {activeImage.caption && (
              <p className="text-sm font-medium mb-1">{activeImage.caption}</p>
            )}
            <p className="text-xs text-white/50">
              {activeIdx! + 1} of {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
