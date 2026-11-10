-- ═══════════════════════════════════════════════════════
-- El Despacho de Overton — Tablas de contenido y comunidad
-- Ejecutar en: Supabase Dashboard > SQL Editor
--
-- Reconstruido a partir del código de index.html (columnas que la web
-- lee y escribe). Es idempotente: si las tablas ya existen no las toca,
-- solo añade las columnas que falten, las políticas y las funciones.
-- Complementa a supabase_setup.sql y supabase_pregunta.sql.
-- ═══════════════════════════════════════════════════════

-- ── 1. TABLA: articles ──────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
  id               BIGSERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  type             TEXT,                 -- sentencia / directiva / opinion / …
  cat              TEXT,
  ref              TEXT,
  mins             INT  DEFAULT 5,       -- tiempo de lectura
  date             TEXT,                 -- fecha mostrada ("26 abr 2026")
  photo            TEXT,                 -- URL o data URI
  status           TEXT NOT NULL DEFAULT 'published',  -- published / draft / scheduled
  publish_at       TIMESTAMPTZ,
  summary          TEXT,
  exec             TEXT,                 -- resumen ejecutivo
  detail           TEXT,                 -- explicación detallada
  imp_short        TEXT,                 -- frase de impacto
  impacts          JSONB NOT NULL DEFAULT '[]'::jsonb,
  opinion_content  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS status     TEXT NOT NULL DEFAULT 'published';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS publish_at TIMESTAMPTZ;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS mins       INT DEFAULT 5;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS opinion_content TEXT;

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "articles_select_public" ON articles;
CREATE POLICY "articles_select_public" ON articles FOR SELECT USING (true);
DROP POLICY IF EXISTS "articles_insert_auth" ON articles;
CREATE POLICY "articles_insert_auth" ON articles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "articles_update_auth" ON articles;
CREATE POLICY "articles_update_auth" ON articles FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "articles_delete_auth" ON articles;
CREATE POLICY "articles_delete_auth" ON articles FOR DELETE USING (auth.role() = 'authenticated');

