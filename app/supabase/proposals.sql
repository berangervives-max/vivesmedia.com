-- Cockpit « À valider » du CMS — file d'attente des actions proposées par les agents.
-- À exécuter UNE fois dans Supabase → SQL Editor → New query → Run.

create table if not exists public.proposals (
  id              uuid primary key default gen_random_uuid(),
  type            text not null default 'autre',     -- post_social | email | campagne | visuel | veille | autre
  titre           text not null default '',
  recherche       text not null default '',          -- ce que l'agent a cherché / compris
  contenu         text not null default '',          -- le contenu proposé
  visuel_url      text not null default '',
  ton             text not null default '',          -- ton choisi + pourquoi
  retombees       text not null default '',          -- retombées estimées sourcées
  cible_url       text not null default '',          -- lien vers l'onglet d'exécution
  statut          text not null default 'a_valider', -- a_valider | valide | refuse
  modif_demandee  text not null default '',          -- modif dictée/écrite par Béranger
  source          text not null default '',          -- agent / automatisation
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create or replace function public.touch_proposals() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists trg_touch_proposals on public.proposals;
create trigger trg_touch_proposals before update on public.proposals
  for each row execute function public.touch_proposals();

alter table public.proposals enable row level security;
drop policy if exists "admin all proposals" on public.proposals;
create policy "admin all proposals" on public.proposals
  for all
  using (auth.jwt() ->> 'email' = 'berangervives@gmail.com')
  with check (auth.jwt() ->> 'email' = 'berangervives@gmail.com');
