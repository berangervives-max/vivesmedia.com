import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales — vivesmedia.com',
  description: 'Mentions légales du site vivesmedia.com : éditeur, hébergeur, propriété intellectuelle et données personnelles.',
  alternates: { canonical: 'https://vivesmedia.com/mentions-legales' },
  robots: { index: true, follow: true },
}

const A_COMPLETER = '[À COMPLÉTER]'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-foreground mb-3">{title}</h2>
      <div className="text-muted-foreground text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  )
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#F4521E' }}>Informations légales</p>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">Mentions légales</h1>
        <p className="text-muted-foreground mb-12">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <Section title="1. Éditeur du site">
          <p>Le site <strong>vivesmedia.com</strong> est édité par :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Béranger Vives</strong>, entrepreneur individuel</li>
            <li>SIRET : {A_COMPLETER}</li>
            <li>TVA : non applicable, art. 293 B du CGI (franchise en base de TVA)</li>
            <li>Lieu d'exercice : Avignon (84), France — activité 100&nbsp;% à distance</li>
            <li>Contact : <a href="mailto:contact@vivesmedia.com" className="underline hover:text-foreground">contact@vivesmedia.com</a></li>
          </ul>
          <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>Adresse postale complète communiquée sur simple demande par email.</p>
        </Section>

        <Section title="2. Directeur de la publication">
          <p>Béranger Vives, en qualité d'éditeur du site.</p>
        </Section>

        <Section title="3. Hébergement">
          <p>Le site est hébergé par :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Vercel Inc.</strong> — 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis — <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">vercel.com</a></li>
            <li>Base de données et services backend : <strong>Supabase</strong> (Supabase Inc.) — <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">supabase.com</a> (hébergement des données en région UE).</li>
          </ul>
        </Section>

        <Section title="4. Propriété intellectuelle">
          <p>L'ensemble des contenus présents sur le site vivesmedia.com (textes, visuels, logos, code, charte graphique) est, sauf mention contraire, la propriété exclusive de Béranger Vives. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation écrite préalable est interdite et constitue une contrefaçon sanctionnée par le Code de la propriété intellectuelle.</p>
        </Section>

        <Section title="5. Données personnelles (RGPD)">
          <p>Les informations transmises via les formulaires (demande de devis, inscription à la newsletter) sont collectées par Béranger Vives à des fins de réponse aux demandes commerciales et d'envoi d'informations. Elles ne sont jamais cédées à des tiers à des fins commerciales.</p>
          <p>Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi « Informatique et Libertés », vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité et d'opposition sur vos données. Pour l'exercer : <a href="mailto:contact@vivesmedia.com" className="underline hover:text-foreground">contact@vivesmedia.com</a>.</p>
          <p>Les données de devis et clients sont conservées pendant la durée nécessaire à la relation commerciale, puis archivées conformément aux obligations légales.</p>
        </Section>

        <Section title="6. Cookies et mesure d'audience">
          <p>Le site utilise des outils de mesure d'audience et d'amélioration de l'expérience (Google Analytics, PostHog, Ahrefs Analytics). Ces outils peuvent déposer des cookies à des fins statistiques. Vous pouvez configurer votre navigateur pour les refuser.</p>
        </Section>

        <Section title="7. Liens d'affiliation">
          <p>Certains liens présents sur le site (notamment dans les articles de blog) peuvent être des liens d'affiliation : si vous effectuez un achat via l'un de ces liens, le Prestataire peut percevoir une commission, sans surcoût pour vous. Ces recommandations restent fondées sur une évaluation indépendante des outils et services concernés.</p>
        </Section>

        <Section title="8. Contact">
          <p>Pour toute question relative au site ou aux présentes mentions : <a href="mailto:contact@vivesmedia.com" className="underline hover:text-foreground">contact@vivesmedia.com</a>.</p>
        </Section>
      </div>
    </div>
  )
}
