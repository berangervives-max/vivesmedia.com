import posthog from 'posthog-js'

/**
 * Événements funnel vivesmedia.com — KPI descriptifs pour diagnostiquer
 * précisément OÙ et POURQUOI un visiteur ne passe pas à l'achat.
 *
 * Funnel cible :
 *   $pageview → service_viewed / pricing_viewed → cta_clicked
 *   → devis_started → devis_submitted   (voie conseil)
 *   → checkout_started → checkout_completed  (voie self-service)
 */
export type FunnelEvent =
  | 'cta_clicked'          // clic sur un appel à l'action (props: location, label, destination)
  | 'service_viewed'       // page service consultée (props: slug, title, price)
  | 'pricing_viewed'       // page tarifs consultée
  | 'devis_started'        // 1re interaction avec le formulaire de devis (props: source, service)
  | 'devis_step'           // étape franchie (props: step = type|budget|coords)
  | 'devis_submitted'      // devis envoyé (props: service, budget, has_message, has_phone)
  | 'devis_failed'         // échec d'envoi (props: reason)
  | 'newsletter_subscribed'// inscription newsletter (props: location)
  | 'checkout_started'     // clic Souscrire/Acheter (props: offer, price, mode)
  | 'checkout_completed'   // retour de paiement réussi (props: offer)
  | 'checkout_failed'      // échec création checkout (props: reason)

export function track(event: FunnelEvent, props: Record<string, unknown> = {}) {
  try {
    posthog.capture(event, props)
  } catch {
    /* PostHog pas encore initialisé : on ignore silencieusement */
  }
}
