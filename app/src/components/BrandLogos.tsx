// Logos de marque officiels (SVG inline, aucune dépendance) pour les outils de réservation.
// Couleurs fidèles aux chartes : Calendly #006BFF, Google Calendar (4 couleurs Google), cal.com noir.

type LogoProps = { className?: string; size?: number }

export function CalendlyLogo({ className, size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="Calendly">
      <rect width="48" height="48" rx="11" fill="#006BFF" />
      <path
        fill="#fff"
        d="M31.7 28.4c-.8 1-1.8 1.7-3 2.2-1.2.5-2.5.7-3.9.7-1.7 0-3.2-.4-4.5-1.1a7.9 7.9 0 0 1-3-3.1 9.4 9.4 0 0 1-1.1-4.6c0-1.7.4-3.2 1.1-4.5a8 8 0 0 1 3-3.1 8.8 8.8 0 0 1 4.5-1.1c1.4 0 2.7.2 3.8.7 1.2.5 2.2 1.2 3 2.2l-2.7 2.3a4.8 4.8 0 0 0-1.8-1.4 5 5 0 0 0-2.2-.5c-.9 0-1.8.2-2.5.7-.7.4-1.3 1-1.7 1.8-.4.8-.6 1.7-.6 2.7s.2 1.9.6 2.7c.4.8 1 1.4 1.7 1.8.7.5 1.6.7 2.5.7.8 0 1.5-.2 2.2-.5.7-.3 1.3-.8 1.8-1.4z"
      />
    </svg>
  )
}

export function GoogleCalendarLogo({ className, size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="Google Agenda">
      <rect x="8" y="8" width="32" height="32" rx="4" fill="#fff" stroke="#E0E0E0" strokeWidth="1" />
      <path fill="#4285F4" d="M16 8h-4a4 4 0 0 0-4 4v4h8z" />
      <path fill="#EA4335" d="M32 8h4a4 4 0 0 1 4 4v4h-8z" />
      <path fill="#34A853" d="M16 40h-4a4 4 0 0 1-4-4v-4h8z" />
      <path fill="#FBBC04" d="M32 40h4a4 4 0 0 0 4-4v-4h-8z" />
      <text x="24" y="30" fontSize="13" fontWeight="700" fill="#1A73E8" textAnchor="middle" fontFamily="Arial, sans-serif">31</text>
    </svg>
  )
}

export function GoogleGLogo({ className, size = 18 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="Google">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7A21.99 21.99 0 0 0 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18A13.2 13.2 0 0 1 11 24c0-1.45.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.94 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  )
}

export function CalcomLogo({ className, size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="Cal.com">
      <rect width="48" height="48" rx="11" fill="#111827" />
      <text x="24" y="30" fontSize="15" fontWeight="800" fill="#fff" textAnchor="middle" fontFamily="Arial, sans-serif" letterSpacing="-0.5">Cal</text>
    </svg>
  )
}
