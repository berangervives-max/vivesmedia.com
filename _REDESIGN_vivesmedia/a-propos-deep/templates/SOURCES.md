# Sourcing templates — Section Formation / Diplômes / Certifications (/a-propos vivesmedia.com)
> Sourcé le 01/08/2026 par template-cloner. Règle : on reprend la STRUCTURE, jamais les couleurs.
> DA imposée : fond #F9F9F9, texte #121212, accent #F4521E, Inter Tight + Instrument Serif italique, cartes rounded-2xl bordées 1px.

## Aperçu global
`_preview-gallery.html` + `_preview-gallery-fullpage.png` = rendu réel de toutes les sections HTML clonées (vérifié navigateur).

## 01 — HyperUI Logo Clouds (GRATUIT, MIT)
Source : https://www.hyperui.dev + https://github.com/markmead/hyperui (public/examples/marketing/logo-clouds)
4 variantes HTML/Tailwind autonomes. La n°3 (titre à gauche + cellules logos sur fond gris clair) est la plus proche du style cartes vivesmedia.
À reprendre : grille de logos d'organismes en cellules, grayscale + hover couleur (logo-cloud-1).

## 02 — HyperUI Stats (GRATUIT, MIT)
Source : https://github.com/markmead/hyperui (public/examples/application/stats)
Cartes KPI avec libellé + valeur + badge delta. Base parfaite pour « X années d'études / Y certifications / Z projets ».

## 03 — HyperUI Timelines (GRATUIT, MIT)
Source : https://github.com/markmead/hyperui (public/examples/application/timelines)
Timeline verticale (1) et alternée (2) : date + titre + description = année + diplôme + organisme.

## 04 — Cruip « Simple Light » (GRATUIT, GPL — réf. structurelle, restyler à fond)
Source : https://cruip.com/ + https://github.com/cruip/tailwind-landing-page-template
- `business-categories.tsx` : sélecteur à onglets + logos réels en cartes (pattern trust élégant)
- `features-planet.tsx` : section sombre avec stats intégrées
- `large-testimonial.tsx` : citation unique centrée (peut porter une phrase de légitimité)
⚠️ GPL : ne pas copier-coller tel quel dans un livrable client ; s'en servir d'ossature et réécrire.

## 05 — Aceternity UI « Infinite Moving Cards » (GRATUIT, MIT)
Source : https://ui.aceternity.com/components/infinite-moving-cards (registry JSON officiel)
Marquee infini de cartes rounded-2xl bordées — détourner les cartes témoignage en cartes CERTIFICATION (logo organisme + intitulé + année). Le masque dégradé latéral est premium.

## 06 — Flowbite « Customer Logos » (bloc par défaut GRATUIT, licence Flowbite ; blocs pro = screenshots)
Source : https://flowbite.com/blocks/marketing/customer-logos/
- `logo-grid-free.html` : code exact extrait du DOM (titre + grille logos réels Airbnb/Google/Microsoft… + CTA)
- Screenshots pro : « logo cards with description » (logo + texte + lien = pattern carte diplôme idéal) et « logo grid 4 columns ».

## 07 — Tailwind Plus Logo Clouds (2 composants GRATUITS avec code ; le reste screenshots)
Source : https://tailwindcss.com/plus/ui-blocks/marketing/sections/logo-clouds
- `simple-with-heading.html` : « Trusted by… » + logos, qualité Tailwind Labs, markup minimal impeccable
- Screenshots payants : « Simple with CTA », « Split with logos on right » (texte à gauche + grille logos à droite = candidat n°1 pour la section diplômes).

## 08 — Tailwind Plus Stats (2 composants GRATUITS ; Timeline en screenshot)
Source : https://tailwindcss.com/plus/ui-blocks/marketing/sections/stats-sections
- `stats-free-1/2.html` : stats simples 3 colonnes
- `screenshot-timeline.png` : variante TIMELINE (année en accent + jalon + description) = LE pattern parcours/diplômes haut de gamme.

## 09 — Tailark Logo Cloud / marquee (GRATUIT, MIT — les blocs « Méschac Irung » de 21st.dev)
Source : https://tailark.com + https://github.com/tailark/blocks (le registry 21st.dev est verrouillé, la source GitHub est ouverte)
6 blocs React/Tailwind (dusk one→four, mist one/two) + `infinite-slider.tsx` (dépendance marquee).
`dusk-logo-cloud-one` : « Trusted by » en colonne gauche + slider de logos = très éditorial, fit vivesmedia.

## 10 — Webflow BRIX « Consultant » (PAYANT 79$, screenshots uniquement)
Source : https://consultanttemplate.webflow.io/about (template : https://webflow.com/templates/html/consultant-consulting-website-template)
Page About fondateur : hero bio + « Great businesses that trust my work » (eyebrow + titre + grille logos + CTA).
Verdict honnête : structure correcte mais design générique/sombre — référence marginale, à ne pas suivre esthétiquement.

## Non retenu
HTML5UP : parcouru le catalogue par le passé — aucun pattern credentials/logo strip exploitable (templates portfolio image-first). Écarté honnêtement plutôt que forcé.

## Reco de combinaison (à valider par Béranger AVANT clonage final)
STRUCTURE = Tailwind Plus « Split with logos on right » (bloc diplômes : texte gauche + grille logos organismes droite)
+ Timeline stats Tailwind Plus / HyperUI timeline-2 (parcours chronologique : année accent orange, diplôme en Instrument Serif italique)
+ bande logos organismes façon HyperUI logo-cloud-1 (grayscale → couleur au hover)
+ 3 stat cards HyperUI stats (années d'expérience / certifications / projets livrés)
HABILLAGE = 100% DA vivesmedia : #F9F9F9 / #121212 / #F4521E, Inter Tight, Instrument Serif italique sur les mots accentués, cartes rounded-2xl border 1px. Vrais logos d'écoles/organismes à récupérer officiellement (jamais redessinés — cf. feedback_real_logos).
