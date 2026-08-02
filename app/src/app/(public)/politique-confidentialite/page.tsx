import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de confidentialité & cookies',
  description: 'Comment vivesmedia.com collecte, utilise et protège vos données personnelles, et comment gérer votre consentement aux cookies. Conforme RGPD.',
  alternates: { canonical: 'https://vivesmedia.com/politique-confidentialite' },
}

const MAJ = '26 juillet 2026'

export default function PolitiqueConfidentialite() {
  return (
    <div className="min-h-screen bg-background pt-28 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#FF6B00' }}>Confidentialité</p>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
          Politique de confidentialité <span className="italic font-normal">&amp; cookies</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Dernière mise à jour : {MAJ}</p>

        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-muted-foreground [&_h2]:text-foreground [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:mt-2 [&_h2]:mb-2 [&_strong]:text-foreground [&_a]:text-[#FF6B00] [&_a]:underline [&_a]:underline-offset-2">

          <section>
            <h2>1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données est <strong>Béranger Vives</strong> (vivesmedia.com), micro-entreprise
              établie à Avignon, France. Contact : <a href="mailto:contact@vivesmedia.com">contact@vivesmedia.com</a>.
              Pour l'identité complète et l'hébergeur, voir les <Link href="/mentions-legales">mentions légales</Link>.
            </p>
          </section>

          <section>
            <h2>2. Quelles données, pour quelles finalités</h2>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Mesure d'audience</strong> (pages vues, parcours, source de visite) — pour comprendre et améliorer le site. <em>Base légale : votre consentement.</em></li>
              <li><strong>Formulaires</strong> (devis, contact, rappel) : nom, e-mail, téléphone, message — pour répondre à votre demande. <em>Base légale : mesures précontractuelles / votre demande.</em></li>
              <li><strong>Newsletter</strong> : e-mail — pour vous envoyer nos actualités. <em>Base légale : votre consentement (désinscription à tout moment).</em></li>
              <li><strong>Paiement</strong> : traité directement par Stripe ; nous ne stockons aucune donnée bancaire.</li>
            </ul>
          </section>

          <section>
            <h2>3. Cookies et traceurs</h2>
            <p>
              <strong>Aucun cookie ou traceur de mesure n'est déposé sans votre consentement.</strong> À votre première visite,
              un bandeau vous permet d'accepter ou de refuser. Tant que vous n'avez pas accepté, les outils de mesure fonctionnent
              en mode « sans cookie » (Google Consent Mode), et PostHog reste désactivé. Seuls les cookies strictement nécessaires
              au fonctionnement du site sont utilisés.
            </p>
          </section>

          <section>
            <h2>4. Sous-traitants et destinataires</h2>
            <p>Nous faisons appel aux prestataires suivants, qui agissent comme sous-traitants :</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead className="bg-secondary text-foreground text-left">
                  <tr><th className="p-2 font-semibold">Outil</th><th className="p-2 font-semibold">Rôle</th><th className="p-2 font-semibold">Localisation</th></tr>
                </thead>
                <tbody className="[&_td]:p-2 [&_td]:border-t [&_td]:border-border">
                  <tr><td>Google Analytics 4</td><td>Mesure d'audience</td><td>USA (voir §5)</td></tr>
                  <tr><td>PostHog</td><td>Analytics produit</td><td>Union européenne</td></tr>
                  <tr><td>Brevo</td><td>Suivi &amp; e-mailing</td><td>Union européenne</td></tr>
                  <tr><td>Ahrefs Analytics</td><td>Mesure d'audience (sans cookie)</td><td>USA</td></tr>
                  <tr><td>Vercel</td><td>Hébergement du site</td><td>USA / UE</td></tr>
                  <tr><td>Supabase</td><td>Base de données</td><td>Union européenne</td></tr>
                  <tr><td>Resend</td><td>E-mails transactionnels</td><td>USA</td></tr>
                  <tr><td>Stripe</td><td>Paiement</td><td>USA / UE</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>5. Transferts hors Union européenne</h2>
            <p>
              Google Analytics implique un transfert de données vers Google LLC aux États-Unis. Ce transfert est encadré par la
              <strong> décision d'adéquation « EU-US Data Privacy Framework »</strong> (2023), Google étant certifié au titre de ce cadre.
              Les autres transferts éventuels (Resend, Stripe) reposent sur les clauses contractuelles types de la Commission européenne.
            </p>
          </section>

          <section>
            <h2>6. Durées de conservation</h2>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Mesure d'audience (GA4) : <strong>14 mois maximum</strong>.</li>
              <li>Demandes de devis / contacts : le temps nécessaire au traitement, puis jusqu'à 3 ans à des fins de suivi commercial.</li>
              <li>Newsletter : jusqu'à votre désinscription.</li>
            </ul>
          </section>

          <section>
            <h2>7. Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition
              et de portabilité, ainsi que du droit de <strong>retirer votre consentement</strong> à tout moment. Pour l'exercer,
              écrivez à <a href="mailto:contact@vivesmedia.com">contact@vivesmedia.com</a>. Vous pouvez également introduire une
              réclamation auprès de la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL</a>.
            </p>
          </section>

          <section>
            <h2>8. Gérer ou retirer votre consentement</h2>
            <p>
              Vous pouvez modifier votre choix à tout moment en supprimant les cookies de votre navigateur pour ce site : le bandeau
              de consentement réapparaîtra à votre prochaine visite. Le refus n'a aucune conséquence sur votre navigation.
            </p>
          </section>

        </div>

        <div className="mt-12">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-full" style={{ backgroundColor: 'var(--brand-cta)' }}>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
