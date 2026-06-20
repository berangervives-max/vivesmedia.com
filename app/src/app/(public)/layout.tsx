import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import StickyMobileCta from '@/components/layout/StickyMobileCta'
import ScrollProgress from '@/components/layout/ScrollProgress'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <StickyMobileCta />
    </>
  )
}
