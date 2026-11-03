import type { Metadata } from 'next'
import { Users, Shield, CheckCircle, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Users & Roles | Admin' }

async function getProfiles(): Promise<Profile[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    return (data ?? []) as Profile[]
  } catch {
    return []
  }
}

export default async function AdminUsersPage() {
  const profiles = await getProfiles()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Admin Users & Roles</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Manage administrative access, permissions, and roles (Super Admin, Administrator, Editor).
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        {profiles.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-[var(--color-muted-light)] mx-auto mb-3" />
            <h3 className="font-bold text-[var(--color-text)] mb-1">No admin profiles found</h3>
            <p className="text-sm text-[var(--color-muted)]">
              Admin users are created upon invitation or first login via Supabase Auth.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--color-surface)] text-[var(--color-muted)] text-xs uppercase font-semibold border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-[var(--color-surface)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--color-text)]">
                        {profile.full_name || 'Admin User'}
                      </div>
                      <div className="text-xs text-[var(--color-muted)] font-mono">
                        {profile.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        profile.role === 'super_admin'
                          ? 'bg-purple-100 text-purple-700'
                          : profile.role === 'administrator'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        <Shield className="w-3 h-3" />
                        {profile.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {profile.is_active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500 text-xs font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-muted)]">
                      {formatDate(profile.created_at)}
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
