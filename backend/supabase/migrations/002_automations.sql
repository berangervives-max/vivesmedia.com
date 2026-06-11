-- VivesMedia — Automations pg_cron
-- Prérequis : activer l'extension pg_cron dans Supabase Dashboard > Extensions
-- Ces fonctions sont appelées par cron + par les API routes /api/automations/*

-- ── Extension cron ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ── FONCTION : suivi_devis_abandonnes ─────────────────────────
-- Repère les devis non lus depuis 48h et les marque "contacte"
CREATE OR REPLACE FUNCTION fn_suivi_devis_abandonnes()
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_devis RECORD;
BEGIN
  FOR v_devis IN
    SELECT id, nom, email FROM public.devis
    WHERE statut = 'nouveau' AND lu = false
    AND created_at < NOW() - INTERVAL '48 hours'
  LOOP
    UPDATE public.devis SET statut = 'contacte' WHERE id = v_devis.id;
    -- Email envoyé via API route /api/automations/follow-up
    INSERT INTO public.automation_logs (type, payload) VALUES ('follow_up', row_to_json(v_devis));
  END LOOP;
END; $$;

-- ── FONCTION : alert_factures_impayees ────────────────────────
CREATE OR REPLACE FUNCTION fn_alert_factures_impayees()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.factures SET statut = 'en_retard'
  WHERE statut = 'envoyee'
  AND date_echeance < CURRENT_DATE;
  INSERT INTO public.automation_logs (type, payload)
  VALUES ('overdue_alert', json_build_object('count', (SELECT COUNT(*) FROM public.factures WHERE statut = 'en_retard')));
END; $$;

-- ── FONCTION : rapport_mensuel_revenus ────────────────────────
CREATE OR REPLACE FUNCTION fn_rapport_mensuel()
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_total NUMERIC; v_count INTEGER;
BEGIN
  SELECT SUM(montant_ttc), COUNT(*) INTO v_total, v_count
  FROM public.factures
  WHERE statut = 'payee'
  AND date_trunc('month', created_at) = date_trunc('month', NOW() - INTERVAL '1 month');
  INSERT INTO public.automation_logs (type, payload)
  VALUES ('monthly_report', json_build_object('total', COALESCE(v_total, 0), 'count', v_count));
END; $$;

-- ── TABLE logs automations ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── PLANIFICATION CRON ────────────────────────────────────────
-- Relance devis abandonnés : tous les 2 jours à 10h
SELECT cron.schedule('suivi-devis', '0 10 */2 * *', 'SELECT fn_suivi_devis_abandonnes()');

-- Alerte factures impayées : chaque jour à 9h
SELECT cron.schedule('alert-factures', '0 9 * * *', 'SELECT fn_alert_factures_impayees()');

-- Rapport mensuel : 1er du mois à 8h
SELECT cron.schedule('rapport-mensuel', '0 8 1 * *', 'SELECT fn_rapport_mensuel()');

-- REMARQUE : Les jobs email (newsletter digest, testimonial request, upsell maintenance)
-- sont gérés via les API routes Next.js appelées par des cron jobs Vercel ou n8n.
-- Configurer dans vercel.json ou n8n pour les déclencher périodiquement.
