-- ═══════════════════════════════════════════════════════════════
-- FORO v2 — El Despacho de Overton
-- 1. Separar ADMIN de MIEMBRO (antes cualquier usuario con sesión
--    era admin: podía editar artículos, ajustes, leer suscriptores…)
-- 2. Perfiles de miembro, hilos, respuestas, votos y reportes.
-- Idempotente: se puede ejecutar más de una vez.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. ADMINS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Emails autorizados a ser admin/editor antes de que exista su cuenta
CREATE TABLE IF NOT EXISTS admin_emails (
  email      TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE admins       ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid());
$$;
GRANT EXECUTE ON FUNCTION is_admin() TO anon, authenticated;

DROP POLICY IF EXISTS "admins_select_self" ON admins;
CREATE POLICY "admins_select_self" ON admins FOR SELECT USING (user_id = auth.uid() OR is_admin());
DROP POLICY IF EXISTS "admin_emails_admin" ON admin_emails;
CREATE POLICY "admin_emails_admin" ON admin_emails FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Un admin autoriza un email de editor (se llama antes de crear la cuenta)
CREATE OR REPLACE FUNCTION allow_admin_email(p_email text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Solo un administrador puede hacer esto'; END IF;
  INSERT INTO admin_emails(email) VALUES (lower(trim(p_email))) ON CONFLICT DO NOTHING;
  INSERT INTO admins(user_id) SELECT id FROM auth.users WHERE lower(email) = lower(trim(p_email))
  ON CONFLICT DO NOTHING;
END $$;
GRANT EXECUTE ON FUNCTION allow_admin_email(text) TO authenticated;

-- Al crearse una cuenta con un email autorizado, pasa a ser admin
CREATE OR REPLACE FUNCTION handle_new_user_admin() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM admin_emails WHERE email = lower(NEW.email)) THEN
    INSERT INTO admins(user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS on_auth_user_admin ON auth.users;
CREATE TRIGGER on_auth_user_admin AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_admin();

-- Las cuentas que existen hoy son todas del equipo (admin y editores)
INSERT INTO admins(user_id)
  SELECT id FROM auth.users WHERE created_at < '2026-11-24 12:00:00+00'
  ON CONFLICT DO NOTHING;
INSERT INTO admin_emails(email)
  SELECT lower(email) FROM auth.users WHERE created_at < '2026-11-24 12:00:00+00' AND email IS NOT NULL
  ON CONFLICT DO NOTHING;

-- Reescribir TODAS las políticas "solo usuarios con sesión" → "solo admins"
DO $$
DECLARE r record; q text; c text; stmt text;
BEGIN
  FOR r IN
    SELECT tablename, policyname, cmd, roles::text AS roles, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename NOT IN ('admins','admin_emails','profiles','forum_threads','forum_replies','forum_votes','forum_reports')
      AND (roles::text = '{authenticated}'
           OR qual LIKE '%auth.role() = ''authenticated''::text%'
           OR with_check LIKE '%auth.role() = ''authenticated''::text%')
  LOOP
    q := replace(r.qual,       '(auth.role() = ''authenticated''::text)', 'is_admin()');
    c := replace(r.with_check, '(auth.role() = ''authenticated''::text)', 'is_admin()');
    IF r.roles = '{authenticated}' THEN
      IF q = 'true' THEN q := 'is_admin()'; END IF;
      IF c = 'true' THEN c := 'is_admin()'; END IF;
    END IF;
    stmt := format('ALTER POLICY %I ON public.%I', r.policyname, r.tablename);
    IF q IS NOT NULL AND r.cmd <> 'INSERT' THEN stmt := stmt || ' USING (' || q || ')'; END IF;
    IF c IS NOT NULL AND r.cmd IN ('INSERT','UPDATE','ALL') THEN stmt := stmt || ' WITH CHECK (' || c || ')'; END IF;
    IF stmt <> format('ALTER POLICY %I ON public.%I', r.policyname, r.tablename) THEN
      EXECUTE stmt;
    END IF;
  END LOOP;
END $$;

-- ── 2. PERFILES DE MIEMBRO ───────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  alias      TEXT NOT NULL CHECK (alias ~ '^[A-Za-zÀ-ÿ0-9_.\- ]{3,30}$'),
  bio_role   TEXT CHECK (char_length(bio_role) <= 40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_at TIMESTAMPTZ;  -- aceptación de términos
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_alias ON profiles (lower(alias));
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE USING (id = auth.uid() OR is_admin());

-- ── 3. HILOS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_threads (
  id               BIGSERIAL PRIMARY KEY,
  title            TEXT NOT NULL CHECK (char_length(title) BETWEEN 8 AND 140),
  body             TEXT NOT NULL CHECK (char_length(body) BETWEEN 2 AND 4000),
  author_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic            TEXT NOT NULL DEFAULT 'general'
                   CHECK (topic IN ('general','sentencias','directivas','medioambiente','opinion','debate')),
  article_id       BIGINT UNIQUE REFERENCES articles(id) ON DELETE SET NULL,
  reply_count      INT NOT NULL DEFAULT 0,
  score            INT NOT NULL DEFAULT 0,
  hidden           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_threads_activity ON forum_threads (last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_topic    ON forum_threads (topic, last_activity_at DESC);

-- ── 4. RESPUESTAS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_replies (
  id         BIGSERIAL PRIMARY KEY,
  thread_id  BIGINT NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body       TEXT NOT NULL CHECK (char_length(body) BETWEEN 2 AND 4000),
  score      INT NOT NULL DEFAULT 0,
  hidden     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_replies_thread ON forum_replies (thread_id, created_at);

-- ── 5. VOTOS (uno por persona) ───────────────────────────────
CREATE TABLE IF NOT EXISTS forum_votes (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL CHECK (kind IN ('thread','reply')),
  target_id  BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, kind, target_id)
);

-- ── 6. REPORTES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_reports (
  id          BIGSERIAL PRIMARY KEY,
  reporter_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('thread','reply')),
  target_id   BIGINT NOT NULL,
  reason      TEXT CHECK (char_length(reason) <= 300),
  resolved    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (reporter_id, kind, target_id)
);

-- ── 7. TRIGGERS: autor, contadores y límite de ritmo ─────────
CREATE OR REPLACE FUNCTION forum_before_insert() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n int;
BEGIN
  -- El cliente no puede falsear autor, fechas, votos ni ocultación
  NEW.author_id  := auth.uid();
  NEW.created_at := NOW();
  NEW.score      := 0;
  NEW.hidden     := FALSE;
  IF TG_TABLE_NAME = 'forum_threads' THEN
    NEW.reply_count := 0;
    NEW.last_activity_at := NOW();
    SELECT count(*) INTO n FROM forum_threads WHERE author_id = auth.uid() AND created_at > NOW() - interval '1 hour';
    IF n >= 3 AND NOT is_admin() THEN RAISE EXCEPTION 'RATE_LIMIT' USING HINT = 'Máximo 3 hilos por hora'; END IF;
  ELSE
    SELECT count(*) INTO n FROM forum_replies WHERE author_id = auth.uid() AND created_at > NOW() - interval '10 minutes';
    IF n >= 8 AND NOT is_admin() THEN RAISE EXCEPTION 'RATE_LIMIT' USING HINT = 'Máximo 8 respuestas cada 10 minutos'; END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_threads_bi ON forum_threads;
CREATE TRIGGER trg_threads_bi BEFORE INSERT ON forum_threads FOR EACH ROW EXECUTE FUNCTION forum_before_insert();
DROP TRIGGER IF EXISTS trg_replies_bi ON forum_replies;
CREATE TRIGGER trg_replies_bi BEFORE INSERT ON forum_replies FOR EACH ROW EXECUTE FUNCTION forum_before_insert();

CREATE OR REPLACE FUNCTION forum_reply_counts() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_threads SET reply_count = reply_count + 1, last_activity_at = NOW() WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_threads SET reply_count = GREATEST(reply_count - 1, 0) WHERE id = OLD.thread_id;
  END IF;
  RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS trg_replies_count ON forum_replies;
CREATE TRIGGER trg_replies_count AFTER INSERT OR DELETE ON forum_replies FOR EACH ROW EXECUTE FUNCTION forum_reply_counts();

CREATE OR REPLACE FUNCTION forum_vote_counts() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; d int;
BEGIN
  IF TG_OP = 'INSERT' THEN r := NEW; d := 1; ELSE r := OLD; d := -1; END IF;
  IF r.kind = 'thread' THEN
    UPDATE forum_threads SET score = GREATEST(score + d, 0) WHERE id = r.target_id;
  ELSE
    UPDATE forum_replies SET score = GREATEST(score + d, 0) WHERE id = r.target_id;
  END IF;
  RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS trg_votes_count ON forum_votes;
CREATE TRIGGER trg_votes_count AFTER INSERT OR DELETE ON forum_votes FOR EACH ROW EXECUTE FUNCTION forum_vote_counts();

-- Solo un admin puede cambiar columnas de un hilo/respuesta (ocultar, editar)
-- (los contadores los cambian los triggers SECURITY DEFINER)

-- ── 8. RLS ───────────────────────────────────────────────────
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "threads_select" ON forum_threads;
CREATE POLICY "threads_select" ON forum_threads FOR SELECT USING (NOT hidden OR author_id = auth.uid() OR is_admin());
DROP POLICY IF EXISTS "threads_insert" ON forum_threads;
CREATE POLICY "threads_insert" ON forum_threads FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "threads_update_admin" ON forum_threads;
CREATE POLICY "threads_update_admin" ON forum_threads FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "threads_delete" ON forum_threads;
CREATE POLICY "threads_delete" ON forum_threads FOR DELETE USING (author_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "replies_select" ON forum_replies;
CREATE POLICY "replies_select" ON forum_replies FOR SELECT USING (NOT hidden OR author_id = auth.uid() OR is_admin());
DROP POLICY IF EXISTS "replies_insert" ON forum_replies;
CREATE POLICY "replies_insert" ON forum_replies FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
              AND EXISTS (SELECT 1 FROM forum_threads t WHERE t.id = thread_id AND NOT t.hidden));
DROP POLICY IF EXISTS "replies_update_admin" ON forum_replies;
CREATE POLICY "replies_update_admin" ON forum_replies FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "replies_delete" ON forum_replies;
CREATE POLICY "replies_delete" ON forum_replies FOR DELETE USING (author_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "votes_select_own" ON forum_votes;
CREATE POLICY "votes_select_own" ON forum_votes FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "votes_insert_own" ON forum_votes;
CREATE POLICY "votes_insert_own" ON forum_votes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "votes_delete_own" ON forum_votes;
CREATE POLICY "votes_delete_own" ON forum_votes FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "reports_insert_own" ON forum_reports;
CREATE POLICY "reports_insert_own" ON forum_reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
DROP POLICY IF EXISTS "reports_admin" ON forum_reports;
CREATE POLICY "reports_admin" ON forum_reports FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "reports_admin_update" ON forum_reports;
CREATE POLICY "reports_admin_update" ON forum_reports FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "reports_admin_delete" ON forum_reports;
CREATE POLICY "reports_admin_delete" ON forum_reports FOR DELETE USING (is_admin());

-- ── 9. FORO ANTIGUO: solo lectura ─────────────────────────────
-- forum_posts y article_comments dejan de aceptar mensajes nuevos.
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT tablename, policyname FROM pg_policies
           WHERE schemaname='public' AND tablename IN ('forum_posts','article_comments') AND cmd='INSERT'
  LOOP
    EXECUTE format('ALTER POLICY %I ON public.%I WITH CHECK (false)', r.policyname, r.tablename);
  END LOOP;
END $$;
REVOKE EXECUTE ON FUNCTION increment_forum_votes(bigint) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION decrement_forum_votes(bigint) FROM anon, authenticated, public;
