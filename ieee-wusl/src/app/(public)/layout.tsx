import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import BackToTop from '@/components/public/BackToTop'
import PageLoader from '@/components/public/PageLoader'
import { createClient } from '@/lib/supabase/server'
import { mockChapters } from '@/lib/mock-data'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let chapters: { name: string; slug: string }[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('chapters')
      .select('name, slug')
      .eq('status', 'published')
      .order('display_order', { ascending: true })

    if (data && data.length > 0) {
      chapters = data
    } else {
      chapters = mockChapters.map(c => ({ name: c.name, slug: c.slug }))
    }
  } catch {
    chapters = mockChapters.map(c => ({ name: c.name, slug: c.slug }))
  }

  return (
    <>
      <PageLoader />
      <Navbar chapters={chapters} />
      <main id="main-content">{children}</main>
      <Footer />
      <BackToTop />
    </>
  )
}
