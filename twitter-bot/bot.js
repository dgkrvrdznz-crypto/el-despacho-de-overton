/**
 * Bot de Twitter — El Despacho de Overton
 * ──────────────────────────────────────────────────────────────────
 * Publica 3 tweets/día desde GitHub Actions (gratis).
 * Fuentes: glosario jurídico (60 %), artículos (30 %), debates (10 %).
 * Si una sección está vacía, redistribuye automáticamente.
 * Historial en Supabase: no repite contenido en 30 días.
 * ──────────────────────────────────────────────────────────────────
 */

import Anthropic         from '@anthropic-ai/sdk';
import { TwitterApi }    from 'twitter-api-v2';
import { createClient }  from '@supabase/supabase-js';

// ────────────────────────────────────────────────
// CONFIGURACIÓN
// ────────────────────────────────────────────────
const SITE_URL      = 'https://eldespachodeoverton.es';
const COOLDOWN_DAYS = 30;   // días antes de reutilizar un contenido
const DRY_RUN       = process.env.DRY_RUN === 'true'; // no publica, solo loguea

// Distribución base (se recalcula si hay secciones vacías)
const BASE_DIST = { glossary: 60, article: 30, debate: 10 };

// ────────────────────────────────────────────────
// CLIENTES
// ────────────────────────────────────────────────
const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // service role — bypasses RLS
);

const twitterClient = new TwitterApi({
  appKey:      process.env.TWITTER_API_KEY,
  appSecret:   process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret:process.env.TWITTER_ACCESS_SECRET,
});

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ────────────────────────────────────────────────
// UTILIDADES
// ────────────────────────────────────────────────
const log = (msg, data) =>
  console.log(`[${new Date().toISOString()}] ${msg}`, data ?? '');

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function pickByWeight(dist) {
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const [k, w] of Object.entries(dist)) { r -= w; if (r <= 0) return k; }
  return Object.keys(dist)[0];
}

// ────────────────────────────────────────────────
// HISTORIAL (tabla tweet_history en Supabase)
// ────────────────────────────────────────────────
async function getRecentIds(type) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - COOLDOWN_DAYS);
  const { data } = await db
    .from('tweet_history')
    .select('content_id')
    .eq('content_type', type)
    .gte('published_at', cutoff.toISOString());
  return new Set((data ?? []).map(r => String(r.content_id)));
}

async function saveHistory(type, contentId, tweetId, tweetText) {
  const { error } = await db.from('tweet_history').insert({
    content_type: type,
    content_id:   String(contentId),
    tweet_id:     String(tweetId),
    tweet_text:   tweetText,
  });
  if (error) log('⚠️  Error guardando historial:', error.message);
}

// ────────────────────────────────────────────────
// FETCH DE CONTENIDO
// ────────────────────────────────────────────────
async function countAvailable() {
  const [g, a, d] = await Promise.all([
    db.from('glossary').select('id', { count: 'exact', head: true }),
    db.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    db.from('debate').select('id',   { count: 'exact', head: true }),
  ]);
  return { glossary: g.count ?? 0, article: a.count ?? 0, debate: d.count ?? 0 };
}

function buildDist(available) {
  // Solo incluir secciones que tienen contenido
  const dist = {};
  for (const [type, weight] of Object.entries(BASE_DIST)) {
    if (available[type] > 0) dist[type] = weight;
  }
  if (!Object.keys(dist).length) throw new Error('Sin contenido en ninguna sección');
  // Renormalizar a 100
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  for (const k of Object.keys(dist)) dist[k] = (dist[k] / total) * 100;
  return dist;
}

async function fetchGlossary(excludeIds) {
  const { data } = await db.from('glossary').select('*');
  const pool = (data ?? []).filter(g => !excludeIds.has(String(g.id)));
  return pick(pool.length ? pool : (data ?? [])); // cooldown reset si todos usados
}

async function fetchArticle(excludeIds) {
  const { data } = await db
    .from('articles')
    .select('id, title, summary, exec, cat, type, date')
    .eq('status', 'published')
    .order('date', { ascending: false });
  const pool = (data ?? []).filter(a => !excludeIds.has(String(a.id)));
  return pick(pool.length ? pool : (data ?? []));
}

async function fetchDebate(excludeIds) {
  const { data } = await db
    .from('debate')
    .select('*')
    .order('created_at', { ascending: false });
  const pool = (data ?? []).filter(d => !excludeIds.has(String(d.id)));
  return pick(pool.length ? pool : (data ?? []));
}

// ────────────────────────────────────────────────
// GENERACIÓN DE TWEETS (Claude Haiku — ~€0.001/tweet)
// ────────────────────────────────────────────────
const STYLES = [
  'pregunta retórica que provoque reflexión',
  'dato sorprendente o contraintuitivo',
  'afirmación directa y polémica pero fundada en Derecho',
  'mito popular que hay que desmentir',
  'analogía con la vida cotidiana del lector',
];

