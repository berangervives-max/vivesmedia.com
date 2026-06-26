-- Onglet « Réseaux sociaux » du CMS — table du calendrier éditorial social.
-- À exécuter UNE fois dans Supabase → SQL Editor → New query → Run.

create table if not exists public.social_posts (
  id          uuid primary key default gen_random_uuid(),
  plateforme  text not null default 'linkedin',   -- 'linkedin' | 'instagram'
  format      text not null default 'post',        -- 'carrousel' | 'reel' | 'post' | 'story'
  titre       text not null default '',
  legende     text not null default '',
  hashtags    text not null default '',
  lien        text not null default '',
  visuel_url  text not null default '',
  date_prevue date,
  statut      text not null default 'idee',         -- 'idee' | 'a_valider' | 'planifie' | 'publie'
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Met à jour updated_at automatiquement
create or replace function public.touch_social_posts() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists trg_touch_social_posts on public.social_posts;
create trigger trg_touch_social_posts before update on public.social_posts
  for each row execute function public.touch_social_posts();

-- RLS : seul l'admin connecté lit/écrit (comme les autres tables du CMS).
alter table public.social_posts enable row level security;
drop policy if exists "admin all social_posts" on public.social_posts;
create policy "admin all social_posts" on public.social_posts
  for all
  using (auth.jwt() ->> 'email' = 'berangervives@gmail.com')
  with check (auth.jwt() ->> 'email' = 'berangervives@gmail.com');
