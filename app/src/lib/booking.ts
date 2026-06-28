// Réservation d'appel — 2 outils au choix (Calendly + Cal.com), planning live embarqué.
// Les boutons « Réserver un appel » déclenchent l'événement, la modale (montée dans le layout public) l'écoute.

export const BOOKING = {
  calendly: 'https://calendly.com/vivesmedia',
  // Username réel du compte Cal.com (le username « vivesmedia » est réservé/premium côté Cal.com,
  // non modifiable par API). À basculer sur https://cal.com/vivesmedia si Béranger le réclame dans l'UI.
  calcom: 'https://cal.com/vives-beranger-4xsrgx',
}

export const BOOKING_EVENT = 'vm-open-booking'

export function openBooking() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BOOKING_EVENT))
  }
}
