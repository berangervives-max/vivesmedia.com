# Benchmark UX & tunnel de conversion — vivesmedia.com vs meilleurs sites

> 28/06/2026. Objectif : peaufiner le funnel **module par module, sans toucher à la DA**. Analyse des sites qui font la MÊME chose que vivesmedia (agences/freelances qui créent des sites pour PME, orientés conversion) + portfolios primés Awwwards pour l'angle expérience utilisateur.

## Méthode
- Sources de référence : [Awwwards — Best Portfolio Websites](https://www.awwwards.com/websites/portfolio/) (9 400+ portfolios primés, SOTD Pacôme Pertant 09/06, Bruno Simon SOTM), liste [Top French freelancers & studios Awwwards](https://www.awwwards.com/best-web-designers-developers-and-creative-talent-of-france-top-french-freelancers-and-studios-on-awwwards.html), comparatifs [MSD Media top agences landing 2026](https://msd-media.com/blog/articles/top-5-agences-landing-page-france-2026/), [Sortlist France](https://www.sortlist.com/i/s/landing-page-design/france-fr).
- Concurrents directs analysés en profondeur (même offre, même promesse) : **Palm Square** (palmsquare.fr), **Rainboow** (rainboow.fr). Écartés car offre différente (SaaS pur, SEO-farm, pure créa sans conversion).

## Ce qui ressort des concurrents directs (Palm Square & Rainboow)

| Levier | Palm Square | Rainboow | vivesmedia (avant) |
|---|---|---|---|
| Promesse hero | « Des sites qui marquent et qui vendent » | « un site Webflow qui parle à vos clients » | « Des sites qui convertissent vos visiteurs en clients » ✅ équivalent |
| **CTA primaire** | **Prendre un rendez-vous** | **Prendre rendez-vous** | Lancer mon projet → formulaire |
| CTA hero secondaire | « Échanger avec Keziah » (visage fondateur, RDV 30 min) | Double CTA RDV + Nos réalisations | ❌ aucun (CTA unique) |
| Preuve d'autorité | +50 entreprises, retours illimités, 100% sur mesure | **Note tierce Sortlist 4.92★**, badge « Certified Client-First » | avatars + 5,0/5 +25 avis (liés Google ✅) |
| **Résultat client chiffré** | — | **« +150% de conversions pour Favikon »** en badge | ❌ pas dans le hero |
| Présence humaine | visage du fondateur dans le hero | — | ❌ pas de visage |
| Contact persistant | — | **bouton téléphone flottant** site-wide | StickyMobileCta (mobile) |
| Scarcité | — | — | « 1–2 projets/mois, places limitées » ✅ (bloc CTA final) |

## Diagnostic vivesmedia
Le site est **déjà au niveau** des meilleurs concurrents directs sur la DA, la promesse, la preuve sociale (avis Google liés) et la scarcité. **3 écarts** expliquent une partie du « 0 devis envoyé » du funnel :

1. **Parcours à friction unique.** Le seul chemin de conversion était le formulaire de devis. Les 2 concurrents directs mènent d'abord vers un **appel de 30 min sans engagement** (friction très basse). Or ton Calendly est déjà live et bien rédigé (« Je suis Béranger… appel 30 min gratuit »). → **CORRIGÉ** : CTA « Réserver un appel » ajouté dans le hero (secondaire) + bloc CTA final.
2. **Pas de résultat client chiffré** visible tôt. Rainboow capitalise sur « +150% ». Tes réalisations CONTIENNENT déjà des résultats (context.results). → **À surfacer** (voir reco 2).
3. **Pas de visage / présence humaine** dans le hero. Palm Square humanise (« Échanger avec Keziah » + photo). Toi tu es ton meilleur argument (Béranger, basé Avignon, full remote). → **À tester** (voir reco 3).

## Corrigé tout de suite (additif, DA inchangée)
- ✅ **Hero** : 2ᵉ CTA « Réserver un appel » (outline, icône agenda orange) → Calendly. Ligne de réassurance → « Devis gratuit **ou appel de 30 min** · réponse sous 24 h · sans engagement ».
- ✅ **Bloc CTA final** : 2ᵉ bouton « Réserver un appel de 30 min » → Calendly (remplace « Voir nos réalisations », déjà accessible via la nav).
- ✅ Event PostHog `cta_clicked` posé sur ces RDV → on mesurera lequel des 2 parcours (devis vs appel) convertit.

## Recommandations à valider (bloc par bloc, je ne touche pas sans ton OK)
1. **Nav** : ajouter un lien discret « Réserver un appel » à côté de « Devis Gratuit » (ou transformer le bouton nav en « Parler à Béranger »). Les 2 concurrents mettent le RDV en CTA nav principal.
2. **Hero — badge résultat** : afficher un vrai chiffre issu d'une réalisation (ex. « +X% de demandes pour [client] ») en pilule au-dessus/sous le titre. **Besoin de ta validation du chiffre exact** (ne rien inventer).
3. **Hero — présence humaine** : tester ta photo (ou un mini « Échanger avec Béranger » avec avatar) — humanise et rassure sur le « full remote solo ».
4. **Bouton flottant desktop** : un bouton « Réserver un appel » / WhatsApp persistant en bas à droite (comme Rainboow), discret, couleur orange.
5. **Section preuve** : afficher la note Google comme badge tiers explicite (logo Google + 5,0/5) plutôt que de simples étoiles, pour la crédibilité « source externe ».

## Inspiration UX/expérience (portfolios primés Awwwards)
Tendances observées (pour micro-peaufinage, pas refonte) : transitions de page fluides, scroll-reveal au « poids » marqué, curseur custom discret, gros titres éditoriaux (✅ tu as déjà l'italique serif), imagerie/vidéo immersive en hero. À puiser au compte-gouttes via les agents `motion-ui` et `directeur-image` si on veut renforcer le « premium ».
