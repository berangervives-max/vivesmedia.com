// Réservation d'appel — 2 outils au choix (Calendly + Cal.com), planning live embarqué.
// Les boutons « Réserver un appel » déclenchent l'événement, la modale (montée dans le layout public) l'écoute.

export const BOOKING = {
  calendly: 'https://calendly.com/vivesmedia',
  // Username réel du compte Cal.com (le username « vivesmedia » est réservé/premium côté Cal.com,
  // non modifiable par API). À basculer sur https://cal.com/vivesmedia si Béranger le réclame dans l'UI.
  calcom: 'https://cal.com/vives-beranger-4xsrgx',
}

export const BOOKING_EVENT = 'vm-open-booking'

// Passer à true dès que la page publique cal.com/<username> répond (200).
// Tant que false, l'onglet Cal.com de la modale montre « activation en cours » au lieu d'un 404.
export const CALCOM_LIVE = false

export function openBooking() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BOOKING_EVENT))
  }
}
