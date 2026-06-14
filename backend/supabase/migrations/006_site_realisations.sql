-- VivesMedia — Table RÉALISATIONS éditables depuis le back-office (CMS)
-- Projet Supabase partagé : lycexinkvpnotvbxbvkm.supabase.co
-- Les réalisations historiques restent EN DUR dans le code (realisations-data.ts).
-- Cette table accueille les NOUVELLES réalisations ajoutées via /cms/realisations,
-- fusionnées avec les statiques sur la page publique /realisations.
-- À exécuter dans Supabase Dashboard → SQL Editor → New query → Run.

create extension if not exists "uuid-ossp";

-- ── SITE_REALISATIONS ─────────────────────────────────────────
create table if not exists public.site_realisations (
  id               uuid primary key default uuid_generate_v4(),
  slug             text not null unique,
  name             text not null,
  type             text,
  year             text,
  tags             text[] not null default '{}',
  hero_image       text,
  live_url         text,
  intro            text,
  context_client   text,
  context_problem  text,
  -- [{ title, desc }]
  solution         jsonb not null default '[]',
  -- [{ value, label }]
  results          jsonb not null default '[]',
  -- [{ src, caption, mobile }]
  gallery          jsonb not null default '[]',
  stack            text[] not null default '{}',
  -- [{ label, href }]
  services         jsonb not null default '[]',
  publie           boolean not null default false,
  ordre            integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── UPDATED_AT auto-trigger (la fonction existe déjà via 003) ──
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists trg_site_realisations_updated on public.site_realisations;
create trigger trg_site_realisations_updated before update on public.site_realisations
  for each row execute procedure update_updated_at();

-- ── RLS ───────────────────────────────────────────────────────
alter table public.site_realisations enable row level security;

-- Lecture publique : uniquement les réalisations publiées
drop policy if exists "site_realisations_public_read" on public.site_realisations;
create policy "site_realisations_public_read" on public.site_realisations
  for select using (publie = true);

-- Admin authentifié (email vérifié dans le JWT) : accès complet
drop policy if exists "admin_all_site_realisations" on public.site_realisations;
create policy "admin_all_site_realisations" on public.site_realisations
  for all using (auth.jwt() ->> 'email' = 'berangervives@gmail.com');

-- ── STORAGE : bucket public pour les visuels de réalisations ──
insert into storage.buckets (id, name, public)
values ('realisations', 'realisations', true)
on conflict (id) do update set public = true;

-- Lecture publique des fichiers du bucket
drop policy if exists "realisations_storage_public_read" on storage.objects;
create policy "realisations_storage_public_read" on storage.objects
  for select using (bucket_id = 'realisations');

-- Upload / modif / suppression réservés à l'admin
drop policy if exists "realisations_storage_admin_write" on storage.objects;
create policy "realisations_storage_admin_write" on storage.objects
  for all
  using (bucket_id = 'realisations' and auth.jwt() ->> 'email' = 'berangervives@gmail.com')
  with check (bucket_id = 'realisations' and auth.jwt() ->> 'email' = 'berangervives@gmail.com');
