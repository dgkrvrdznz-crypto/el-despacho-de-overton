-- ═══════════════════════════════════════════════════════
-- El Despacho de Overton — Pregunta del Día
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ═══════════════════════════════════════════════════════

-- ── 1. TABLA: daily_questions ────────────────────────
CREATE TABLE IF NOT EXISTS daily_questions (
  id          BIGSERIAL PRIMARY KEY,
  question    TEXT NOT NULL,
  options     JSONB NOT NULL,
  topic       TEXT NOT NULL DEFAULT 'Derecho UE',
  sort_index  INT NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE daily_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dq_select_public" ON daily_questions;
CREATE POLICY "dq_select_public" ON daily_questions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "dq_insert_auth" ON daily_questions;
CREATE POLICY "dq_insert_auth" ON daily_questions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "dq_update_auth" ON daily_questions;
CREATE POLICY "dq_update_auth" ON daily_questions
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "dq_delete_auth" ON daily_questions;
CREATE POLICY "dq_delete_auth" ON daily_questions
  FOR DELETE USING (auth.role() = 'authenticated');

-- ── 2. TABLA: dq_votes ──────────────────────────────
CREATE TABLE IF NOT EXISTS dq_votes (
  id           BIGSERIAL PRIMARY KEY,
  question_id  BIGINT NOT NULL,
  user_id      TEXT NOT NULL,
  option_index INT NOT NULL CHECK (option_index >= 0),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT dq_votes_unique UNIQUE (user_id, question_id)
);

ALTER TABLE dq_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dqv_insert_public" ON dq_votes;
CREATE POLICY "dqv_insert_public" ON dq_votes
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "dqv_select_public" ON dq_votes;
CREATE POLICY "dqv_select_public" ON dq_votes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "dqv_update_public" ON dq_votes;
CREATE POLICY "dqv_update_public" ON dq_votes
  FOR UPDATE USING (true);

-- ── 3. RPC: upsert_dq_vote ──────────────────────────
CREATE OR REPLACE FUNCTION upsert_dq_vote(
  p_question_id bigint,
  p_user_id     text,
  p_option_index int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO dq_votes (question_id, user_id, option_index)
  VALUES (p_question_id, p_user_id, p_option_index)
  ON CONFLICT (user_id, question_id)
  DO UPDATE SET option_index = EXCLUDED.option_index, created_at = NOW();
END;
$$;

-- ── 4. RPC: get_dq_vote_counts ──────────────────────
CREATE OR REPLACE FUNCTION get_dq_vote_counts(p_question_id bigint)
RETURNS TABLE(option_index int, cnt bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT v.option_index, COUNT(*)::bigint
  FROM dq_votes v
  WHERE v.question_id = p_question_id
  GROUP BY v.option_index;
END;
$$;

-- ── 5. RPC: get_or_create_dq ────────────────────────
-- Permite a usuarios anónimos obtener (o crear) la daily_question
-- para un sort_index dado. SECURITY DEFINER evita restricciones RLS.
CREATE OR REPLACE FUNCTION get_or_create_dq(
  p_sort_index int,
  p_question   text,
  p_options    jsonb,
  p_topic      text
)
RETURNS TABLE(id bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id bigint;
BEGIN
  SELECT dq.id INTO v_id
  FROM daily_questions dq
  WHERE dq.sort_index = p_sort_index
  LIMIT 1;

  IF v_id IS NULL THEN
    INSERT INTO daily_questions (question, options, topic, sort_index, active)
    VALUES (p_question, p_options, p_topic, p_sort_index, true)
    RETURNING daily_questions.id INTO v_id;
  END IF;

  RETURN QUERY SELECT v_id;
END;
$$;

-- ── 6. Verificación ─────────────────────────────────
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname='public' AND tablename IN ('daily_questions','dq_votes')
ORDER BY tablename;