function buildPrompt(type, content) {
  const style = pick(STYLES);
  const base = `\
Eres el community manager de "El Despacho de Overton", publicación española de análisis de Derecho de la Unión Europea.
Voz: rigurosa pero accesible, directa, sin jerga innecesaria. Como si explicaras el Derecho europeo a un amigo inteligente.

REGLAS ESTRICTAS:
- Máximo 260 caracteres en total (el link cuenta como ~23 chars que Twitter acorta)
- Estructura: Hook potente → Insight breve → CTA o pregunta → Link
- Estilo para este tweet: ${style}
- Idioma: español de España
- Emojis: máximo 2, solo si añaden valor
- NUNCA uses hashtags (reducen alcance orgánico)
- Devuelve SOLO el texto del tweet, sin comillas ni explicaciones adicionales`;

  if (type === 'glossary') {
    return `${base}

CONTENIDO:
Término: "${content.term}"
Categoría: ${content.category ?? 'Derecho UE'}
Definición: ${content.definition}
${content.simple_explanation ? `Versión simple: ${content.simple_explanation}` : ''}
${content.practical_example  ? `Ejemplo real: ${content.practical_example}`   : ''}
${content.why_it_matters     ? `Por qué importa: ${content.why_it_matters}`   : ''}

Link que DEBE aparecer al final: ${SITE_URL}/glosario/`;
  }

  if (type === 'article') {
    return `${base}

CONTENIDO:
Título: "${content.title}"
Resumen: ${content.summary ?? ''}
${content.exec ? `Análisis: ${content.exec}` : ''}
Tipo: ${content.type ?? ''} | Categoría: ${content.cat ?? ''}

Link que DEBE aparecer al final: ${SITE_URL}`;
  }

  if (type === 'debate') {
    const total = (content.yes_count ?? 0) + (content.no_count ?? 0);
    const yesPct = total > 0 ? Math.round((content.yes_count / total) * 100) : null;
    return `${base}

CONTENIDO:
Pregunta del debate: "${content.question}"
${yesPct !== null ? `Datos: ${yesPct}% votaron Sí vs ${100 - yesPct}% No (${total} votos en total)` : 'Debate reciente, sin votos aún'}

Objetivo: invitar a votar y generar respuestas. Menciona los datos si están disponibles.
Link que DEBE aparecer al final: ${SITE_URL}/comunidad/`;
  }
}

async function generateTweet(type, content) {
  const maxAttempts = 3;
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await claude.messages.create({
        model:      'claude-3-5-haiku-20241022',
        max_tokens: 320,
        messages:   [{ role: 'user', content: buildPrompt(type, content) }],
      });
      return response.content[0].text.trim();
    } catch (err) {
      lastErr = err;
      const statusInfo = err.status  ? ` [HTTP ${err.status}]`       : '';
      const codeInfo   = err.cause?.code ? ` [${err.cause.code}]`    : '';
      const cause2     = err.cause?.cause?.code ? ` [${err.cause.cause.code}]` : '';
      log(`⚠️ Intento ${attempt}/${maxAttempts} fallido: ${err.message}${statusInfo}${codeInfo}${cause2}`);
      if (err.cause?.message && err.cause.message !== err.message)
        log(`   causa: ${err.cause.message}`);
      if (attempt < maxAttempts) {
        log(`   Reintentando en 8s...`);
        await new Promise(r => setTimeout(r, 8000));
      }
    }
  }
  throw lastErr;
}

// ────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────
async function run() {
  log(DRY_RUN ? '🧪 Bot iniciado en modo DRY RUN (no publicará)' : '🤖 Bot iniciado');

  // 1. Ver qué secciones tienen contenido
  const available = await countAvailable();
  log('📊 Contenido disponible:', available);

  if (Object.values(available).every(n => n === 0)) {
    log('⏸️  Sin contenido en ninguna sección. Saliendo.');
    return;
  }

  // 2. Distribución efectiva
  const dist = buildDist(available);
  log('🎯 Distribución efectiva:', dist);

  // 3. Elegir tipo
  const type = pickByWeight(dist);
  log(`📝 Tipo seleccionado: ${type}`);

  // 4. Historial reciente
  const recentIds = await getRecentIds(type);
  log(`🕐 En cooldown (${COOLDOWN_DAYS}d): ${recentIds.size} ítems`);

  // 5. Fetch contenido
  let content;
  if      (type === 'glossary') content = await fetchGlossary(recentIds);
  else if (type === 'article')  content = await fetchArticle(recentIds);
  else                          content = await fetchDebate(recentIds);

  if (!content) { log('⚠️  Sin contenido disponible. Saliendo.'); return; }

  const label = type === 'glossary' ? content.term
              : type === 'article'  ? content.title
              : content.question;
  log(`✅ Contenido: "${label}"`);

  // 6. Generar tweet
  log('🧠 Generando tweet con Claude...');
  const tweetText = await generateTweet(type, content);
  log('📨 Tweet generado:\n' + '─'.repeat(50) + '\n' + tweetText + '\n' + '─'.repeat(50));
  log(`📏 Longitud: ${tweetText.length} caracteres`);

  if (DRY_RUN) {
    log('🧪 DRY RUN — tweet NO publicado.');
    return;
  }

  // 7. Publicar
  log('🐦 Publicando...');
  const { data: tweet } = await twitterClient.readWrite.v2.tweet(tweetText);
  const url = `https://x.com/i/web/status/${tweet.id}`;
  log(`✅ Publicado: ${url}`);

  // 8. Guardar historial
  await saveHistory(type, content.id, tweet.id, tweetText);
  log('💾 Guardado en historial');
  log('🏁 Completado');
}

run().catch(err => {
  log('❌ ERROR FATAL:', err.message);
  if (err.status)                     log('   → HTTP Status:', err.status);
  if (err.cause?.message)             log('   → Causa:', err.cause.message);
  if (err.cause?.code)                log('   → Código red:', err.cause.code);
  if (err.cause?.cause?.message)      log('   → Causa-2:', err.cause.cause.message);
  if (err.cause?.cause?.code)         log('   → Código-2:', err.cause.cause.code);
  process.exit(1);
});
