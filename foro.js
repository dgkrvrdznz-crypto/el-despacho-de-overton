/* ════════════════════════════════════════════════════════════════
   FORO v2 — El Despacho de Overton
   · Leer es libre. Para escribir se entra con el email (enlace mágico,
     sin contraseña) y se elige un alias una sola vez.
   · Hilos con título, por tema, y un hilo por artículo ("Debatir esto").
   · Un voto por persona, reportes y moderación desde el panel de admin.
   · La base de datos (supabase_foro.sql) aplica todas las reglas: el
     navegador no puede falsear autor, votos ni saltarse los límites.
   Usa globales de index.html: db, esc, showToast, goView, getArts,
   openArt, closeArt, getAvatarColor, timeAgo.
════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* Escritura en el foro (BUG-014). Mientras el acceso por email no funcione
   (falta configurar el SMTP y la URL de redirección en Supabase), el foro es
   de solo lectura para el público; los administradores sí pueden escribir.
   Cambia a true cuando el enlace de acceso llegue bien al correo. */
var FORO_ESCRITURA = false;
var MSG_LECTURA = 'El foro está en modo lectura mientras terminamos de configurar el acceso por email.';

var PAGE = 20;
var TOPICS = [
  ['all','Todos'],['sentencias','Sentencias'],['directivas','Directivas'],
  ['medioambiente','Medio ambiente'],['opinion','Opinión'],['debate','Debate del día'],['general','General']
];
var TOPIC_LABEL = {}; TOPICS.forEach(function(t){ TOPIC_LABEL[t[0]] = t[1]; });
var ART_TOPIC = {sentencia:'sentencias', directiva:'directivas', medioambiente:'medioambiente', opinion:'opinion', otro:'general'};
var ROLES = ['Estudiante de Derecho','Abogado/a','Académico / Investigador','Funcionario/a','Periodista','Ciudadano interesado','Otro'];
var SELECT_THREAD = 'id,title,body,topic,article_id,reply_count,score,hidden,created_at,last_activity_at,author_id,author:profiles(alias,bio_role)';
var SELECT_REPLY  = 'id,thread_id,body,score,hidden,created_at,author_id,author:profiles(alias,bio_role)';

var F = {
  user:null, profile:null, isAdmin:false, votes:{},
  topic:'all', sort:'active', offset:0, threads:[], hasMore:false,
  current:null, pendingHilo:null, mounted:false
};
try{ F.pendingHilo = new URLSearchParams(location.search).get('hilo'); }catch(e){}

/* ── utilidades ─────────────────────────────────────────────── */
function $(id){ return document.getElementById(id); }
function T(s){ return window.OVERTON_T ? window.OVERTON_T(s) : s; }
function toast(m,t){ if(window.showToast) showToast(T(m),t); }
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ if(v==null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){} }
function alias(row){ return (row && row.author && row.author.alias) || 'Miembro'; }
function av(name){ return '<span class="foro-av" style="background:'+getAvatarColor(name)+'">'+esc(name[0].toUpperCase())+'</span>'; }
function ago(d){ return window.timeAgo ? timeAgo(d) : ''; }
function isInt(n){ return /^\d+$/.test(String(n)); }
function artById(id){ try{ return (getArts()||[]).find(function(a){ return String(a.id)===String(id); }); }catch(e){ return null; } }
function canPost(){ return !!(F.user && F.profile); }
function writingOpen(){ return FORO_ESCRITURA || F.isAdmin; }
function errMsg(error){
  var m = (error && (error.message||'')) || '';
  if(m.indexOf('RATE_LIMIT')>=0) return 'Vas muy rápido. Espera un poco antes de publicar de nuevo.';
  if(error && error.code==='23505') return 'Eso ya existe.';
  if(m.indexOf('check constraint')>=0) return 'Revisa la longitud del texto.';
  return 'No se pudo guardar. Inténtalo de nuevo.';
}
function setUrl(hilo, push){
  var url = '/comunidad/' + (hilo ? '?hilo='+hilo : '');
  if(location.pathname+location.search === url) return;
  try{ history[push?'pushState':'replaceState']({view:'comunidad', hilo:hilo||null}, '', url); }catch(e){}
}

/* ── sesión ─────────────────────────────────────────────────── */
async function loadMe(){
  var s = null;
  try{ s = (await db.auth.getSession()).data.session; }catch(e){}
  F.user = s ? s.user : null;
  F.profile = null; F.isAdmin = false; F.votes = {};
  if(F.user){
    var r = await db.from('profiles').select('id,alias,bio_role').eq('id', F.user.id).maybeSingle();
    F.profile = r.data || null;
    try{ var a = await db.rpc('is_admin'); F.isAdmin = a.data === true; }catch(e){}
    var v = await db.from('forum_votes').select('kind,target_id').eq('user_id', F.user.id);
    (v.data||[]).forEach(function(x){ F.votes[x.kind+':'+x.target_id] = 1; });
  }
  renderMe();
  if(F.current) renderThread(); // la sesión puede llegar después de pintar el hilo
}

async function afterLogin(){
  await loadMe();
  if(!F.user) return;
  if(!F.profile){ if(lsGet('foro_login_pending')) openAlias(); return; }
  lsSet('foro_login_pending', null);
  runPending();
}

