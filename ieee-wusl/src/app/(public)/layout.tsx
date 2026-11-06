import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import BackToTop from '@/components/public/BackToTop'
import PageLoader from '@/components/public/PageLoader'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PageLoader />
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
      <BackToTop />
    </>
  )
}
