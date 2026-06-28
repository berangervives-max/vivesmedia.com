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

export function CalcomLogo({ className, size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="Cal.com">
      <rect width="48" height="48" rx="11" fill="#111827" />
      <text x="24" y="30" fontSize="15" fontWeight="800" fill="#fff" textAnchor="middle" fontFamily="Arial, sans-serif" letterSpacing="-0.5">Cal</text>
    </svg>
  )
}
