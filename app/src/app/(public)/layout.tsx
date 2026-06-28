import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import StickyMobileCta from '@/components/layout/StickyMobileCta'
import FloatingCallButton from '@/components/layout/FloatingCallButton'
import ScrollProgress from '@/components/layout/ScrollProgress'
import BookingModal from '@/components/booking/BookingModal'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <StickyMobileCta />
      <FloatingCallButton />
      <BookingModal />
    </>
  )
}
