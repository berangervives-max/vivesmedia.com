const LOGOS = [
  { src: '/images/b59027bc3_ads-logo-horizontal.png', alt: 'Google Ads' },
  { src: '/images/e06138172_6a15c44f5826e1ea74a830f3_Companylogo1.png', alt: 'Shopify' },
  { src: '/images/fffde6f9d_6a15c44f5826e1ea74a830ef_Companylogo4-p-130x130q80.png', alt: 'Webflow' },
  { src: '/images/2a2e42a00_6a15c44f5826e1ea74a830f0_Companylogo5.png', alt: 'Framer' },
]

export default function LogoMarquee() {
  const all = [...LOGOS, ...LOGOS, ...LOGOS]
  return (
    <section className="py-14 overflow-hidden bg-white border-y border-border/25">
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border/25" />
          <p className="text-xs text-muted-foreground text-center whitespace-nowrap uppercase tracking-wider">Des outils fiables, intégrés proprement</p>
          <div className="flex-1 h-px bg-border/25" />
        </div>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
        <div className="flex animate-marquee items-center">
          {all.map((logo, i) => (
            <div key={i} className="flex-shrink-0 px-12 flex items-center justify-center h-20">
              <img src={logo.src} alt={logo.alt} className="h-12 md:h-14 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
