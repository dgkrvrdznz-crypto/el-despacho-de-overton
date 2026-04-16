-- ─────────────────────────────────────────────────────────────────
-- Tabla de historial del bot de Twitter
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tweet_history (
  id           bigserial PRIMARY KEY,
  content_type text      NOT NULL CHECK (content_type IN ('glossary','article','debate')),
  content_id   text      NOT NULL,
  tweet_id     text,
  tweet_text   text,
  published_at timestamptz DEFAULT now()
);

-- Índice para consultas rápidas de cooldown
CREATE INDEX IF NOT EXISTS idx_tweet_history_lookup
  ON tweet_history(content_type, content_id, published_at DESC);

-- RLS: solo el service role (el bot) puede escribir; nadie anónimo puede leer
ALTER TABLE tweet_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bot_insert" ON tweet_history
  FOR INSERT WITH CHECK (true);  -- service role bypasses esto igualmente

CREATE POLICY "bot_select" ON tweet_history
  FOR SELECT USING (true);       -- lectura para el bot
