'use client'
/* Générateur de facture PREMIUM (100% gratuit, auto-hébergé).
   Moteur : @react-pdf/renderer. Police de marque : Instrument Serif (self-host /public/fonts).
   Corps : Helvetica intégré (net, lisible, rendu identique partout).
   Style : propre, carré, DA vivesmedia. Mentions légales micro-entreprise incluses. */
import { Document, Page, View, Text, Link, StyleSheet, Font, pdf } from '@react-pdf/renderer'
import type { Facture } from '@/types'

Font.register({
  family: 'InstrumentSerif',
  fonts: [
    { src: '/fonts/InstrumentSerif-Regular.ttf' },
    { src: '/fonts/InstrumentSerif-Italic.ttf', fontStyle: 'italic' },
  ],
})
// Pas de césure automatique (évite les coupures de mots disgracieuses)
Font.registerHyphenationCallback(w => [w])

const C = {
  ink: '#17130F', ink2: '#57514B', muted: '#8B837B', faint: '#B4ADA5',
  border: '#E6E1DA', surface: '#F6F4F1', brand: '#F4521E', white: '#FFFFFF',
}

type EntrepriseInfos = {
  entreprise: string; siret: string; adresse: string; tva: string
  emailContact: string; telephone: string; mentionsFacture: string
}
const DEFAULT_INFOS: EntrepriseInfos = {
  entreprise: 'Béranger Vives, VIVES & Co (vivesmedia.com)',
  siret: '935 306 522 R.C.S. Avignon',
  adresse: 'Avignon, France',
  tva: 'TVA non applicable, art. 293 B du CGI',
  emailContact: 'contact@vivesmedia.com',
  telephone: '',
  mentionsFacture: 'Paiement à réception. Pénalités de retard : 3 fois le taux d\'intérêt légal. Indemnité forfaitaire de recouvrement : 40 €.',
}
function loadInfos(): EntrepriseInfos {
  try { const raw = localStorage.getItem('vivesmedia-cms-settings'); if (raw) return { ...DEFAULT_INFOS, ...JSON.parse(raw) } } catch { /* défauts */ }
  return DEFAULT_INFOS
}

const eur = (n: number) => `${(n || 0).toFixed(2).replace('.', ',')} €`
const dfr = (d: string) => new Date(d).toLocaleDateString('fr-FR')

const s = StyleSheet.create({
  page: { paddingTop: 0, paddingBottom: 54, paddingHorizontal: 44, fontFamily: 'Helvetica', fontSize: 9.5, color: C.ink2, lineHeight: 1.5 },
  bar: { position: 'absolute', top: 0, left: 0, right: 0, height: 5, backgroundColor: C.brand },

  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 40 },
  wordmark: { fontFamily: 'Helvetica-Bold', fontSize: 17, color: C.ink },
  wordmarkDot: { fontFamily: 'InstrumentSerif', fontStyle: 'italic', fontSize: 17, color: C.brand },
  tag: { marginTop: 6, fontSize: 7.5, letterSpacing: 1.4, color: C.muted, textTransform: 'uppercase' },
  factTitle: { fontFamily: 'InstrumentSerif', fontSize: 34, color: C.ink, textAlign: 'right', lineHeight: 1 },
  factNum: { textAlign: 'right', fontSize: 9.5, color: C.muted, marginTop: 4 },

  parties: { flexDirection: 'row', marginTop: 30, gap: 28 },
  party: { flex: 1 },
  eyebrow: { fontSize: 7.5, letterSpacing: 1.2, color: C.faint, textTransform: 'uppercase', marginBottom: 5 },
  partyName: { fontFamily: 'Helvetica-Bold', fontSize: 10.5, color: C.ink, marginBottom: 3 },
  partyLine: { fontSize: 9, color: C.ink2 },

  dates: { flexDirection: 'row', marginTop: 20, gap: 28 },
  dateCell: { flex: 1, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 7 },
  dateLabel: { fontSize: 7.5, letterSpacing: 0.8, color: C.faint, textTransform: 'uppercase' },
  dateVal: { fontSize: 10, color: C.ink, fontFamily: 'Helvetica-Bold', marginTop: 2 },

  thead: { flexDirection: 'row', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, paddingVertical: 6, paddingHorizontal: 9, marginTop: 26 },
  th: { fontSize: 7.5, letterSpacing: 0.8, color: C.muted, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
  row: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 9, borderBottomWidth: 1, borderBottomColor: C.border, borderLeftWidth: 1, borderRightWidth: 1, borderLeftColor: C.border, borderRightColor: C.border },
  cDesc: { flex: 1, paddingRight: 10 },
  cQte: { width: 42, textAlign: 'right' },
  cPu: { width: 78, textAlign: 'right' },
  cTot: { width: 82, textAlign: 'right' },
  descTxt: { color: C.ink, fontFamily: 'Helvetica-Bold', fontSize: 9.5 },
  cellMuted: { color: C.ink2, fontSize: 9.5 },
  cellInk: { color: C.ink, fontSize: 9.5, fontFamily: 'Helvetica-Bold' },

  totals: { marginTop: 16, flexDirection: 'row', justifyContent: 'flex-end' },
  totBox: { width: 250 },
  totRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  totLabel: { fontSize: 9.5, color: C.muted },
  totVal: { fontSize: 9.5, color: C.ink },
  grand: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.brand, paddingVertical: 9, paddingHorizontal: 12, marginTop: 8 },
  grandLabel: { fontSize: 10, color: C.white, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 },
  grandVal: { fontSize: 13, color: C.white, fontFamily: 'Helvetica-Bold' },

  pay: { marginTop: 22, borderWidth: 1, borderColor: C.brand, paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start' },
  payTxt: { fontSize: 9.5, color: C.brand, fontFamily: 'Helvetica-Bold', textDecoration: 'none' },
  notes: { marginTop: 18, fontSize: 8.5, color: C.muted },

  footer: { position: 'absolute', bottom: 30, left: 44, right: 44 },
  footRule: { height: 1.4, backgroundColor: C.brand, marginBottom: 7, width: 46 },
  footTxt: { fontSize: 7.5, color: C.faint, lineHeight: 1.5 },
})

