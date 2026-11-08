'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Plus, X, Check, Loader2, Trash2, AlertCircle } from 'lucide-react'
import type { CommitteeTerm } from '@/types/database'

export default function CommitteeTermsManager({ terms }: { terms: CommitteeTerm[] }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // New term form state
  const [label, setLabel] = useState('2025/2026')
  const [startYear, setStartYear] = useState('2025')
  const [endYear, setEndYear] = useState('2026')
  const [isCurrent, setIsCurrent] = useState(true)

  async function handleAddTerm(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!label.trim()) {
      setError('Please provide a term label (e.g. 2025/2026).')
      return
    }

    const sYear = parseInt(startYear, 10)
    const eYear = parseInt(endYear, 10)
    if (isNaN(sYear) || isNaN(eYear)) {
      setError('Start year and end year must be valid numbers.')
      return
    }

    startTransition(async () => {
      try {
        const supabase = createClient()

        if (isCurrent) {
          // If setting as current, mark all others as not current
          await supabase.from('committee_terms').update({ is_current: false }).neq('id', '00000000-0000-0000-0000-000000000000')
        }

        const { error: insertError } = await supabase.from('committee_terms').insert([
          {
            label: label.trim(),
            start_year: sYear,
            end_year: eYear,
            is_current: isCurrent,
          },
        ])

        if (insertError) {
          setError(insertError.message)
          return
        }

        // Reset inputs and refresh
        setLabel('')
        setStartYear('')
        setEndYear('')
        router.refresh()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to add term.')
      }
    })
  }

  async function handleSetCurrent(termId: string) {
    setError(null)
    startTransition(async () => {
      try {
        const supabase = createClient()
        await supabase.from('committee_terms').update({ is_current: false }).neq('id', '00000000-0000-0000-0000-000000000000')
        const { error: updateError } = await supabase.from('committee_terms').update({ is_current: true }).eq('id', termId)
        if (updateError) {
          setError(updateError.message)
          return
        }
        router.refresh()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update current term.')
      }
    })
  }

  async function handleDelete(termId: string, termLabel: string) {
    if (!confirm(`Are you sure you want to delete "${termLabel}"? Members assigned to this term will become ungrouped.`)) {
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        const supabase = createClient()
        const { error: delError } = await supabase.from('committee_terms').delete().eq('id', termId)
        if (delError) {
          setError(delError.message)
          return
        }
        router.refresh()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete term.')
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn btn-outline btn-sm inline-flex items-center gap-1.5"
      >
        <Calendar className="w-4 h-4" /> Manage Terms
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="card w-full max-w-lg p-6 space-y-5 bg-white relative shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
                <h2 className="text-lg font-bold text-[var(--color-text)]">Committee Terms</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Existing Terms List */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">
                Existing Terms ({terms.length})
              </h3>
              {terms.length === 0 ? (
                <p className="text-xs text-[var(--color-muted)] py-2">No committee terms added yet.</p>
              ) : (
                <div className="divide-y divide-[var(--color-border)] border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-surface)]">
                  {terms.map((t) => (
                    <div key={t.id} className="p-3 flex items-center justify-between gap-3 bg-white hover:bg-[var(--color-surface)] transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[var(--color-text)]">{t.label}</span>
                          {t.is_current && (
                            <span className="badge badge-success text-[10px] py-0.5 px-2">Current</span>
                          )}
                        </div>
                        <span className="text-xs text-[var(--color-muted)]">
                          {t.start_year} – {t.end_year}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {!t.is_current && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleSetCurrent(t.id)}
                            className="btn btn-outline btn-sm py-1 px-2.5 text-xs inline-flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Make Current
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDelete(t.id, t.label)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                          title="Delete term"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Term Form */}
            <form onSubmit={handleAddTerm} className="pt-4 border-t border-[var(--color-border)] space-y-4">
              <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">
                Add New Term
              </h3>

              <div>
                <label className="label text-xs">Term Label (e.g. 2025/2026)</label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => {
                    const val = e.target.value
                    setLabel(val)
                    // Auto-fill years if formatted like 2025/2026
                    const parts = val.split('/')
                    if (parts.length === 2 && parts[0].length === 4 && parts[1].length === 4) {
                      setStartYear(parts[0])
                      setEndYear(parts[1])
                    }
                  }}
                  placeholder="2025/2026"
                  className="input text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Start Year</label>
                  <input
                    type="number"
                    required
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                    placeholder="2025"
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="label text-xs">End Year</label>
                  <input
                    type="number"
                    required
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    placeholder="2026"
                    className="input text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isCurrentTerm"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <label htmlFor="isCurrentTerm" className="text-xs text-[var(--color-text)] cursor-pointer">
                  Set as current/active committee term
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-outline btn-sm"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Add Term
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