function runPending(){
  var p = null; try{ p = JSON.parse(lsGet('foro_after_login')||'null'); }catch(e){}
  lsSet('foro_after_login', null);
  if(!p) return;
  if(window.goView) goView('comunidad');
  if(p.type==='new') openComposer(p.ctx||{});
  else if(p.type==='thread' && p.id) openThread(p.id, false);
}

function requireLogin(after){
  if(!writingOpen()){ toast(MSG_LECTURA); return false; }
  if(canPost()) return true;
  if(after) lsSet('foro_after_login', JSON.stringify(after));
  if(F.user && !F.profile) openAlias(); else openAuth();
  return false;
}

async function logout(){
  await db.auth.signOut();
  if(typeof loggedIn !== 'undefined'){ try{ loggedIn = false; }catch(e){} }
  await loadMe();
  if(F.current) renderThread(); else renderList();
  toast('Has salido del foro');
}

/* ── montaje ────────────────────────────────────────────────── */
function mount(){
  var root = $('foroRoot'); if(!root || F.mounted) return;
  F.mounted = true;
  root.innerHTML =
    '<div id="foroListV">'+
      '<div class="foro-bar">'+
        '<div class="foro-me" id="foroMe"></div>'+
        '<button class="btn-gold foro-new" id="foroNewBtn">+ Abrir un debate</button>'+
      '</div>'+
      '<div class="foro-topics" id="foroTopics">'+TOPICS.map(function(t){
        return '<button class="foro-chip'+(t[0]===F.topic?' on':'')+'" data-topic="'+t[0]+'">'+esc(t[1])+'</button>';
      }).join('')+'</div>'+
      '<div class="foro-sort" id="foroSort"><span>Ordenar:</span>'+
        '<button data-sort="active" class="on">Con actividad</button>'+
        '<button data-sort="new">Nuevos</button>'+
        '<button data-sort="top">Más votados</button>'+
      '</div>'+
      '<div class="foro-list" id="foroList"></div>'+
      '<button class="btn-cancel foro-more foro-hide" id="foroMore">Ver más debates</button>'+
    '</div>'+
    '<div id="foroThreadV" class="foro-hide"></div>';
  $('foroNewBtn').onclick = function(){ openComposer({}); };
  $('foroTopics').onclick = function(e){
    var b = e.target.closest('[data-topic]'); if(!b) return;
    F.topic = b.dataset.topic;
    [].forEach.call(this.children, function(c){ c.classList.toggle('on', c===b); });
    loadList(true);
  };
  $('foroSort').onclick = function(e){
    var b = e.target.closest('[data-sort]'); if(!b) return;
    F.sort = b.dataset.sort;
    [].forEach.call(this.querySelectorAll('button'), function(c){ c.classList.toggle('on', c===b); });
    loadList(true);
  };
  $('foroMore').onclick = function(){ loadList(false); };
  mountModals();
  mountDebateCta();
  renderMe();
}

function renderMe(){
  var el = $('foroMe'); if(!el) return;
  if(F.user && F.profile){
    el.innerHTML = av(F.profile.alias)+'<span>Participas como <b data-no-i18n>'+esc(F.profile.alias)+'</b></span> · <button class="foro-link" id="foroOut">Salir</button>';
    $('foroOut').onclick = logout;
  } else if(F.user){
    el.innerHTML = '<span>Te falta elegir un alias.</span> <button class="foro-link" id="foroAl">Elegir alias</button>';
    $('foroAl').onclick = openAlias;
  } else if(!writingOpen()){
    el.innerHTML = '<span>Leer es libre. La participación por escrito se abrirá pronto.</span>';
  } else {
    el.innerHTML = '<span>Leer es libre. Para escribir, </span><button class="foro-link" id="foroIn">entra con tu email</button>';
    $('foroIn').onclick = function(){ openAuth(); };
  }
  var nb = $('foroNewBtn'); if(nb) nb.classList.toggle('foro-hide', !writingOpen());
  var dc = $('foroDebateCta'); if(dc) dc.classList.toggle('foro-hide', !writingOpen());
}

/* Llamada desde goView('comunidad') */
window.foroShow = function(){
  mount();
  if(F.pendingHilo){ var h = F.pendingHilo; F.pendingHilo = null; openThread(h, false); }
  else showList();
};

window.addEventListener('popstate', function(e){
  var h = (e.state && e.state.hilo) || null;
  if(!h && /^\/comunidad\/?$/.test(location.pathname)){
    try{ h = new URLSearchParams(location.search).get('hilo'); }catch(err){}
  }
  F.pendingHilo = h;
});

/* ── lista ──────────────────────────────────────────────────── */
function showList(){
  F.current = null;
  $('foroThreadV').classList.add('foro-hide');
  $('foroListV').classList.remove('foro-hide');
  loadList(true);
}

async function loadList(reset){
  if(reset){ F.offset = 0; F.threads = []; }
  var list = $('foroList');
  if(reset) list.innerHTML = '<div class="foro-empty">Cargando…</div>';
  var q = db.from('forum_threads').select(SELECT_THREAD).eq('hidden', false);
  if(F.topic !== 'all') q = q.eq('topic', F.topic);
  if(F.sort === 'new') q = q.order('created_at', {ascending:false});
  else if(F.sort === 'top') q = q.order('score', {ascending:false}).order('last_activity_at', {ascending:false});
  else q = q.order('last_activity_at', {ascending:false});
  var r = await q.range(F.offset, F.offset + PAGE);
  if(r.error){
    list.innerHTML = '<div class="foro-empty"><strong>No se pudo cargar el foro</strong>Comprueba tu conexión y vuelve a intentarlo.</div>';
    return;
  }
  var rows = r.data || [];
  F.hasMore = rows.length > PAGE;
  rows = rows.slice(0, PAGE);
  F.threads = F.threads.concat(rows);
  F.offset += rows.length;
  renderList();
}

