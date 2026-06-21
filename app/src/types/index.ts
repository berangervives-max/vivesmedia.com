export type ClientStatut = 'prospect' | 'actif' | 'pause' | 'termine'
export type DevisStatut = 'nouveau' | 'contacte' | 'en_cours' | 'accepte' | 'refuse'
export type FactureStatut = 'brouillon' | 'envoyee' | 'payee' | 'en_retard' | 'annulee'
export type CommandeStatut = 'en_attente' | 'paye' | 'rembourse' | 'annule'

export interface Client {
  id: string
  nom: string
  email: string
  telephone?: string
  entreprise?: string
  secteur?: string
  statut: ClientStatut
  notes?: string
  stripe_customer_id?: string
  created_at: string
  updated_at: string
}

export interface Devis {
  id: string
  nom: string
  email: string
  telephone?: string
  service?: string
  budget?: string
  message?: string
  statut: DevisStatut
  lu: boolean
  created_at: string
  updated_at: string
}

export interface FactureLigne {
  description: string
  quantite: number
  prix_unitaire: number
}

export interface Facture {
  id: string
  numero: string
  client_nom: string
  client_email?: string
  client_adresse?: string
  client_siret?: string
  date_emission: string
  date_echeance?: string
  lignes: FactureLigne[]
  remise: number
  tva_taux: number
  montant_ht: number
  montant_tva: number
  montant_ttc: number
  statut: FactureStatut
  notes?: string
  stripe_payment_link?: string
  created_at: string
  updated_at: string
}

export interface Commande {
  id: string
  client_nom?: string
  client_email?: string
  service?: string
  montant: number
  statut: CommandeStatut
  stripe_session_id?: string
  stripe_payment_intent?: string
  created_at: string
  updated_at: string
}

export interface Article {
  id: string
  titre: string
  slug: string
  extrait?: string
  contenu?: string
  categorie?: string
  tags?: string
  date_pub?: string
  publie: boolean
  image_url?: string
  meta_title?: string
  meta_desc?: string
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  nom: string
  description?: string
  prix: number
  prix_mensuel?: number
  stripe_link?: string
  stripe_price_id?: string
  categorie?: string
  actif: boolean
  image_url?: string
  ordre: number
  created_at: string
  updated_at: string
}

export interface RealisationSolution { title: string; desc: string }
export interface RealisationResult { value: string; label: string }
export interface RealisationGalleryItem { src: string; caption: string; mobile?: boolean; rationale?: string; before?: string }
export interface RealisationServiceLink { label: string; href: string }

export interface Realisation {
  id: string
  slug: string
  name: string
  type?: string
  year?: string
  tags: string[]
  hero_image?: string
  live_url?: string
  intro?: string
  context_client?: string
  context_problem?: string
  solution: RealisationSolution[]
  results: RealisationResult[]
  gallery: RealisationGalleryItem[]
  stack: string[]
  services: RealisationServiceLink[]
  publie: boolean
  ordre: number
  created_at: string
  updated_at: string
}

export interface Temoignage {
  id: string
  nom: string
  entreprise?: string
  texte: string
  note: number
  actif: boolean
  created_at: string
}

export interface Newsletter {
  id: string
  email: string
  actif: boolean
  date_inscription: string
}