function FactureDoc({ f, infos }: { f: Facture; infos: EntrepriseInfos }) {
  const remiseMontant = f.remise > 0 ? f.montant_ht * (f.remise / 100) : 0
  const emetteurLignes = [infos.adresse, infos.siret ? `SIRET : ${infos.siret}` : '', infos.emailContact, infos.telephone].filter(Boolean)
  const clientLignes = [f.client_adresse, f.client_siret ? `SIRET : ${f.client_siret}` : '', f.client_email].filter((x): x is string => Boolean(x))
  return (
    <Document title={`Facture ${f.numero}`} author="vivesmedia.com">
      <Page size="A4" style={s.page}>
        <View style={s.bar} fixed />

        <View style={s.head}>
          <View>
            <Text><Text style={s.wordmark}>vivesmedia</Text><Text style={s.wordmarkDot}>.com</Text></Text>
            <Text style={s.tag}>Création de sites web</Text>
          </View>
          <View>
            <Text style={s.factTitle}>Facture</Text>
            <Text style={s.factNum}>N° {f.numero}</Text>
          </View>
        </View>

        <View style={s.parties}>
          <View style={s.party}>
            <Text style={s.eyebrow}>Émetteur</Text>
            <Text style={s.partyName}>{infos.entreprise}</Text>
            {emetteurLignes.map((l, i) => <Text key={i} style={s.partyLine}>{l}</Text>)}
          </View>
          <View style={s.party}>
            <Text style={s.eyebrow}>Facturé à</Text>
            <Text style={s.partyName}>{f.client_nom}</Text>
            {clientLignes.map((l, i) => <Text key={i} style={s.partyLine}>{l}</Text>)}
          </View>
        </View>

        <View style={s.dates}>
          <View style={s.dateCell}>
            <Text style={s.dateLabel}>Date d'émission</Text>
            <Text style={s.dateVal}>{dfr(f.date_emission)}</Text>
          </View>
          <View style={s.dateCell}>
            <Text style={s.dateLabel}>Échéance</Text>
            <Text style={s.dateVal}>{f.date_echeance ? dfr(f.date_echeance) : 'À réception'}</Text>
          </View>
        </View>

        <View style={s.thead}>
          <Text style={[s.th, s.cDesc]}>Description</Text>
          <Text style={[s.th, s.cQte]}>Qté</Text>
          <Text style={[s.th, s.cPu]}>Prix unit.</Text>
          <Text style={[s.th, s.cTot]}>Total HT</Text>
        </View>
        {f.lignes.map((l, i) => (
          <View key={i} style={s.row} wrap={false}>
            <View style={s.cDesc}><Text style={s.descTxt}>{l.description}</Text></View>
            <Text style={[s.cQte, s.cellMuted]}>{l.quantite}</Text>
            <Text style={[s.cPu, s.cellMuted]}>{eur(l.prix_unitaire)}</Text>
            <Text style={[s.cTot, s.cellInk]}>{eur(l.quantite * l.prix_unitaire)}</Text>
          </View>
        ))}

        <View style={s.totals}>
          <View style={s.totBox}>
            <View style={s.totRow}><Text style={s.totLabel}>Total HT</Text><Text style={s.totVal}>{eur(f.montant_ht)}</Text></View>
            {f.remise > 0 && (
              <View style={s.totRow}><Text style={s.totLabel}>Remise ({f.remise} %)</Text><Text style={s.totVal}>- {eur(remiseMontant)}</Text></View>
            )}
            {f.tva_taux > 0 && (
              <View style={s.totRow}><Text style={s.totLabel}>TVA ({f.tva_taux} %)</Text><Text style={s.totVal}>{eur(f.montant_tva)}</Text></View>
            )}
            <View style={s.grand}>
              <Text style={s.grandLabel}>{f.tva_taux > 0 ? 'TOTAL TTC' : 'TOTAL'}</Text>
              <Text style={s.grandVal}>{eur(f.montant_ttc)}</Text>
            </View>
          </View>
        </View>

        {f.stripe_payment_link ? (
          <Link src={f.stripe_payment_link} style={s.pay}><Text style={s.payTxt}>Payer en ligne par carte (lien sécurisé Stripe)</Text></Link>
        ) : null}

        {f.notes ? <Text style={s.notes}>Note : {f.notes}</Text> : null}

        <View style={s.footer} fixed>
          <View style={s.footRule} />
          <Text style={s.footTxt}>{infos.entreprise} · {infos.tva}</Text>
          <Text style={s.footTxt}>{infos.mentionsFacture}</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function genererFacturePdfPro(f: Facture) {
  const infos = loadInfos()
  const blob = await pdf(<FactureDoc f={f} infos={infos} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `facture-${f.numero}.pdf`; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}
