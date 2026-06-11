-- VivesMedia — Schéma SITE adapté pour le projet Supabase partagé avec le Hub
-- Projet : lycexinkvpnotvbxbvkm.supabase.co
-- ⚠️ La table `clients` du Hub existe déjà → la table clients du site devient `site_clients`
-- À exécuter dans Supabase Dashboard → SQL Editor → New query → Run

create extension if not exists "uuid-ossp";

-- ── SITE_CLIENTS (renommé pour éviter la collision avec clients du Hub) ──
create table if not exists public.site_clients (
  id          uuid primary key default uuid_generate_v4(),
  nom         text not null,
  email       text not null,
  telephone   text,
  entreprise  text,
  secteur     text,
  statut      text not null default 'prospect' check (statut in ('prospect','actif','pause','termine')),
  notes       text,
  stripe_customer_id text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── DEVIS ─────────────────────────────────────────────────────
create table if not exists public.devis (
  id          uuid primary key default uuid_generate_v4(),
  nom         text not null,
  email       text not null,
  telephone   text,
  service     text,
  budget      text,
  message     text,
  statut      text not null default 'nouveau' check (statut in ('nouveau','contacte','en_cours','accepte','refuse')),
  lu          boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── FACTURES ──────────────────────────────────────────────────
create table if not exists public.factures (
  id                uuid primary key default uuid_generate_v4(),
  numero            text not null unique,
  client_nom        text not null,
  client_email      text,
  client_adresse    text,
  client_siret      text,
  date_emission     date not null default current_date,
  date_echeance     date,
  lignes            jsonb not null default '[]',
  remise            numeric(5,2) not null default 0,
  tva_taux          numeric(5,2) not null default 20,
  montant_ht        numeric(10,2) not null default 0,
  montant_tva       numeric(10,2) not null default 0,
  montant_ttc       numeric(10,2) not null default 0,
  statut            text not null default 'brouillon' check (statut in ('brouillon','envoyee','payee','en_retard','annulee')),
  notes             text,
  stripe_payment_link text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── COMMANDES ─────────────────────────────────────────────────
create table if not exists public.commandes (
  id              uuid primary key default uuid_generate_v4(),
  client_nom      text,
  client_email    text,
  service         text,
  montant         numeric(10,2) not null default 0,
  statut          text not null default 'en_attente' check (statut in ('en_attente','paye','rembourse','annule')),
  stripe_session_id text,
  stripe_payment_intent text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── ARTICLES (Blog) ───────────────────────────────────────────
create table if not exists public.articles (
  id          uuid primary key default uuid_generate_v4(),
  titre       text not null,
  slug        text not null unique,
  extrait     text,
  contenu     text,
  categorie   text,
  tags        text,
  date_pub    date default current_date,
  publie      boolean not null default false,
  image_url   text,
  meta_title  text,
  meta_desc   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── SITE_SERVICES (renommé : évite toute ambiguïté future) ────
create table if not exists public.site_services (
  id               uuid primary key default uuid_generate_v4(),
  nom              text not null,
  description      text,
  prix             numeric(10,2) not null default 0,
  prix_mensuel     numeric(10,2),
  stripe_link      text,
  stripe_price_id  text,
  categorie        text,
  actif            boolean not null default true,
  image_url        text,
  ordre            integer default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── TEMOIGNAGES ───────────────────────────────────────────────
create table if not exists public.temoignages (
  id          uuid primary key default uuid_generate_v4(),
  nom         text not null,
  entreprise  text,
  texte       text not null,
  note        integer not null default 5 check (note between 1 and 5),
  actif       boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── NEWSLETTER ────────────────────────────────────────────────
create table if not exists public.newsletter (
  id              uuid primary key default uuid_generate_v4(),
  email           text not null unique,
  actif           boolean not null default true,
  date_inscription timestamptz not null default now()
);

-- ── UPDATED_AT auto-trigger ───────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists trg_site_clients_updated on public.site_clients;
create trigger trg_site_clients_updated  before update on public.site_clients  for each row execute procedure update_updated_at();
drop trigger if exists trg_devis_updated on public.devis;
create trigger trg_devis_updated         before update on public.devis         for each row execute procedure update_updated_at();
drop trigger if exists trg_factures_updated on public.factures;
create trigger trg_factures_updated      before update on public.factures      for each row execute procedure update_updated_at();
drop trigger if exists trg_commandes_updated on public.commandes;
create trigger trg_commandes_updated     before update on public.commandes     for each row execute procedure update_updated_at();
drop trigger if exists trg_articles_updated on public.articles;
create trigger trg_articles_updated      before update on public.articles      for each row execute procedure update_updated_at();
drop trigger if exists trg_site_services_updated on public.site_services;
create trigger trg_site_services_updated before update on public.site_services for each row execute procedure update_updated_at();

-- ── RLS ───────────────────────────────────────────────────────
alter table public.site_clients  enable row level security;
alter table public.devis         enable row level security;
alter table public.factures      enable row level security;
alter table public.commandes     enable row level security;
alter table public.newsletter    enable row level security;
alter table public.articles      enable row level security;
alter table public.site_services enable row level security;
alter table public.temoignages   enable row level security;

-- Lecture publique : articles publiés, services actifs, témoignages actifs
create policy "articles_public_read"    on public.articles      for select using (publie = true);
create policy "site_services_public_read" on public.site_services for select using (actif = true);
create policy "temoignages_public_read" on public.temoignages   for select using (actif = true);

-- Admin authentifié : accès complet
create policy "admin_all_site_clients"  on public.site_clients  for all using (auth.role() = 'authenticated');
create policy "admin_all_devis"         on public.devis         for all using (auth.role() = 'authenticated');
create policy "admin_all_factures"      on public.factures      for all using (auth.role() = 'authenticated');
create policy "admin_all_commandes"     on public.commandes     for all using (auth.role() = 'authenticated');
create policy "admin_all_newsletter"    on public.newsletter    for all using (auth.role() = 'authenticated');
create policy "admin_all_articles"      on public.articles      for all using (auth.role() = 'authenticated');
create policy "admin_all_site_services" on public.site_services for all using (auth.role() = 'authenticated');
create policy "admin_all_temoignages"   on public.temoignages   for all using (auth.role() = 'authenticated');

-- Insertion publique sans auth : formulaire devis + newsletter
create policy "devis_public_insert"      on public.devis      for insert with check (true);
create policy "newsletter_public_insert" on public.newsletter for insert with check (true);
