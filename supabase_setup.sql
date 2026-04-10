-- ═══════════════════════════════════════════════════════
-- El Despacho de Overton — Supabase DB Setup
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ═══════════════════════════════════════════════════════

-- ── 1. TABLA: contributor_requests ──────────────────────
CREATE TABLE IF NOT EXISTS contributor_requests (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT,
  email       TEXT NOT NULL,
  message     TEXT,
  status      TEXT NOT NULL DEFAULT 'pendiente',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE contributor_requests ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede enviar solicitud
DROP POLICY IF EXISTS "cr_insert_public" ON contributor_requests;
CREATE POLICY "cr_insert_public" ON contributor_requests
  FOR INSERT WITH CHECK (true);

-- Solo autenticados pueden ver y gestionar
DROP POLICY IF EXISTS "cr_select_auth" ON contributor_requests;
CREATE POLICY "cr_select_auth" ON contributor_requests
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "cr_update_auth" ON contributor_requests;
CREATE POLICY "cr_update_auth" ON contributor_requests
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "cr_delete_auth" ON contributor_requests;
CREATE POLICY "cr_delete_auth" ON contributor_requests
  FOR DELETE USING (auth.role() = 'authenticated');

-- ── 2. TABLA: debate ────────────────────────────────────
CREATE TABLE IF NOT EXISTS debate (
  id          BIGSERIAL PRIMARY KEY,
  question    TEXT NOT NULL,
  yes_count   INT NOT NULL DEFAULT 0,
  no_count    INT NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE debate ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer debates
DROP POLICY IF EXISTS "debate_select_public" ON debate;
CREATE POLICY "debate_select_public" ON debate
  FOR SELECT USING (true);

-- Solo autenticados pueden crear/editar debates
DROP POLICY IF EXISTS "debate_insert_auth" ON debate;
CREATE POLICY "debate_insert_auth" ON debate
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "debate_update_auth" ON debate;
CREATE POLICY "debate_update_auth" ON debate
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ── 3. FUNCIÓN RPC: vote_debate ─────────────────────────
-- Permite votar en un debate (actualiza contadores atómicamente)
CREATE OR REPLACE FUNCTION vote_debate(p_id bigint, p_vote text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_vote = 'yes' THEN
    UPDATE debate SET yes_count = yes_count + 1 WHERE id = p_id;
  ELSIF p_vote = 'no' THEN
    UPDATE debate SET no_count = no_count + 1 WHERE id = p_id;
  END IF;
END;
$$;

-- ── 4. TABLA: glossary ──────────────────────────────────
CREATE TABLE IF NOT EXISTS glossary (
  id          BIGSERIAL PRIMARY KEY,
  term        TEXT NOT NULL,
  definition  TEXT NOT NULL,
  category    TEXT DEFAULT 'General',
  source      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE glossary ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer el glosario
DROP POLICY IF EXISTS "glossary_select_public" ON glossary;
CREATE POLICY "glossary_select_public" ON glossary
  FOR SELECT USING (true);

-- Solo autenticados pueden crear/editar/borrar
DROP POLICY IF EXISTS "glossary_insert_auth" ON glossary;
CREATE POLICY "glossary_insert_auth" ON glossary
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "glossary_update_auth" ON glossary;
CREATE POLICY "glossary_update_auth" ON glossary
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "glossary_delete_auth" ON glossary;
CREATE POLICY "glossary_delete_auth" ON glossary
  FOR DELETE USING (auth.role() = 'authenticated');

-- ── 5. TABLA: subscribers (newsletter) ──────────────────
CREATE TABLE IF NOT EXISTS subscribers (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subs_insert_public" ON subscribers;
CREATE POLICY "subs_insert_public" ON subscribers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "subs_select_auth" ON subscribers;
CREATE POLICY "subs_select_auth" ON subscribers
  FOR SELECT USING (auth.role() = 'authenticated');

-- ── 6. FUNCIÓN RPC: increment_forum_votes ───────────────
CREATE OR REPLACE FUNCTION increment_forum_votes(p_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE forum_posts SET votes = COALESCE(votes,0) + 1 WHERE id = p_id;
END;
$$;

-- ── 7. Verificación ─────────────────────────────────────
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('contributor_requests','debate','glossary','subscribers','forum_posts')
ORDER BY tablename;
