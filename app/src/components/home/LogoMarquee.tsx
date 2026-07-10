const LOGOS = [
  { src: '/images/logos/google-ads.svg', alt: 'Google Ads', name: 'Google Ads' },
  { src: '/images/logos/shopify.svg', alt: 'Shopify', name: 'Shopify' },
  { src: '/images/logos/webflow.svg', alt: 'Webflow', name: 'Webflow' },
  { src: '/images/logos/framer.svg', alt: 'Framer', name: 'Framer' },
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
            <div key={i} className="flex-shrink-0 px-10 flex items-center gap-3 h-20 opacity-70 hover:opacity-100 transition-opacity">
              <img src={logo.src} alt={logo.alt} className="h-9 md:h-10 w-auto object-contain" />
              <span className="text-xl md:text-2xl font-semibold tracking-tight text-foreground/80 whitespace-nowrap">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
