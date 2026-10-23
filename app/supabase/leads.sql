-- Capture lead rapide (accueil, bloc "Laissez-moi juste votre email") — B14.
-- À exécuter UNE fois dans Supabase → SQL Editor → New query → Run.

create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique, -- normalisé (trim+lower) à l'écriture, une ligne par email
  source          text not null default 'accueil', -- emplacement du formulaire sur le site
  statut          text not null default 'nouveau',  -- nouveau | contacte | sans_suite — géré depuis le CMS, jamais réécrit par une resoumission publique
  created_at      timestamptz not null default now(), -- date de création, posée une fois, jamais réécrite
  last_seen_at    timestamptz not null default now()  -- dernière resoumission publique — seule colonne que le formulaire peut mettre à jour, sert au anti-doublon/rate-limit
);

create index if not exists leads_email_idx on public.leads (email);

alter table public.leads enable row level security;
drop policy if exists "admin all leads" on public.leads;
create policy "admin all leads" on public.leads
  for all
  using (auth.jwt() ->> 'email' = 'berangervives@gmail.com')
  with check (auth.jwt() ->> 'email' = 'berangervives@gmail.com');
-- Pas de policy anon : l'écriture publique passe par try_capture_lead()
-- (security definer) via /api/leads avec la clé service_role, jamais par un
-- client anon direct.

-- Capture atomique : une seule ligne par email. Un premier passage crée la
-- ligne (statut 'nouveau', géré ensuite depuis le CMS). Une resoumission ne
-- touche QUE last_seen_at, jamais statut/source/created_at — un visiteur qui
-- resoumet son email ne doit jamais pouvoir remettre à zéro un lead que
-- Béranger a déjà traité dans le CMS. Renvoie true seulement quand l'appelant
-- doit envoyer l'email de confirmation (évite la fenêtre de course d'un
-- "vérifier puis insérer" côté application, et le double-envoi sur deux
-- requêtes quasi simultanées).
create or replace function public.try_capture_lead(p_email text, p_source text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_row public.leads;
begin
  insert into public.leads (email, source, statut, last_seen_at)
  values (v_email, p_source, 'nouveau', now())
  on conflict (email) do update
    set last_seen_at = now()
    where public.leads.last_seen_at < now() - interval '10 minutes'
  returning * into v_row;

  return v_row.id is not null; -- une ligne est revenue → insert ou doublon hors fenêtre → notifier
end;
$$;

revoke all on function public.try_capture_lead(text, text) from public, anon, authenticated;