-- ── 2. TABLA: article_views ─────────────────────────────
CREATE TABLE IF NOT EXISTS article_views (
  id          BIGSERIAL PRIMARY KEY,
  article_id  BIGINT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_article_views_article ON article_views(article_id);

ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "views_insert_public" ON article_views;
CREATE POLICY "views_insert_public" ON article_views FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "views_select_auth" ON article_views;
CREATE POLICY "views_select_auth" ON article_views FOR SELECT USING (auth.role() = 'authenticated');

-- ── 3. TABLA: reactions ─────────────────────────────────
CREATE TABLE IF NOT EXISTS reactions (
  id          BIGSERIAL PRIMARY KEY,
  article_id  BIGINT NOT NULL,
  reaction    TEXT NOT NULL,            -- interesting / important / debatable
  session_id  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reactions_article ON reactions(article_id);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reactions_insert_public" ON reactions;
CREATE POLICY "reactions_insert_public" ON reactions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "reactions_select_public" ON reactions;
CREATE POLICY "reactions_select_public" ON reactions FOR SELECT USING (true);

-- ── 4. TABLA: article_comments ──────────────────────────
CREATE TABLE IF NOT EXISTS article_comments (
  id          BIGSERIAL PRIMARY KEY,
  article_id  BIGINT NOT NULL,
  name        TEXT,
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_article_comments_article ON article_comments(article_id, created_at DESC);

ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comments_select_public" ON article_comments;
CREATE POLICY "comments_select_public" ON article_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "comments_insert_public" ON article_comments;
CREATE POLICY "comments_insert_public" ON article_comments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "comments_delete_auth" ON article_comments;
CREATE POLICY "comments_delete_auth" ON article_comments FOR DELETE USING (auth.role() = 'authenticated');

-- ── 5. TABLA: sponsors ──────────────────────────────────
CREATE TABLE IF NOT EXISTS sponsors (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  url         TEXT,
  tagline     TEXT,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sponsors_select_public" ON sponsors;
CREATE POLICY "sponsors_select_public" ON sponsors FOR SELECT USING (active OR auth.role() = 'authenticated');
DROP POLICY IF EXISTS "sponsors_insert_auth" ON sponsors;
CREATE POLICY "sponsors_insert_auth" ON sponsors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "sponsors_update_auth" ON sponsors;
CREATE POLICY "sponsors_update_auth" ON sponsors FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "sponsors_delete_auth" ON sponsors;
CREATE POLICY "sponsors_delete_auth" ON sponsors FOR DELETE USING (auth.role() = 'authenticated');

-- ── 6. TABLA: forum_posts ───────────────────────────────
CREATE TABLE IF NOT EXISTS forum_posts (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT,
  body        TEXT NOT NULL,
  channel     TEXT DEFAULT 'general',   -- general / debate
  reply_to    BIGINT REFERENCES forum_posts(id) ON DELETE CASCADE,
  session_id  TEXT,
  votes       INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS channel    TEXT DEFAULT 'general';
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS reply_to   BIGINT;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS votes      INT NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_forum_posts_channel ON forum_posts(channel, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_reply   ON forum_posts(reply_to);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "forum_select_public" ON forum_posts;
CREATE POLICY "forum_select_public" ON forum_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "forum_insert_public" ON forum_posts;
CREATE POLICY "forum_insert_public" ON forum_posts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "forum_delete_auth" ON forum_posts;
CREATE POLICY "forum_delete_auth" ON forum_posts FOR DELETE USING (auth.role() = 'authenticated');

-- Votos del foro (la web llama a ambas; antes solo existía increment)
CREATE OR REPLACE FUNCTION increment_forum_votes(p_id bigint)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE forum_posts SET votes = COALESCE(votes,0) + 1 WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_forum_votes(p_id bigint)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE forum_posts SET votes = GREATEST(COALESCE(votes,0) - 1, 0) WHERE id = p_id;
END;
$$;

-- Tiempo real del foro (la web se suscribe a cambios en forum_posts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'forum_posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE forum_posts;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════
-- 8. TABLA: site_settings
-- Ajustes editados desde el panel de admin ("Personalizar", "Sobre
-- nosotros", foto, "Equipo" y "Editores"). Antes vivían solo en el
-- navegador del admin; ahora los ven todos los visitantes.
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,          -- about / site / photo / team / editors
  value       JSONB NOT NULL,
  is_public   BOOLEAN NOT NULL DEFAULT true,  -- editors = false (contiene emails)
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "settings_select" ON site_settings;
CREATE POLICY "settings_select" ON site_settings
  FOR SELECT USING (is_public OR auth.role() = 'authenticated');
DROP POLICY IF EXISTS "settings_insert_auth" ON site_settings;
CREATE POLICY "settings_insert_auth" ON site_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "settings_update_auth" ON site_settings;
CREATE POLICY "settings_update_auth" ON site_settings
  FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "settings_delete_auth" ON site_settings;
CREATE POLICY "settings_delete_auth" ON site_settings
  FOR DELETE USING (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════
-- 9. STORAGE: bucket público "media" para las imágenes
-- Las fotos de artículos, "Sobre nosotros" y equipo se suben aquí
-- en lugar de guardarse como texto en la base de datos.
-- ═══════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "media_read_public" ON storage.objects;
CREATE POLICY "media_read_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');
DROP POLICY IF EXISTS "media_insert_auth" ON storage.objects;
CREATE POLICY "media_insert_auth" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "media_delete_auth" ON storage.objects;
CREATE POLICY "media_delete_auth" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- ── 10. Verificación (al final para que el editor muestre este resultado) ─────────────────────────────────────
SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('articles','article_views','reactions','article_comments','sponsors','forum_posts','site_settings')
ORDER BY tablename;
