'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Loader2 } from 'lucide-react'

interface Props {
  id: string
  table: string
  label: string
}

export default function AdminDeleteButton({ id, table, label }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Delete "${label}"? This action cannot be undone.`)) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from(table as 'events').delete().eq('id', id)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-muted)] hover:text-[var(--color-error)] transition-colors disabled:opacity-50"
      title="Delete"
      aria-label={`Delete ${label}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  )
}
