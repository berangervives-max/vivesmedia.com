import { jsPDF } from 'jspdf'
import type { Facture } from '@/types'

const ORANGE = '#F4521E'
const DARK = '#111827'
const GRAY = '#6B7280'
const LIGHT = '#9CA3AF'

type EntrepriseInfos = {
  entreprise: string
  siret: string
  adresse: string
  tva: string
  emailContact: string
  telephone: string
  mentionsFacture: string
}

const DEFAULT_INFOS: EntrepriseInfos = {
  entreprise: 'vivesmedia.com — Béranger Vives',
  siret: '',
  adresse: 'Avignon, France',
  tva: 'TVA non applicable, art. 293 B du CGI',
  emailContact: 'contact@vivesmedia.com',
  telephone: '',
  mentionsFacture: 'Paiement à réception. Pénalités de retard : 3× le taux d\'intérêt légal. Indemnité forfaitaire de recouvrement : 40€.',
}

function loadInfos(): EntrepriseInfos {
  try {
    const raw = localStorage.getItem('vivesmedia-cms-settings')
    if (raw) return { ...DEFAULT_INFOS, ...JSON.parse(raw) }
  } catch { /* défauts */ }
  return DEFAULT_INFOS
}

const eur = (n: number) => `${n.toFixed(2).replace('.', ',')} €`

export function genererFacturePdf(f: Facture) {
  const infos = loadInfos()
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  const M = 18
  let y = 22

  // ── En-tête bande orange ──
  doc.setFillColor(ORANGE)
  doc.rect(0, 0, W, 4, 'F')

  // Logo texte
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(DARK)
  doc.text('vivesmedia', M, y)
  const wLogo = doc.getTextWidth('vivesmedia')
  doc.setTextColor(ORANGE)
  doc.text('.com', M + wLogo, y)

  // Bloc FACTURE à droite
  doc.setFontSize(22)
  doc.setTextColor(DARK)
  doc.text('FACTURE', W - M, y, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(GRAY)
  doc.text(`N° ${f.numero}`, W - M, y + 6, { align: 'right' })

  y += 16

  // ── Émetteur / Client ──
  doc.setFontSize(8)
  doc.setTextColor(LIGHT)
  doc.text('ÉMETTEUR', M, y)
  doc.text('FACTURÉ À', W / 2 + 6, y)
  y += 5

  doc.setFontSize(10)
  doc.setTextColor(DARK)
  doc.setFont('helvetica', 'bold')
  doc.text(infos.entreprise, M, y)
  doc.text(f.client_nom, W / 2 + 6, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(GRAY)

  let yL = y + 5
  for (const line of [infos.adresse, infos.siret ? `SIRET : ${infos.siret}` : '', infos.emailContact, infos.telephone].filter(Boolean)) {
    doc.text(line, M, yL); yL += 4.5
  }
  let yR = y + 5
  for (const line of [f.client_adresse, f.client_siret ? `SIRET : ${f.client_siret}` : '', f.client_email].filter((x): x is string => Boolean(x))) {
    doc.text(line, W / 2 + 6, yR); yR += 4.5
  }
  y = Math.max(yL, yR) + 6

  // ── Dates ──
  doc.setFontSize(9)
  doc.setTextColor(GRAY)
  const dateEm = new Date(f.date_emission).toLocaleDateString('fr-FR')
  doc.text(`Date d'émission : ${dateEm}`, M, y)
  if (f.date_echeance) {
    doc.text(`Échéance : ${new Date(f.date_echeance).toLocaleDateString('fr-FR')}`, W / 2 + 6, y)
  }
  y += 10

  // ── Tableau lignes ──
  const col = { desc: M, qte: 128, pu: 150, total: W - M }
  doc.setFillColor('#F8F9FA')
  doc.rect(M - 3, y - 5, W - 2 * M + 6, 8, 'F')
  doc.setFontSize(8)
  doc.setTextColor(LIGHT)
  doc.setFont('helvetica', 'bold')
  doc.text('DESCRIPTION', col.desc, y)
  doc.text('QTÉ', col.qte, y, { align: 'right' })
  doc.text('PRIX UNIT.', col.pu + 14, y, { align: 'right' })
  doc.text('TOTAL HT', col.total, y, { align: 'right' })
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  for (const l of f.lignes) {
    const lines = doc.splitTextToSize(l.description, 100)
    doc.setTextColor(DARK)
    doc.text(lines, col.desc, y)
    doc.setTextColor(GRAY)
    doc.text(String(l.quantite), col.qte, y, { align: 'right' })
    doc.text(eur(l.prix_unitaire), col.pu + 14, y, { align: 'right' })
    doc.setTextColor(DARK)
    doc.text(eur(l.quantite * l.prix_unitaire), col.total, y, { align: 'right' })
    y += lines.length * 4.5 + 3
    doc.setDrawColor('#F1F3F5')
    doc.line(M - 3, y - 2, W - M + 3, y - 2)
    y += 2
  }

  y += 4

  // ── Totaux ──
  const xLabel = 130
  doc.setFontSize(9.5)
  doc.setTextColor(GRAY)
  doc.text('Total HT', xLabel, y)
  doc.setTextColor(DARK)
  doc.text(eur(f.montant_ht), col.total, y, { align: 'right' })
  y += 5.5

  if (f.remise > 0) {
    doc.setTextColor(GRAY)
    doc.text(`Remise (${f.remise}%)`, xLabel, y)
    doc.setTextColor(DARK)
    doc.text(`- ${eur(f.montant_ht * (f.remise / 100))}`, col.total, y, { align: 'right' })
    y += 5.5
  }

  doc.setTextColor(GRAY)
  doc.text(`TVA (${f.tva_taux}%)`, xLabel, y)
  doc.setTextColor(DARK)
  doc.text(eur(f.montant_tva), col.total, y, { align: 'right' })
  y += 7

  doc.setFillColor(ORANGE)
  doc.roundedRect(xLabel - 4, y - 5, W - M - xLabel + 4, 9, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor('#FFFFFF')
  doc.text('TOTAL TTC', xLabel, y + 1)
  doc.text(eur(f.montant_ttc), col.total - 1, y + 1, { align: 'right' })
  y += 14

  // ── Lien de paiement ──
  if (f.stripe_payment_link) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(ORANGE)
    doc.textWithLink('▸ Payer en ligne par carte bancaire (lien sécurisé Stripe)', M, y, { url: f.stripe_payment_link })
    y += 8
  }

  // ── Notes ──
  if (f.notes) {
    doc.setFontSize(8.5)
    doc.setTextColor(GRAY)
    doc.text(doc.splitTextToSize(`Note : ${f.notes}`, W - 2 * M), M, y)
    y += 10
  }

  // ── Pied de page ──
  doc.setFontSize(7.5)
  doc.setTextColor(LIGHT)
  const footer = [infos.tva, infos.mentionsFacture]
  doc.text(doc.splitTextToSize(footer.join(' — '), W - 2 * M), M, 280)
  doc.setDrawColor(ORANGE)
  doc.setLineWidth(0.8)
  doc.line(M, 274, W - M, 274)

  doc.save(`facture-${f.numero}.pdf`)
}
