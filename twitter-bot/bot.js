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
const MODEL         = (process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5').trim();
const MAX_TWEET_LEN = 280;  // límite de X (los links cuentan 23)

// Comprobar secretos antes de nada: un secreto vacío daba errores poco claros
const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'ANTHROPIC_API_KEY'];
if (!DRY_RUN) REQUIRED_ENV.push(
  'TWITTER_API_KEY', 'TWITTER_API_SECRET', 'TWITTER_ACCESS_TOKEN', 'TWITTER_ACCESS_SECRET');
const missingEnv = REQUIRED_ENV.filter(k => !(process.env[k] || '').trim());
if (missingEnv.length) {
  console.error(`❌ Faltan secretos en GitHub (Settings → Secrets → Actions): ${missingEnv.join(', ')}`);
  process.exit(1);
}

// Distribución base (se recalcula si hay secciones vacías)
const BASE_DIST = { glossary: 60, article: 30, debate: 10 };

// ────────────────────────────────────────────────
// CLIENTES
// ────────────────────────────────────────────────
const db = createClient(
  process.env.SUPABASE_URL.trim(),
  process.env.SUPABASE_SERVICE_KEY.trim()  // service role — bypasses RLS
);

// Se crea solo al publicar (en DRY RUN no hacen falta las claves de X)
const makeTwitterClient = () => new TwitterApi({
  appKey:      (process.env.TWITTER_API_KEY       || '').trim(),
  appSecret:   (process.env.TWITTER_API_SECRET    || '').trim(),
  accessToken: (process.env.TWITTER_ACCESS_TOKEN  || '').trim(),
  accessSecret:(process.env.TWITTER_ACCESS_SECRET || '').trim(),
});

const claude = new Anthropic({ apiKey: (process.env.ANTHROPIC_API_KEY || '').trim() });

// ────────────────────────────────────────────────
// UTILIDADES
// ────────────────────────────────────────────────
const log = (msg, data) =>
  console.log(`[${new Date().toISOString()}] ${msg}`, data ?? '');

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// Supabase no lanza excepciones: devuelve { error }. Antes se ignoraba y el bot
// seguía con datos vacíos; ahora falla con un mensaje claro.
function must({ data, error, count }, what) {
  if (error) {
    // "fetch failed" no dice nada: añadir la causa de red (ENOTFOUND, ECONNREFUSED…)
    const extra = [error.details, error.hint, error.code].filter(Boolean).join(' | ');
    throw new Error(`Supabase (${what}): ${error.message}${extra ? ' — ' + extra : ''}`);
  }
  return { data, count };
}

// Longitud según X: cada URL cuenta 23 y los emojis/CJK cuentan 2
function tweetLength(text) {
  const noUrls = text.replace(/https?:\/\/\S+/g, '');
  const urls   = (text.match(/https?:\/\/\S+/g) || []).length;
  let len = urls * 23;
  for (const ch of noUrls) len += ch.codePointAt(0) > 0x10FF ? 2 : 1;
  return len;
}

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
  const { data } = must(await db
    .from('tweet_history')
    .select('content_id')
    .eq('content_type', type)
    .gte('published_at', cutoff.toISOString()), 'tweet_history — ¿ejecutaste twitter-bot/schema.sql?');
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
  must(g, 'glossary'); must(a, 'articles'); must(d, 'debate');
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
  const { data } = must(await db.from('glossary').select('*'), 'glossary');
  const pool = (data ?? []).filter(g => !excludeIds.has(String(g.id)));
  return pick(pool.length ? pool : (data ?? [])); // cooldown reset si todos usados
}

async function fetchArticle(excludeIds) {
  const { data } = must(await db
    .from('articles')
    .select('id, title, summary, exec, cat, type, date')
    .eq('status', 'published')
    .order('id', { ascending: false }), 'articles');
  const pool = (data ?? []).filter(a => !excludeIds.has(String(a.id)));
  return pick(pool.length ? pool : (data ?? []));
}

async function fetchDebate(excludeIds) {
  const { data } = must(await db
    .from('debate')
    .select('*')
    .order('created_at', { ascending: false }), 'debate');
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
        model:      MODEL,
        max_tokens: 320,
        messages:   [{ role: 'user', content: buildPrompt(type, content) }],
      });
      const text = (response.content.find(b => b.type === 'text')?.text || '')
        .trim().replace(/^["“«]|["”»]$/g, '').trim();
      if (!text) throw new Error('Claude devolvió una respuesta vacía');
      // X rechaza los tweets de más de 280: antes eso tumbaba la publicación
      if (tweetLength(text) > MAX_TWEET_LEN)
        throw new Error(`Tweet demasiado largo (${tweetLength(text)} > ${MAX_TWEET_LEN})`);
      return text;
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

  // Diagnóstico: comprobar que la URL de Supabase responde
  try {
    const host = new URL(process.env.SUPABASE_URL.trim()).host;
    const r = await fetch(`https://${host}/rest/v1/`, { headers: { apikey: process.env.SUPABASE_SERVICE_KEY.trim() } });
    log(`🔌 Supabase (${host.split('.')[0].slice(0, 6)}…) responde HTTP ${r.status}`);
  } catch (e) {
    log(`🔌 Supabase no responde: ${e.message} ${e.cause?.code ?? ''} ${e.cause?.message ?? ''}`);
    log('   💡 Si es ENOTFOUND, el proyecto de Supabase está pausado o eliminado, o el secreto SUPABASE_URL es incorrecto');
  }

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
  log(`📏 Longitud (cómputo X): ${tweetLength(tweetText)} / ${MAX_TWEET_LEN}`);

  if (DRY_RUN) {
    log('🧪 DRY RUN — tweet NO publicado.');
    return;
  }

  // 7. Publicar
  log('🐦 Publicando...');
  const { data: tweet } = await makeTwitterClient().readWrite.v2.tweet(tweetText);
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
  // Errores de la API de X (twitter-api-v2): código y detalle
  if (err.code && !err.status)        log('   → Código X:', err.code);
  if (err.data)                       log('   → Respuesta X:', JSON.stringify(err.data));
  if (err.code === 401)               log('   💡 Claves de X inválidas o caducadas: regenera los tokens en developer.x.com');
  if (err.code === 402)               log('   💡 Tu cuenta de X API no tiene créditos/plan para publicar');
  if (err.code === 403)               log('   💡 La app de X no tiene permiso de escritura ("Read and write") o el plan no permite publicar');
  if (err.code === 429)               log('   💡 Límite de publicaciones de X alcanzado');
  if (err.cause?.message)             log('   → Causa:', err.cause.message);
  if (err.cause?.code)                log('   → Código red:', err.cause.code);
  if (err.cause?.cause?.message)      log('   → Causa-2:', err.cause.cause.message);
  if (err.cause?.cause?.code)         log('   → Código-2:', err.cause.cause.code);
  process.exit(1);
});
