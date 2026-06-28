// Réservation d'appel — 2 outils au choix (Calendly + Cal.com), planning live embarqué.
// Les boutons « Réserver un appel » déclenchent l'événement, la modale (montée dans le layout public) l'écoute.

export const BOOKING = {
  calendly: 'https://calendly.com/vivesmedia',
  calcom: 'https://cal.com/vivesmediacom',
}

export const BOOKING_EVENT = 'vm-open-booking'

// Page publique cal.com/vivesmediacom live (200) → onglet Cal.com actif avec planning embarqué.
export const CALCOM_LIVE = true

export function openBooking() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BOOKING_EVENT))
  }
}
