import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente (CGV) — vivesmedia.com',
  description: 'Conditions Générales de Vente des prestations de création de sites web, SEO, automatisation et maintenance de vivesmedia.com.',
  alternates: { canonical: 'https://vivesmedia.com/cgv' },
  robots: { index: true, follow: true },
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-9">
      <h2 className="text-lg font-bold text-foreground mb-3">{n}. {title}</h2>
      <div className="text-muted-foreground text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  )
}

export default function CgvPage() {
  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#F4521E' }}>Cadre contractuel</p>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">Conditions Générales de Vente</h1>
        <p className="text-muted-foreground mb-10">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <Section n="1" title="Identification du prestataire">
          <p>Les présentes CGV régissent les prestations fournies par <strong>Béranger Vives</strong>, entrepreneur individuel (micro-entreprise) immatriculé sous le n°&nbsp;935&nbsp;306&nbsp;522 R.C.S. Avignon, enseigne «&nbsp;VIVES&nbsp;&amp;&nbsp;Co&nbsp;», exerçant sous la marque «&nbsp;vivesmedia.com&nbsp;», Avignon (84), France — ci-après «&nbsp;le Prestataire&nbsp;». Activité exercée 100&nbsp;% à distance ; adresse postale communiquée sur demande.</p>
        </Section>

        <Section n="2" title="Objet et champ d'application">
          <p>Les présentes CGV s'appliquent à l'ensemble des prestations proposées par le Prestataire : création et refonte de sites web, référencement (SEO), automatisation, création de contenu, formation et maintenance. Toute commande implique l'acceptation sans réserve des présentes CGV, qui prévalent sur tout autre document du Client.</p>
        </Section>

        <Section n="3" title="Devis et commande">
          <p>Chaque prestation fait l'objet d'un devis personnalisé, gratuit et sans engagement, valable 30 jours. La commande est ferme à la signature du devis (ou validation écrite équivalente) et au versement de l'acompte prévu.</p>
        </Section>

        <Section n="4" title="Prix et modalités de paiement">
          <p>Les prix sont indiqués en euros et s'entendent net de taxe : « TVA non applicable, art. 293 B du CGI » (franchise en base de TVA).</p>
          <p>Deux modes de facturation sont proposés :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Paiement unique</strong> : acompte à la commande, solde à la livraison.</li>
            <li><strong>Formule en abonnement</strong> : un acompte initial, puis une mensualité, avec une durée d'engagement minimale (par exemple : Site Vitrine 89&nbsp;€/mois avec acompte de 490&nbsp;€ et engagement 24 mois ; Site E-Commerce 149&nbsp;€/mois avec acompte de 790&nbsp;€ et engagement 24 mois). Les conditions exactes figurent au devis.</li>
          </ul>
          <p>Les paiements sont réalisés par virement ou par carte bancaire via la plateforme sécurisée <strong>Stripe</strong>. Tout retard de paiement entraîne des pénalités au taux légal en vigueur ainsi qu'une indemnité forfaitaire de recouvrement de 40&nbsp;€ (art. L441-10 du Code de commerce).</p>
        </Section>

        <Section n="5" title="Délais et obligations du Client">
          <p>Les délais sont communiqués à titre indicatif et courent à compter de la réception de l'acompte et de l'ensemble des éléments nécessaires (contenus, accès, visuels). Le Client s'engage à fournir ces éléments en temps utile et à désigner un interlocuteur unique. Tout retard imputable au Client suspend les délais.</p>
        </Section>

        <Section n="6" title="Livraison et validation">
          <p>La prestation est réputée acceptée à défaut de réclamation écrite du Client dans un délai de 7 jours après mise à disposition. La mise en ligne définitive intervient après règlement intégral des sommes dues.</p>
        </Section>

        <Section n="7" title="Droit de rétractation">
          <p>Conformément aux articles L221-18 et suivants du Code de la consommation, le Client consommateur dispose d'un délai de rétractation de 14 jours. Toutefois, lorsque la prestation a commencé avec l'accord exprès du Client avant la fin de ce délai, le droit de rétractation ne peut plus être exercé une fois la prestation pleinement exécutée. Le droit de rétractation ne s'applique pas aux contrats conclus entre professionnels.</p>
        </Section>

        <Section n="8" title="Propriété intellectuelle">
          <p>Les livrables ne deviennent la propriété du Client qu'après paiement intégral. Le Prestataire conserve la propriété des outils, méthodes et briques techniques réutilisables. Sauf opposition écrite, le Prestataire se réserve le droit de mentionner la réalisation dans son portfolio à des fins de référence.</p>
        </Section>

        <Section n="9" title="Maintenance et hébergement">
          <p>Sauf souscription d'un contrat de maintenance, le Prestataire n'est pas tenu d'assurer le suivi technique après livraison. Les frais d'hébergement, de nom de domaine et de services tiers restent à la charge du Client, sauf mention contraire au devis.</p>
        </Section>

        <Section n="10" title="Responsabilité">
          <p>Le Prestataire est tenu à une obligation de moyens. Sa responsabilité ne saurait être engagée pour les dommages indirects, ni au-delà du montant total de la prestation concernée. Le Prestataire ne peut être tenu responsable des interruptions ou défaillances des services tiers (hébergeur, plateformes, API).</p>
        </Section>

        <Section n="11" title="Données personnelles">
          <p>Le traitement des données personnelles est décrit dans les <a href="/mentions-legales" className="underline hover:text-foreground">mentions légales</a>, conformément au RGPD.</p>
        </Section>

        <Section n="12" title="Droit applicable et litiges">
          <p>Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. Conformément à l'article L.612-1 du Code de la consommation, le Client consommateur a le droit de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable du litige l'opposant au Prestataire. Le Client peut également recourir à la plateforme européenne de Règlement en Ligne des Litiges (RLL) : <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: '#F4521E' }}>https://ec.europa.eu/consumers/odr</a>. À défaut d'accord amiable, les tribunaux français sont seuls compétents.</p>
        </Section>

        <Section n="13" title="Contact">
          <p>Pour toute question relative aux présentes CGV : <a href="mailto:contact@vivesmedia.com" className="underline hover:text-foreground">contact@vivesmedia.com</a>.</p>
        </Section>
      </div>
    </div>
  )
}