function renderList(){
  var list = $('foroList'); if(!list) return;
  $('foroMore').classList.toggle('foro-hide', !F.hasMore);
  if(!F.threads.length){
    list.innerHTML = '<div class="foro-empty"><strong>'+(F.topic==='all'?'Todavía no hay debates':'Todavía no hay debates en este tema')+'</strong>'+
      (writingOpen() ? 'Abre el primero: una sentencia que te haya sorprendido, una norma que no entiendas o una pregunta que el derecho no responde bien.'
                     : '<span>'+MSG_LECTURA+'</span> <span>Mientras tanto, puedes escribirnos a</span> <a href="mailto:hola@eldespachodeoverton.es">hola@eldespachodeoverton.es</a>.')+'</div>';
    return;
  }
  list.innerHTML = F.threads.map(card).join('');
  [].forEach.call(list.querySelectorAll('[data-hilo]'), function(b){
    b.onclick = function(){ openThread(b.dataset.hilo, true); };
  });
}

function card(t){
  var a = t.article_id ? artById(t.article_id) : null;
  return '<button class="foro-card" data-hilo="'+t.id+'">'+
    '<div class="foro-card-score"><b>'+(t.score||0)+'</b>▲</div>'+
    '<div class="foro-card-main">'+
      '<span class="foro-tag">'+esc(TOPIC_LABEL[t.topic]||t.topic)+'</span>'+
      (a ? '<span class="foro-tag art">📄 Artículo</span>' : '')+
      '<div class="foro-card-title" data-no-i18n>'+esc(t.title)+'</div>'+
      '<div class="foro-card-ex" data-no-i18n>'+esc(t.body)+'</div>'+
      '<div class="foro-meta"><span><b data-no-i18n>'+esc(alias(t))+'</b></span>'+
        '<span>💬 '+(t.reply_count||0)+' '+(t.reply_count===1?'respuesta':'respuestas')+'</span>'+
        '<span>'+esc(ago(t.last_activity_at))+'</span></div>'+
    '</div></button>';
}

/* ── hilo ───────────────────────────────────────────────────── */
async function openThread(id, push){
  mount();
  if(!isInt(id)) return showList();
  var tv = $('foroThreadV');
  $('foroListV').classList.add('foro-hide');
  tv.classList.remove('foro-hide');
  tv.innerHTML = '<div class="foro-empty">Cargando…</div>';
  var root = $('foroRoot'); if(root && push) root.scrollIntoView({behavior:'smooth', block:'start'});
  var r = await db.from('forum_threads').select(SELECT_THREAD).eq('id', id).maybeSingle();
  if(r.error || !r.data){
    tv.innerHTML = '<button class="foro-back" id="foroBack">← Todos los debates</button><div class="foro-empty"><strong>Este debate no existe o se ha retirado</strong></div>';
    $('foroBack').onclick = backToList;
    setUrl(null, false);
    return;
  }
  var rr = await db.from('forum_replies').select(SELECT_REPLY).eq('thread_id', id).order('created_at', {ascending:true}).limit(500);
  F.current = {thread:r.data, replies:rr.data||[]};
  setUrl(id, push);
  renderThread();
}

function backToList(){ setUrl(null, true); showList(); }

function actions(kind, row){
  var key = kind+':'+row.id, voted = !!F.votes[key];
  var mine = F.user && row.author_id === F.user.id;
  var h = '<button class="foro-act'+(voted?' on':'')+'" data-act="vote" data-kind="'+kind+'" data-id="'+row.id+'">▲ '+(row.score||0)+'</button>';
  if(kind==='thread') h += '<button class="foro-act" data-act="share">🔗 Copiar enlace</button>';
  if(!mine) h += '<button class="foro-act warn" data-act="report" data-kind="'+kind+'" data-id="'+row.id+'">⚑ Reportar</button>';
  if(mine || F.isAdmin) h += '<button class="foro-act warn" data-act="del" data-kind="'+kind+'" data-id="'+row.id+'">Eliminar</button>';
  if(F.isAdmin) h += '<button class="foro-act" data-act="hide" data-kind="'+kind+'" data-id="'+row.id+'" data-hidden="'+(row.hidden?1:0)+'">'+(row.hidden?'Mostrar':'Ocultar')+'</button>';
  return '<div class="foro-actions">'+h+'</div>';
}

function authorLine(row){
  var n = alias(row), role = row.author && row.author.bio_role;
  return '<div class="foro-author">'+av(n)+'<span><b data-no-i18n>'+esc(n)+'</b>'+(role?' <span class="foro-role">· '+esc(role)+'</span>':'')+
    ' · '+esc(ago(row.created_at))+(row.hidden?'<span class="foro-hidden-note">Oculto</span>':'')+'</span></div>';
}

