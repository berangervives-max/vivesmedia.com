-- VivesMedia — CORRECTIF SÉCURITÉ RLS (audit 13/06/2026)
-- Problème : les policies "authenticated" donnaient accès aux données du site
-- à TOUT utilisateur connecté — y compris les CLIENTS du Hub (magic link),
-- car le projet Supabase est partagé entre le site et le Hub.
-- Correctif : accès admin restreint à l'email admin vérifié dans le JWT.
-- (On utilise l'email et non user_metadata.role car user_metadata est
-- modifiable par l'utilisateur lui-même via auth.updateUser.)
-- À exécuter dans Supabase SQL Editor.

-- ── Supprimer les policies trop permissives ──
drop policy if exists "admin_all_site_clients"  on public.site_clients;
drop policy if exists "admin_all_devis"         on public.devis;
drop policy if exists "admin_all_factures"      on public.factures;
drop policy if exists "admin_all_commandes"     on public.commandes;
drop policy if exists "admin_all_newsletter"    on public.newsletter;
drop policy if exists "admin_all_articles"      on public.articles;
drop policy if exists "admin_all_site_services" on public.site_services;
drop policy if exists "admin_all_temoignages"   on public.temoignages;

-- ── Recréer avec restriction admin stricte ──
create policy "admin_all_site_clients"  on public.site_clients  for all
  using (auth.jwt() ->> 'email' = 'berangervives@gmail.com');
create policy "admin_all_devis"         on public.devis         for all
  using (auth.jwt() ->> 'email' = 'berangervives@gmail.com');
create policy "admin_all_factures"      on public.factures      for all
  using (auth.jwt() ->> 'email' = 'berangervives@gmail.com');
create policy "admin_all_commandes"     on public.commandes     for all
  using (auth.jwt() ->> 'email' = 'berangervives@gmail.com');
create policy "admin_all_newsletter"    on public.newsletter    for all
  using (auth.jwt() ->> 'email' = 'berangervives@gmail.com');
create policy "admin_all_articles"      on public.articles      for all
  using (auth.jwt() ->> 'email' = 'berangervives@gmail.com');
create policy "admin_all_site_services" on public.site_services for all
  using (auth.jwt() ->> 'email' = 'berangervives@gmail.com');
create policy "admin_all_temoignages"   on public.temoignages   for all
  using (auth.jwt() ->> 'email' = 'berangervives@gmail.com');

-- Les policies publiques restent inchangées :
--   articles_public_read (publie=true) · site_services_public_read (actif=true)
--   temoignages_public_read (actif=true) · devis_public_insert · newsletter_public_insert
