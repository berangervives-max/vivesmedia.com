import Abby from '@abby-inc/node'

/**
 * Intégration Abby (facturation électronique 2026, plateforme française agréée).
 *
 * ⚠️ SERVEUR UNIQUEMENT — ne jamais importer ce fichier côté client.
 * La clé API vit dans la variable d'environnement ABBY_API_KEY
 * (Vercel dashboard en prod, .env.local en dev). Jamais dans le code.
 *
 * Doc : https://docs.abby.fr/api  ·  SDK : @abby-inc/node
 */

let _client: Abby | null = null

/** Retourne le client Abby, ou null si la clé n'est pas configurée. */
export function getAbbyClient(): Abby | null {
  const key = process.env.ABBY_API_KEY
  if (!key) return null
  if (!_client) _client = new Abby(key)
  return _client
}

export function isAbbyConfigured(): boolean {
  return Boolean(process.env.ABBY_API_KEY)
}

type CreerFactureParams = {
  /** Nom complet du client (depuis Stripe customer_details.name) */
  clientNom: string
  /** Email du client */
  clientEmail: string
  /** Libellé de la prestation (ex. "Site Vitrine") */
  service: string
  /** Montant payé en euros (TTC). Pour la micro-entreprise en franchise de TVA, TTC = HT. */
  montant: number
}

/**
 * Crée une facture finalisée dans Abby à partir d'une commande Stripe payée.
 *
 * Flux Abby : 1) créer le contact → 2) créer la facture brouillon pour ce contact
 * → 3) ajouter la ligne de prestation → 4) finaliser (numérotation légale).
 *
 * Hypothèse de TVA : vivesmedia.com est en micro-entreprise (franchise en base,
 * art. 293 B du CGI) → vatCode 'FR_00HT' (TVA non applicable). À adapter si
 * passage au réel (FR_2000 = 20 %).
 *
 * @returns l'id de la facture Abby créée, ou null si Abby n'est pas configuré.
 */
export async function creerFactureAbby(
  params: CreerFactureParams,
): Promise<{ invoiceId: string } | null> {
  const abby = getAbbyClient()
  if (!abby) return null

  // 1. Contact (particulier). Pour du B2B avec SIRET, utiliser abby.organization.
  const nom = (params.clientNom || '').trim()
  const parts = nom.split(/\s+/).filter(Boolean)
  const firstname = parts[0] || 'Client'
  const lastname = parts.slice(1).join(' ') || firstname

  const { data: contact } = await abby.contact.createContact({
    body: {
      firstname,
      lastname,
      emails: params.clientEmail ? [params.clientEmail] : undefined,
    },
  })
  if (!contact?.id) throw new Error('Abby: contact non créé')

  // 2. Facture brouillon rattachée au contact.
  const { data: invoice } = await abby.invoice.createInvoiceByContactOrOrganizationId({
    path: { customerId: contact.id },
  })
  if (!invoice?.id) throw new Error('Abby: facture non créée')

  // 3. Ligne de prestation (unitPrice en centimes).
  await abby.billing.updateLines({
    path: { billingId: invoice.id },
    body: {
      lines: [
        {
          designation: params.service || 'Prestation web sur-mesure',
          unitPrice: Math.round(params.montant * 100),
          quantity: 1,
          quantityUnit: 'fixed_rate',
          type: 'service_delivery',
          vatCode: 'FR_00HT',
          isTaxIncluded: true,
        },
      ],
    },
  })

  // 4. Finalisation (passe le brouillon en facture définitive numérotée).
  await abby.billing.finalize({ path: { billingId: invoice.id } })

  return { invoiceId: invoice.id }
}