function renderThread(){
  var tv = $('foroThreadV'); if(!tv || !F.current) return;
  var t = F.current.thread, reps = F.current.replies;
  var a = t.article_id ? artById(t.article_id) : null;
  var h = '<button class="foro-back" id="foroBack">← Todos los debates</button>'+
    '<article class="foro-thread">'+
      '<span class="foro-tag">'+esc(TOPIC_LABEL[t.topic]||t.topic)+'</span>'+
      '<h3 data-no-i18n>'+esc(t.title)+'</h3>'+
      authorLine(t)+
      '<div class="foro-body" data-no-i18n>'+esc(t.body)+'</div>'+
      (a ? '<button class="foro-artlink" id="foroArtLink">📄 Leer el artículo: <span data-no-i18n>'+esc(a.title)+'</span></button>' : '')+
      actions('thread', t)+
      '<div class="foro-replies-h">'+reps.length+' '+(reps.length===1?'respuesta':'respuestas')+'</div>'+
      '<div id="foroReplies">'+(reps.length ? reps.map(function(r){
        var n = alias(r);
        return '<div class="foro-reply">'+av(n)+'<div class="foro-reply-main">'+
          '<div class="foro-author"><span><b data-no-i18n>'+esc(n)+'</b>'+(r.author&&r.author.bio_role?' <span class="foro-role">· '+esc(r.author.bio_role)+'</span>':'')+
          ' · '+esc(ago(r.created_at))+(r.hidden?'<span class="foro-hidden-note">Oculto</span>':'')+'</span></div>'+
          '<div class="foro-body" data-no-i18n>'+esc(r.body)+'</div>'+actions('reply', r)+'</div></div>';
      }).join('') : '<p class="foro-hint">Nadie ha respondido todavía. Aporta el primer argumento.</p>')+'</div>'+
      composerHtml()+
    '</article>';
  tv.innerHTML = h;
  $('foroBack').onclick = backToList;
  if(a) $('foroArtLink').onclick = function(){ openArt(a.id); };
  tv.querySelector('.foro-thread').onclick = onAction;
  var send = $('foroReplySend'); if(send) send.onclick = postReply;
  var lg = $('foroReplyLogin'); if(lg) lg.onclick = function(){ requireLogin({type:'thread', id:t.id}); };
  var ta = $('foroReplyTa'); if(ta) ta.oninput = function(){ $('foroReplyCount').textContent = ta.value.length+' / 4000'; };
}

function composerHtml(){
  if(!writingOpen()) return '<div class="foro-login-cta">'+MSG_LECTURA+'</div>';
  if(canPost()){
    return '<div class="foro-composer"><textarea class="foro-ta" id="foroReplyTa" maxlength="4000" placeholder="Tu argumento. Cita la norma o la sentencia si puedes."></textarea>'+
      '<div class="foro-row"><span class="foro-hint" id="foroReplyCount">0 / 4000</span><button class="btn-gold" id="foroReplySend" style="font-size:.82rem;padding:9px 22px">Responder →</button></div></div>';
  }
  return '<div class="foro-login-cta">Para responder necesitas entrar con tu email. Sin contraseñas: te enviamos un enlace.<br><button class="btn-blue" id="foroReplyLogin">Entrar para responder</button></div>';
}

async function postReply(){
  var ta = $('foroReplyTa'), body = (ta.value||'').trim();
  if(body.length < 2){ toast('Escribe tu respuesta','error'); return; }
  var b = $('foroReplySend'); b.disabled = true;
  var r = await db.from('forum_replies').insert([{thread_id:F.current.thread.id, author_id:F.user.id, body:body}]).select(SELECT_REPLY).single();
  b.disabled = false;
  if(r.error){ toast(errMsg(r.error),'error'); return; }
  F.current.replies.push(r.data);
  F.current.thread.reply_count = (F.current.thread.reply_count||0)+1;
  renderThread();
  toast('Respuesta publicada ✓');
}

async function onAction(e){
  var b = e.target.closest('[data-act]'); if(!b) return;
  var act = b.dataset.act, kind = b.dataset.kind, id = b.dataset.id;
  if(act==='share'){
    var url = location.origin+'/comunidad/?hilo='+F.current.thread.id;
    try{ await navigator.clipboard.writeText(url); toast('Enlace copiado ✓'); }
    catch(err){ window.prompt(T('Copia este enlace:'), url); }
    return;
  }
  if(act==='vote'){
    if(!requireLogin({type:'thread', id:F.current.thread.id})) return;
    return vote(kind, id);
  }
  if(act==='report'){
    if(!requireLogin({type:'thread', id:F.current.thread.id})) return;
    if(!confirm('¿Enviar este mensaje a moderación? Lo revisaremos lo antes posible.')) return;
    var rp = await db.from('forum_reports').insert([{kind:kind, target_id:+id, reporter_id:F.user.id}]);
    if(rp.error && rp.error.code==='23505'){ toast('Ya lo habías reportado. Gracias.'); return; }
    if(rp.error){ toast(errMsg(rp.error),'error'); return; }
    toast('Gracias. Lo revisaremos.');
    return;
  }
  if(act==='del'){
    if(!confirm(kind==='thread'?'¿Eliminar este debate y todas sus respuestas?':'¿Eliminar esta respuesta?')) return;
    var d = await db.from(kind==='thread'?'forum_threads':'forum_replies').delete().eq('id', id);
    if(d.error){ toast(errMsg(d.error),'error'); return; }
    toast('Eliminado');
    if(kind==='thread') backToList(); else openThread(F.current.thread.id, false);
    return;
  }
  if(act==='hide'){
    var hide = b.dataset.hidden !== '1';
    var u = await db.from(kind==='thread'?'forum_threads':'forum_replies').update({hidden:hide}).eq('id', id);
    if(u.error){ toast(errMsg(u.error),'error'); return; }
    toast(hide?'Oculto al público':'Visible de nuevo');
    openThread(F.current.thread.id, false);
  }
}

