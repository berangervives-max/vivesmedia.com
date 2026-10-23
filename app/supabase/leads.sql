-- Capture lead rapide (accueil, bloc "Laissez-moi juste votre email") — B14.
-- À exécuter UNE fois dans Supabase → SQL Editor → New query → Run.

create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  source          text not null default 'accueil', -- emplacement du formulaire sur le site
  statut          text not null default 'nouveau',  -- nouveau | contacte | sans_suite
  created_at      timestamptz not null default now()
);

create index if not exists leads_email_idx on public.leads (email);

alter table public.leads enable row level security;
drop policy if exists "admin all leads" on public.leads;
create policy "admin all leads" on public.leads
  for all
  using (auth.jwt() ->> 'email' = 'berangervives@gmail.com')
  with check (auth.jwt() ->> 'email' = 'berangervives@gmail.com');
-- Pas de policy anon : l'insertion publique passe par /api/leads avec la clé service_role
-- (contourne RLS côté serveur uniquement), jamais par un client anon direct.
