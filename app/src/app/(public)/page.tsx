import type { Metadata } from 'next'
import HeroSection from '@/components/home/HeroSection'
import LogoMarquee from '@/components/home/LogoMarquee'
import AboutSection from '@/components/home/AboutSection'
import ServicesSection from '@/components/home/ServicesSection'
import WorkSection from '@/components/home/WorkSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import FaqSection from '@/components/home/FaqSection'
import CtaSection from '@/components/home/CtaSection'

export const metadata: Metadata = {
  title: 'vivesmedia.com — Création de sites web sur-mesure · Devis gratuit',
  description: 'Freelance web, design & marketing basé à Avignon. Sites vitrines, e-commerce, SEO et CRM IA sur-mesure. Full remote partout en France. Devis gratuit sous 24h.',
  alternates: { canonical: 'https://vivesmedia.com/' },
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <LogoMarquee />
      <AboutSection />
      <ServicesSection />
      <WorkSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </>
  )
}