async function vote(kind, id){
  var key = kind+':'+id, had = !!F.votes[key];
  var r = had
    ? await db.from('forum_votes').delete().eq('user_id', F.user.id).eq('kind', kind).eq('target_id', id)
    : await db.from('forum_votes').insert([{user_id:F.user.id, kind:kind, target_id:+id}]);
  if(r.error && r.error.code!=='23505'){ toast(errMsg(r.error),'error'); return; }
  if(had) delete F.votes[key]; else F.votes[key] = 1;
  var row = kind==='thread' ? F.current.thread : F.current.replies.find(function(x){ return String(x.id)===String(id); });
  if(row) row.score = Math.max(0, (row.score||0) + (had?-1:1));
  renderThread();
}

/* ── nuevo debate ───────────────────────────────────────────── */
function openComposer(ctx){
  ctx = ctx || {};
  if(!requireLogin({type:'new', ctx:ctx})) return;
  $('foroNewTitle').value = ctx.title || '';
  $('foroNewTopic').value = ctx.topic || (F.topic!=='all'?F.topic:'general');
  $('foroNewBody').value = '';
  $('foroNewErr').textContent = '';
  var a = ctx.article_id ? artById(ctx.article_id) : null;
  $('foroNewArt').innerHTML = a ? '📄 Sobre el artículo: <b data-no-i18n>'+esc(a.title)+'</b>' : '';
  $('foroNewOv').dataset.article = a ? a.id : '';
  $('foroNewOv').classList.add('open');
  setTimeout(function(){ (ctx.title?$('foroNewBody'):$('foroNewTitle')).focus(); }, 60);
}

async function submitNew(){
  var title = $('foroNewTitle').value.trim(), body = $('foroNewBody').value.trim();
  var topic = $('foroNewTopic').value, art = $('foroNewOv').dataset.article;
  var err = $('foroNewErr');
  if(title.length < 8){ err.textContent = T('El título necesita al menos 8 caracteres.'); return; }
  if(body.length < 2){ err.textContent = T('Explica tu planteamiento en unas líneas.'); return; }
  var row = {title:title, body:body, topic:topic, author_id:F.user.id};
  if(art && isInt(art)) row.article_id = +art;
  var b = $('foroNewSend'); b.disabled = true;
  var r = await db.from('forum_threads').insert([row]).select('id').single();
  b.disabled = false;
  if(r.error && r.error.code==='23505' && row.article_id){
    var ex = await db.from('forum_threads').select('id').eq('article_id', row.article_id).maybeSingle();
    $('foroNewOv').classList.remove('open');
    if(ex.data){ toast('Ya hay un debate sobre este artículo. Te llevo a él.'); goView('comunidad'); openThread(ex.data.id, true); }
    return;
  }
  if(r.error){ err.textContent = T(errMsg(r.error)); return; }
  $('foroNewOv').classList.remove('open');
  if(window.closeArt) try{ closeArt(); }catch(e){}
  goView('comunidad');
  openThread(r.data.id, true);
  toast('Debate publicado ✓');
}

