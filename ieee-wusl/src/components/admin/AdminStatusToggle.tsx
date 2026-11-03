'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PublicationStatus } from '@/types/database'

interface Props {
  id: string
  table: string
  currentStatus: PublicationStatus
}

const statusCycles: Record<PublicationStatus, PublicationStatus> = {
  draft: 'published',
  published: 'archived',
  archived: 'draft',
}

const statusClasses: Record<PublicationStatus, string> = {
  draft: 'badge-warning',
  published: 'badge-success',
  archived: 'badge-muted',
}

export default function AdminStatusToggle({ id, table, currentStatus }: Props) {
  const [status, setStatus] = useState<PublicationStatus>(currentStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function cycle() {
    const next = statusCycles[status]
    setLoading(true)
    const supabase = createClient()
    await supabase.from(table as 'events').update({ status: next }).eq('id', id)
    setStatus(next)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={cycle}
      disabled={loading}
      className={cn('badge cursor-pointer hover:opacity-75 transition-opacity disabled:opacity-50', statusClasses[status])}
      title={`Click to change status (current: ${status})`}
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
      {status}
    </button>
  )
}
