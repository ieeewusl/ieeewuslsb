'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface BioExpandableProps {
  bio?: string | null
  limit?: number
}

export default function BioExpandable({ bio, limit = 85 }: BioExpandableProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!bio || bio.trim().length === 0) return null

  const isLong = bio.length > limit || bio.includes('\n')

  return (
    <div className="text-xs text-[var(--color-muted)] leading-relaxed mb-4 flex-1">
      <p className={isExpanded ? 'whitespace-pre-line break-words' : 'line-clamp-2'}>
        {bio}
      </p>

      {isLong && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 text-[11px] font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] hover:underline inline-flex items-center gap-0.5 cursor-pointer transition-colors"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'See less' : 'See more'}</span>
          {isExpanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      )}
    </div>
  )
}

