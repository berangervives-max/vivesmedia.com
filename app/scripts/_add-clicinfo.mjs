// Ajoute Clic'Info (Stéphane Nogray) comme prospect dans le Hub (site_clients).
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

// charge .env.local
const env = {}
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
const URL_ = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const KEY_ = env.SUPABASE_SERVICE_ROLE_KEY
if (!URL_ || !KEY_) { console.error('Clés Supabase manquantes'); process.exit(1) }
const sb = createClient(URL_, KEY_)

const email = 'contact@clic-info.fr' // ⚠️ à vérifier — aucun email public trouvé

const notes = `PROSPECT — refonte site (démo déjà faite).
Dirigeant : Stéphane NOGRAY (associé-gérant). SARL CLIC'INFO — SIREN 798 499 513.
CA 2024 : ~658 727 € · 3 employés · 2 boutiques (Orange 84100 + Noeux-les-Mines 62290).
Réputation : 4,7/5 · 203 avis Google (Orange) ; 4,9/5 · 75 avis (Noeux).
Activité : vente & réparation informatique, téléphonie, montage PC gamer, consoles.

SITE ACTUEL (clicinfo.tech) : simple page "choisir un magasin", sans services ni produits, NON optimisé mobile.
SEO : autorité de domaine 15/100, aucune page de service indexée (quasi invisible sur Google).
Argument : ~74% des clients achètent sur mobile → site obsolète = perte de CA estimée 33 000 à 65 000 €/an (5 à 10% de clients).

DÉMO REFONTE (mobile-first, boutique, avis, paiement 3-4×, click & collect) :
👉 https://clic-info-demo.vercel.app

OFFRE (abonnement) : Site Catalogue 119€/mois (acompte 640€) — recommandé ; ou Site Vitrine 89€/mois (acompte 490€).
Mise en ligne < 1 semaine (base déjà construite).

CANAL D'ENVOI : pas d'email public. Tester contact@clic-info.fr, sinon DM Instagram/Facebook boutique Orange, ou appeler le 04 90 30 57 07 pour récupérer l'email de M. Nogray.

==== EMAIL PERSONNALISÉ ====
Objet : Stéphane, j'ai refait le site de Clic'Info — la démo est prête

Bonjour Stéphane,

Je suis Béranger, je crée des sites internet pour les commerces de la région (agence vivesmedia.com, à Avignon). Je ne vous écris pas au hasard : Clic'Info, 4,7/5 sur plus de 200 avis Google, c'est une réputation que peu d'enseignes atteignent. Le souci, c'est que votre site ne la reflète pas — et surtout, il vous fait perdre des clients sans que ça se voie.

J'ai regardé clicinfo.tech de près. Aujourd'hui, c'est une simple page "choisir un magasin" : pas de services, pas de produits, et surtout pas pensée pour le mobile. Or en 2026, près de 3 clients sur 4 (74 %) consultent et achètent depuis leur téléphone, et 8 sur 10 se renseignent en ligne avant de pousser la porte. Un site illisible sur mobile, c'est un client qui referme l'onglet et appelle l'enseigne d'à côté.

Concrètement, sur votre chiffre d'affaires (~659 000 € en 2024) : chaque tranche de 5 % de clients qui ne vous trouvent pas sur Google ou repartent d'un site daté, c'est ~33 000 € par an qui s'évaporent — ~65 000 €/an sur 10 %. Côté référencement, vous êtes quasi invisible (autorité de domaine 15/100, aucune page de service indexée).

Du coup, j'ai pris les devants : j'ai déjà refait votre site, à partir de votre contenu actuel, en mobile-first. À voir tout de suite 👉 https://clic-info-demo.vercel.app
Vos services, le montage PC gamer, une vraie boutique, vos avis Google mis en avant, le paiement en 3-4× et le click & collect : tout y est, et c'est impeccable sur téléphone.

Pour le mettre en ligne, je privilégie une formule par abonnement (pas de gros budget d'un coup) :
- Site Catalogue (recommandé pour votre gamme) : 119 €/mois, acompte 640 €.
- Site Vitrine (plus léger) : 89 €/mois, acompte 490 €.
Création, hébergement et mises à jour inclus. Et comme la base est déjà construite, votre site est prêt en moins d'une semaine.

Le plus simple : 10 minutes au téléphone pour vous montrer la démo. Quel créneau vous arrange cette semaine ?

Bravo encore pour le travail en boutique — donnons-lui le site qu'il mérite.

Béranger Vives
vivesmedia.com — création de sites internet · Avignon`

// évite les doublons
const { data: existing } = await sb.from('site_clients').select('id').ilike('entreprise', '%clic%info%')
if (existing && existing.length) {
  const { data, error } = await sb.from('site_clients').update({
    nom: 'Stéphane Nogray', email, telephone: '04 90 30 57 07',
    entreprise: 'SARL Clic\'Info', secteur: 'Informatique · Téléphonie · Gaming',
    statut: 'prospect', notes,
  }).eq('id', existing[0].id).select().single()
  if (error) { console.error('Échec update', error.message); process.exit(1) }
  console.log('✓ Prospect MIS À JOUR dans le Hub — id', data.id)
} else {
  const { data, error } = await sb.from('site_clients').insert({
    nom: 'Stéphane Nogray', email, telephone: '04 90 30 57 07',
    entreprise: 'SARL Clic\'Info', secteur: 'Informatique · Téléphonie · Gaming',
    statut: 'prospect', notes,
  }).select().single()
  if (error) { console.error('Échec insert', error.message); process.exit(1) }
  console.log('✓ Prospect AJOUTÉ au Hub — id', data.id)
}
