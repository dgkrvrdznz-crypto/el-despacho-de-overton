-- ═══════════════════════════════════════════════════════════════
-- Baja de la newsletter (art. 21 y 22 LSSI-CE)
-- Ejecutar una vez en Supabase → SQL Editor. Es aditivo: no borra
-- ningún dato existente.
--
-- · unsubscribe_token: identificador secreto de cada suscriptor, para
--   el enlace de baja que llevará cada envío (/baja.html?token=…).
-- · newsletter_unsubscribe(): borra al suscriptor por token o por
--   email. Se puede llamar sin sesión (anon) y no revela si el email
--   existía: siempre devuelve true.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS subscribers_unsubscribe_token_key
  ON subscribers (unsubscribe_token);

CREATE OR REPLACE FUNCTION newsletter_unsubscribe(p_email text DEFAULT NULL, p_token uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_token IS NOT NULL THEN
    DELETE FROM subscribers WHERE unsubscribe_token = p_token;
  ELSIF p_email IS NOT NULL AND length(trim(p_email)) > 3 THEN
    DELETE FROM subscribers WHERE lower(email) = lower(trim(p_email));
  END IF;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION newsletter_unsubscribe(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION newsletter_unsubscribe(text, uuid) TO anon, authenticated;

-- Verificación
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'subscribers'
ORDER BY ordinal_position;