/* ── modales ────────────────────────────────────────────────── */
function mountModals(){
  if($('foroAuthOv')) return;
  var wrap = document.createElement('div');
  wrap.innerHTML =
  /* entrar */
  '<div class="foro-ov" id="foroAuthOv"><div class="foro-box" role="dialog" aria-modal="true" aria-labelledby="foroAuthH">'+
    '<div id="foroAuthStep1">'+
      '<h4 id="foroAuthH">Entra para participar</h4>'+
      '<p>Te enviamos un enlace a tu correo y entras con un clic. Sin contraseñas. Tu email no se muestra nunca: en el foro solo aparece tu alias.</p>'+
      '<label class="foro-lbl" for="foroEmail">Tu email</label>'+
      '<input class="foro-in" id="foroEmail" type="email" autocomplete="email" placeholder="tu@email.com"/>'+
      '<div class="foro-check"><input type="checkbox" id="foroTerms"/><label for="foroTerms">Tengo 14 años o más y acepto los <a href="/terminos-condiciones.html" target="_blank" rel="noopener">términos y condiciones</a> y la <a href="/politica-privacidad.html" target="_blank" rel="noopener">política de privacidad</a>.</label></div>'+
      '<div class="foro-check"><input type="checkbox" id="foroNl"/><label for="foroNl">Quiero recibir también la newsletter (opcional).</label></div>'+
      '<div class="foro-err" id="foroAuthErr"></div>'+
      '<div class="foro-btns"><button class="btn-cancel" data-close>Ahora no</button><button class="btn-blue" id="foroAuthSend">Enviarme el enlace</button></div>'+
    '</div>'+
    '<div id="foroAuthStep2" class="foro-hide">'+
      '<h4>Revisa tu correo</h4>'+
      '<p>Te hemos enviado un enlace a <b id="foroAuthTo" data-no-i18n></b>. Ábrelo en este mismo navegador y volverás aquí con la sesión iniciada. Si no lo ves en un par de minutos, mira en la carpeta de spam.</p>'+
      '<div class="foro-btns"><button class="btn-blue" data-close>Entendido</button></div>'+
    '</div>'+
  '</div></div>'+
  /* alias */
  '<div class="foro-ov" id="foroAliasOv"><div class="foro-box" role="dialog" aria-modal="true" aria-labelledby="foroAliasH">'+
    '<h4 id="foroAliasH">Elige tu alias</h4>'+
    '<p>Es el nombre que verán los demás. Solo se elige una vez.</p>'+
    '<label class="foro-lbl" for="foroAlias">Alias</label>'+
    '<input class="foro-in" id="foroAlias" maxlength="30" placeholder="Ej.: JuristaNovato"/>'+
    '<label class="foro-lbl" for="foroRole">Tu perfil (opcional)</label>'+
    '<select class="foro-sel" id="foroRole"><option value="">Prefiero no decirlo</option>'+ROLES.map(function(r){ return '<option>'+esc(r)+'</option>'; }).join('')+'</select>'+
    '<div class="foro-err" id="foroAliasErr"></div>'+
    '<div class="foro-btns"><button class="btn-cancel" data-close>Ahora no</button><button class="btn-blue" id="foroAliasSave">Guardar alias</button></div>'+
  '</div></div>'+
  /* nuevo debate */
  '<div class="foro-ov" id="foroNewOv"><div class="foro-box" role="dialog" aria-modal="true" aria-labelledby="foroNewH">'+
    '<h4 id="foroNewH">Abrir un debate</h4>'+
    '<p id="foroNewArt"></p>'+
    '<label class="foro-lbl" for="foroNewTitle">Pregunta o tesis</label>'+
    '<input class="foro-in" id="foroNewTitle" maxlength="140" placeholder="Ej.: ¿Vulnera el AI Act el derecho a la intimidad en el trabajo?"/>'+
    '<label class="foro-lbl" for="foroNewTopic">Tema</label>'+
    '<select class="foro-sel" id="foroNewTopic">'+TOPICS.slice(1).map(function(t){ return '<option value="'+t[0]+'">'+esc(t[1])+'</option>'; }).join('')+'</select>'+
    '<label class="foro-lbl" for="foroNewBody">Tu planteamiento</label>'+
    '<textarea class="foro-ta" id="foroNewBody" maxlength="4000" placeholder="Explica el caso y tu postura. Los mejores debates citan la norma o la sentencia."></textarea>'+
    '<div class="foro-err" id="foroNewErr"></div>'+
    '<div class="foro-btns"><button class="btn-cancel" data-close>Cancelar</button><button class="btn-gold" id="foroNewSend" style="padding:10px 22px">Publicar debate →</button></div>'+
  '</div></div>';
  while(wrap.firstChild) document.body.appendChild(wrap.firstChild);
  ['foroAuthOv','foroAliasOv','foroNewOv'].forEach(function(id){
    var ov = $(id);
    ov.addEventListener('click', function(e){
      if(e.target === ov || e.target.closest('[data-close]')) ov.classList.remove('open');
    });
  });
  $('foroAuthSend').onclick = sendLink;
  $('foroEmail').onkeydown = function(e){ if(e.key==='Enter') sendLink(); };
  $('foroAliasSave').onclick = saveAlias;
  $('foroAlias').onkeydown = function(e){ if(e.key==='Enter') saveAlias(); };
  $('foroNewSend').onclick = submitNew;
}

function openAuth(){
  mount(); mountModals();
  $('foroAuthStep1').classList.remove('foro-hide');
  $('foroAuthStep2').classList.add('foro-hide');
  $('foroAuthErr').textContent = '';
  $('foroAuthOv').classList.add('open');
  setTimeout(function(){ $('foroEmail').focus(); }, 60);
}

async function sendLink(){
  var email = $('foroEmail').value.trim(), err = $('foroAuthErr');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ err.textContent = T('Introduce un email válido.'); return; }
  if(!$('foroTerms').checked){ err.textContent = T('Para participar tienes que aceptar los términos y la política de privacidad.'); return; }
  var b = $('foroAuthSend'); b.disabled = true; err.textContent = '';
  var hilo = F.current ? F.current.thread.id : null;
  var r = await db.auth.signInWithOtp({email:email, options:{emailRedirectTo: location.origin+'/comunidad/'+(hilo?'?hilo='+hilo:'')}});
  b.disabled = false;
  if(r.error){
    err.textContent = T(/rate|seconds/i.test(r.error.message) ? 'Has pedido varios enlaces seguidos. Espera un minuto y vuelve a intentarlo.' : 'No se pudo enviar el enlace. Inténtalo de nuevo en un momento.');
    return;
  }
  lsSet('foro_login_pending', '1');
  lsSet('foro_terms_at', new Date().toISOString());
  if(!lsGet('foro_after_login') && hilo) lsSet('foro_after_login', JSON.stringify({type:'thread', id:hilo}));
  if($('foroNl').checked){ try{ await db.from('subscribers').insert([{email:email}]); }catch(e){} }
  $('foroAuthTo').textContent = email;
  $('foroAuthStep1').classList.add('foro-hide');
  $('foroAuthStep2').classList.remove('foro-hide');
}

