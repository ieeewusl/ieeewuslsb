import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // Verify active profile with correct role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile?.is_active || !profile.role) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex">
      <AdminSidebar userRole={profile.role} />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <AdminHeader
          userEmail={user.email ?? ''}
          userName={profile.full_name ?? user.email ?? ''}
          userRole={profile.role}
        />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
