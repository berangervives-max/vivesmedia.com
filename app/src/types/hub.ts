// Types + helpers de phases pour l'espace client rapatrié du Hub.
// Version minimale (uniquement ce dont les pages client ont besoin), pour éviter
// d'importer le gros type Database du hub qui générait ~160 erreurs `never`.

export type ProjectPhase = 'onboarding' | 'design' | 'dev' | 'recette' | 'livraison' | 'maintenance'
export type FileCategory = 'file' | 'maquette' | 'invoice'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high'

export const PHASE_LABELS: Record<ProjectPhase, string> = {
  onboarding: 'Onboarding',
  design: 'Design',
  dev: 'Développement',
  recette: 'Recette',
  livraison: 'Livraison',
  maintenance: 'Maintenance',
}

export const PHASE_ORDER: ProjectPhase[] = ['onboarding', 'design', 'dev', 'recette', 'livraison', 'maintenance']

export const PHASE_DESCRIPTIONS: Record<ProjectPhase, string> = {
  onboarding: 'Nous recueillons vos informations pour démarrer',
  design: "Création des maquettes et de l'identité visuelle",
  dev: 'Développement technique de votre site',
  recette: 'Tests et vérifications avant la mise en ligne',
  livraison: 'Votre site est en ligne, félicitations',
  maintenance: 'Suivi, mises à jour et support technique',
}

export const PHASE_TAGLINES: Record<ProjectPhase, string> = {
  onboarding: 'On fait connaissance.',
  design: 'On dessine votre univers.',
  dev: 'Votre site prend forme.',
  recette: 'On peaufine les derniers détails.',
  livraison: 'Votre site est en ligne.',
  maintenance: 'On veille sur votre site.',
}

export const PHASE_SHORT: Record<ProjectPhase, string> = {
  onboarding: 'Onboarding', design: 'Design', dev: 'Dév.', recette: 'Recette', livraison: 'Livraison', maintenance: 'Suivi',
}

export function phaseIndex(phase: ProjectPhase): number { return PHASE_ORDER.indexOf(phase) }
export function phaseProgress(phase: ProjectPhase): number { return Math.round(((phaseIndex(phase) + 1) / PHASE_ORDER.length) * 100) }
export function phaseLabel(phase: ProjectPhase): string { return PHASE_LABELS[phase] }