function openAlias(){
  mount(); mountModals();
  $('foroAliasErr').textContent = '';
  $('foroAliasOv').classList.add('open');
  setTimeout(function(){ $('foroAlias').focus(); }, 60);
}

async function saveAlias(){
  var a = $('foroAlias').value.trim().replace(/\s+/g,' '), err = $('foroAliasErr');
  if(!/^[A-Za-zÀ-ÿ0-9_.\- ]{3,30}$/.test(a)){ err.textContent = T('De 3 a 30 caracteres: letras, números, espacios, punto, guion o guion bajo.'); return; }
  if(!F.user){ $('foroAliasOv').classList.remove('open'); openAuth(); return; }
  var b = $('foroAliasSave'); b.disabled = true;
  var r = await db.from('profiles').insert([{id:F.user.id, alias:a, bio_role:$('foroRole').value||null, terms_at:lsGet('foro_terms_at')||new Date().toISOString()}]);
  b.disabled = false;
  if(r.error){ err.textContent = T(r.error.code==='23505' ? 'Ese alias ya está cogido. Prueba otro.' : 'No se pudo guardar. Inténtalo de nuevo.'); return; }
  $('foroAliasOv').classList.remove('open');
  lsSet('foro_login_pending', null);
  await loadMe();
  toast('¡Bienvenido/a al foro, '+a+'!');
  if(F.current) renderThread();
  runPending();
}

/* ── debate en cada artículo ─────────────────────────────────── */
window.foroArticleBlock = async function(artId){
  var box = $('artForo'); if(!box) return;
  if(!isInt(artId)){ box.innerHTML = ''; return; }
  box.innerHTML = '<div class="foro-art-h">💬 Debate sobre este artículo</div><div class="foro-art-box"><p>Cargando…</p></div>';
  var r = await db.from('forum_threads').select('id,reply_count').eq('article_id', artId).eq('hidden', false).maybeSingle();
  if(typeof currentArtId !== 'undefined' && String(currentArtId) !== String(artId)) return; // se cerró o cambió de artículo
  var t = r.data, html = '';
  if(t){
    var rr = await db.from('forum_replies').select('body,author:profiles(alias)').eq('thread_id', t.id).eq('hidden', false).order('created_at', {ascending:false}).limit(2);
    html = '<p>'+(t.reply_count ? t.reply_count+' '+(t.reply_count===1?'respuesta':'respuestas')+' en el debate.' : 'El debate está abierto y aún no tiene respuestas.')+'</p>'+
      (rr.data||[]).map(function(x){ return '<div class="foro-art-q" data-no-i18n><b>'+esc(alias(x))+':</b> '+esc(x.body)+'</div>'; }).join('')+
      '<button class="btn-gold" id="artForoGo" style="font-size:.8rem;padding:9px 20px;margin-top:6px">Ir al debate →</button>';
  } else if(!writingOpen()){
    html = '<p><span>'+MSG_LECTURA+'</span> <span>Si quieres comentar este análisis, escríbenos a</span> <a href="mailto:hola@eldespachodeoverton.es">hola@eldespachodeoverton.es</a>.</p>';
  } else {
    html = '<p>Nadie ha abierto todavía el debate sobre este artículo. ¿Qué opinas tú?</p>'+
      '<button class="btn-gold" id="artForoNew" style="font-size:.8rem;padding:9px 20px">Debatir esto →</button>';
  }
  box.querySelector('.foro-art-box').innerHTML = html;
  var go = $('artForoGo');
  if(go) go.onclick = function(){ try{ closeArt(); }catch(e){} goView('comunidad'); openThread(t.id, true); };
  var nw = $('artForoNew');
  if(nw) nw.onclick = function(){
    var a = artById(artId) || {};
    var title = (a.title||'').slice(0,140);
    if(title.length < 8) title = '';
    openComposer({article_id:artId, title:title, topic:ART_TOPIC[a.type]||'general'});
  };
};

/* ── debate del día → foro ──────────────────────────────────── */
function mountDebateCta(){
  var box = $('comDebateInline'); if(!box || $('foroDebateCta')) return;
  var b = document.createElement('button');
  b.className = 'foro-debate-cta'; b.id = 'foroDebateCta';
  b.textContent = '💬 Argumenta tu voto en el foro';
  if(!writingOpen()) b.classList.add('foro-hide');
  b.onclick = async function(){
    var q = (($('comDebateQ')||{}).textContent||'').trim();
    if(q.length < 8 || /Cargando/.test(q)) return;
    var r = await db.from('forum_threads').select('id').eq('topic','debate').eq('title', q.slice(0,140)).eq('hidden', false).limit(1);
    if(r.data && r.data.length) openThread(r.data[0].id, true);
    else openComposer({topic:'debate', title:q.slice(0,140)});
  };
  box.appendChild(b);
}

/* ── panel de admin ─────────────────────────────────────────── */
window.foroRenderAdmin = async function(){
  var list = $('admCommentsList'); if(!list) return;
  list.innerHTML = '<p style="color:var(--muted);font-size:.84rem">Cargando…</p>';
  var rep = await db.from('forum_reports').select('*').eq('resolved', false).order('created_at', {ascending:false}).limit(100);
  var th  = await db.from('forum_threads').select(SELECT_THREAD).order('created_at', {ascending:false}).limit(25);
  var rp  = await db.from('forum_replies').select(SELECT_REPLY).order('created_at', {ascending:false}).limit(25);
  if(rep.error || th.error || rp.error){
    list.innerHTML = '<p style="color:#d64040;font-size:.84rem">No se pudo cargar. ¿Has entrado con una cuenta de administrador?</p>'; return;
  }
  var byKey = {};
  (th.data||[]).forEach(function(x){ byKey['thread:'+x.id] = x; });
  (rp.data||[]).forEach(function(x){ byKey['reply:'+x.id] = x; });
  var missingT = [], missingR = [];
  (rep.data||[]).forEach(function(x){ if(!byKey[x.kind+':'+x.target_id]) (x.kind==='thread'?missingT:missingR).push(x.target_id); });
  if(missingT.length){ var a = await db.from('forum_threads').select(SELECT_THREAD).in('id', missingT); (a.data||[]).forEach(function(x){ byKey['thread:'+x.id] = x; }); }
  if(missingR.length){ var b = await db.from('forum_replies').select(SELECT_REPLY).in('id', missingR); (b.data||[]).forEach(function(x){ byKey['reply:'+x.id] = x; }); }

  function row(kind, x, reportId, count){
    if(!x) return '';
    var txt = kind==='thread' ? x.title+' — '+x.body : x.body;
    return '<div class="foro-adm-row"><div style="min-width:0">'+
      '<div style="font-size:.78rem;color:var(--muted)"><b>'+esc(alias(x))+'</b> · '+(kind==='thread'?'Debate':'Respuesta')+' · '+esc(ago(x.created_at))+
      (x.hidden?' <span class="foro-hidden-note">Oculto</span>':'')+(count?' <span class="foro-hidden-note">⚑ '+count+' reporte'+(count>1?'s':'')+'</span>':'')+'</div>'+
      '<div class="foro-body">'+esc(txt.slice(0,400))+'</div></div>'+
      '<div class="foro-adm-btns">'+
        '<button class="btn-sm" data-adm="open" data-t="'+(kind==='thread'?x.id:x.thread_id)+'">Ver</button>'+
        '<button class="btn-sm" data-adm="hide" data-k="'+kind+'" data-id="'+x.id+'" data-h="'+(x.hidden?1:0)+'">'+(x.hidden?'Mostrar':'Ocultar')+'</button>'+
        '<button class="btn-sm" style="color:#d64040" data-adm="del" data-k="'+kind+'" data-id="'+x.id+'">Eliminar</button>'+
        (reportId?'<button class="btn-sm" data-adm="ok" data-k="'+kind+'" data-id="'+x.id+'">Descartar reporte</button>':'')+
      '</div></div>';
  }
  var counts = {};
  (rep.data||[]).forEach(function(x){ var k = x.kind+':'+x.target_id; counts[k] = (counts[k]||0)+1; });
  var reported = Object.keys(counts);
  var h = '<div class="foro-adm-h">⚑ Reportes pendientes ('+reported.length+')</div>'+
    (reported.length ? reported.map(function(k){ var p = k.split(':'); return row(p[0], byKey[k], true, counts[k]); }).join('') : '<p class="foro-hint">No hay reportes pendientes.</p>');
  var latest = (th.data||[]).map(function(x){ return ['thread', x]; }).concat((rp.data||[]).map(function(x){ return ['reply', x]; }))
    .sort(function(a,b){ return new Date(b[1].created_at) - new Date(a[1].created_at); }).slice(0, 30);
  h += '<div class="foro-adm-h">🕐 Lo último publicado</div>'+
    (latest.length ? latest.map(function(p){ return row(p[0], p[1], false, 0); }).join('') : '<p class="foro-hint">Todavía no hay mensajes.</p>');
  list.innerHTML = h;
  list.onclick = async function(e){
    var b = e.target.closest('[data-adm]'); if(!b) return;
    var k = b.dataset.k, id = b.dataset.id, tbl = k==='thread'?'forum_threads':'forum_replies', r;
    if(b.dataset.adm==='open'){ goView('comunidad'); openThread(b.dataset.t, true); return; }
    if(b.dataset.adm==='hide') r = await db.from(tbl).update({hidden: b.dataset.h!=='1'}).eq('id', id);
    if(b.dataset.adm==='del'){ if(!confirm('¿Eliminar definitivamente?')) return; r = await db.from(tbl).delete().eq('id', id); }
    if(b.dataset.adm==='ok') r = await db.from('forum_reports').update({resolved:true}).eq('kind', k).eq('target_id', id);
    if(b.dataset.adm==='hide' || b.dataset.adm==='del') await db.from('forum_reports').update({resolved:true}).eq('kind', k).eq('target_id', id);
    if(r && r.error){ toast('Error: '+r.error.message,'error'); return; }
    window.foroRenderAdmin();
  };
};

/* ── arranque ───────────────────────────────────────────────── */
function boot(){
  if(typeof db === 'undefined') return;
  db.auth.onAuthStateChange(function(ev){
    if(ev === 'SIGNED_IN') setTimeout(afterLogin, 0);
    if(ev === 'SIGNED_OUT') setTimeout(loadMe, 0);
  });
  afterLogin();
}
if(document.readyState === 'complete') boot(); else window.addEventListener('load', boot);
})();
