/* ════════════════════════════════════════════════════════════════
   El Despacho de Overton — versión en inglés (English version)

   Este archivo solo se carga cuando el visitante elige "EN".
   Cómo funciona: la web se sigue escribiendo en español; este archivo
   busca cada texto de la interfaz y lo cambia por su traducción.
   Los textos que no están en el diccionario (artículos, glosario,
   mensajes del foro…) se quedan en español.

   Para añadir o corregir una traducción: edita el diccionario D de
   abajo ("texto en español": "texto en inglés") y sube el número
   ?v= donde se carga este archivo en index.html.
════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ── Diccionario: español exacto → inglés ───────────────────────── */
var D = {
/* Cabecera y menú */
"El Despacho de Overton — Inicio":"El Despacho de Overton — Home",
"Logo El Despacho de Overton":"El Despacho de Overton logo",
"Europa explicada. Sin filtros.":"Europe explained. No filters.",
"Navegación principal":"Main navigation",
"Inicio":"Home",
"Contenido":"Content",
"Debates":"Debates",
"Glosario":"Glossary",
"Comunidad":"Community",
"Buscar artículos…":"Search articles…",
"Modo oscuro/claro":"Dark/light mode",
"Administración":"Admin",
"Menú":"Menu",
"Abrir menú":"Open menu",
"Contenido principal":"Main content",

/* Portada */
"Emblema de El Despacho de Overton":"El Despacho de Overton emblem",
"🇪🇺 450 millones de personas. Una sola ley. ¿La entiendes?":"🇪🇺 450 million people. One law. Do you understand it?",
"Europa no es aburrida. Te la han explicado mal.":"Europe isn't boring. It's just been badly explained to you.",
"Las leyes europeas te afectan.":"European laws affect you.",
"Aquí las entenderás.":"Here you'll understand them.",
"El TJUE decide sobre tus datos, tu trabajo y tus derechos. Te explicamos cada decisión como si importara, porque importa.":"The EU Court of Justice rules on your data, your job and your rights. We explain every decision as if it mattered, because it does.",
"Empezar a leer →":"Start reading →",
"Unirme al debate":"Join the debate",
"Si has llegado hasta aquí, es porque sabes que algo no cuadra en cómo te explican Europa.":"If you've made it this far, it's because you know something doesn't add up in how Europe is explained to you.",
"Parlamento Europeo · Estrasburgo":"European Parliament · Strasbourg",
"Comisión Europea · Berlaymont":"European Commission · Berlaymont",
"Tribunal de Justicia · Luxemburgo":"Court of Justice · Luxembourg",
"Consejo Europeo · Bruselas":"European Council · Brussels",
"27 Estados Miembros · Unión Europea":"27 Member States · European Union",
"Sentencias analizadas":"Judgments analysed",
"Directivas explicadas":"Directives explained",
"Artículos de opinión":"Opinion articles",
"Áreas del derecho UE":"Areas of EU law",
"Preguntas del debate":"Debate questions",

/* Mapa */
"🗺️ La UE":"🗺️ The EU",
"en el mapa":"on the map",
"27 países. Las mismas reglas. Haz clic para explorar.":"27 countries. The same rules. Click to explore.",
"UNIÓN EUROPEA":"EUROPEAN UNION",
"Haz clic en un país del mapa para ver qué órganos de la UE tiene y sus estadísticas de transposición de directivas.":"Click a country on the map to see which EU bodies it hosts and its directive transposition figures.",
"Estado miembro UE":"EU member state",
"País no miembro":"Non-member country",
"País seleccionado":"Selected country",
"Directivas transpuestas":"Directives transposed",
"Déficit transposición":"Transposition deficit",
"✅ En regla (≤1%)":"✅ On target (≤1%)",
"🟡 En el límite (≈1%)":"🟡 Borderline (≈1%)",
"⚠️ Por encima del objetivo (>1%)":"⚠️ Above target (>1%)",
"Órganos e instituciones de la UE":"EU bodies and institutions",
"Fuentes:":"Sources:",
"Single Market Scoreboard 2024 (Comisión Europea) · european-union.europa.eu":"Single Market Scoreboard 2024 (European Commission) · european-union.europa.eu",

/* Listado de artículos */
"Últimas":"Latest",
"publicaciones":"posts",
"Sentencias":"Judgments",
"del TJUE":"of the CJEU",
"Directivas":"Directives",
"de la UE":"of the EU",
"Medio Ambiente":"Environment",
"· Normativa UE":"· EU rules",
"Artículos":"Articles",
"de opinión":"opinion pieces",
"Otros":"Other",
"documentos":"documents",
"Aquí no hace falta que seas experto. Hace falta que tengas criterio.":"You don't need to be an expert here. You need good judgement.",
"Todas las categorías":"All categories",
"No se encontraron artículos.":"No articles found.",
"Prueba con otro filtro o búsqueda.":"Try another filter or search.",
"No se pudieron cargar los artículos.":"The articles could not be loaded.",
"⚖️ Sentencia":"⚖️ Judgment",
"📜 Directiva":"📜 Directive",
"🌿 Medio Ambiente":"🌿 Environment",
"✍️ Opinión":"✍️ Opinion",
"📁 Otro":"📁 Other",
"Programado":"Scheduled",
"Borrador":"Draft",
"¿Cómo te afecta?":"How does it affect you?",
"Leer análisis →":"Read analysis →",
"Leer artículo →":"Read article →",

/* Categorías de artículos */
"Privacidad":"Privacy",
"Economía":"Economy",
"Laboral":"Employment",
"Consumo":"Consumer",
"Digital":"Digital",
"Derechos Fundamentales":"Fundamental Rights",
"Sanidad":"Health",
"Migración":"Migration",
"Otro":"Other",

/* Ventana del artículo */
"Sentencia TJUE":"CJEU Judgment",
"Directiva UE":"EU Directive",
"Medio Ambiente UE":"EU Environment",
"Artículo de Opinión":"Opinion Article",
"Documento":"Document",
"🧠 Interesante":"🧠 Interesting",
"⚖️ Importante":"⚖️ Important",
"💬 Discutible":"💬 Debatable",
"Compartir":"Share",
"Resumen ejecutivo":"Executive summary",
"Explicación detallada":"Detailed explanation",
"Impacto en tu día a día":"Impact on your daily life",
"Artículo completo":"Full article",
"Comentarios":"Comments",
"Tu nombre…":"Your name…",
"Deja tu opinión sobre este artículo…":"Share your view on this article…",
"Comentar":"Comment",
"Cargando comentarios…":"Loading comments…",
"Sé el primero en comentar.":"Be the first to comment.",
"Eliminar":"Delete",
"Comentario publicado ✓":"Comment posted ✓",
"Escribe tu nombre":"Enter your name",
"El comentario es demasiado corto":"The comment is too short",
"Error: no hay artículo activo":"Error: no article open",
"¿Eliminar este comentario?":"Delete this comment?",
"Cerrar":"Close",

/* Sobre nosotros */
"Foto":"Photo",
"Sobre el proyecto":"About the project",
"Este blog nació de una pregunta sencilla: ¿por qué algo tan determinante como el derecho europeo resulta tan opaco para la mayoría de ciudadanos?":"This blog was born from a simple question: why is something as decisive as European law so opaque to most citizens?",
"En":"At",
"analizamos sentencias del Tribunal de Justicia de la Unión Europea y directivas comunitarias de forma rigurosa, objetiva y —sobre todo— comprensible. Sin jerga innecesaria, sin sesgos, con ejemplos reales.":"we analyse judgments of the Court of Justice of the European Union and EU directives in a rigorous, objective and, above all, understandable way. No unnecessary jargon, no bias, with real examples.",
"La":"The",
"Ventana de Overton":"Overton Window",
"describe el rango de ideas que una sociedad considera aceptables en un momento dado. Queremos ampliar esa ventana: que cada ciudadano conozca las normas que le afectan directamente.":"describes the range of ideas a society considers acceptable at a given time. We want to widen that window, so that every citizen knows the rules that affect them directly.",
"Derecho UE":"EU law",
"TJUE":"CJEU",
"Directivas europeas":"European directives",
"Divulgación jurídica":"Legal outreach",
"Ciudadanía activa":"Active citizenship",
"Nuestro":"Our",
"equipo":"team",
"El equipo aún no ha sido configurado.":"The team has not been set up yet.",
"Accede al panel de administración para añadir miembros.":"Go to the admin panel to add members.",

/* Glosario */
"📚 Glosario":"📚 Glossary",
"de Derecho UE":"of EU law",
"Las palabras que los políticos usan para que no les entiendas. Aquí las explicamos para que sí lo hagas.":"The words politicians use so you won't understand them. Here we explain them so you will.",
"Términos clave del Derecho UE. Fuentes: EUR-Lex, TJUE, Comisión Europea.":"Key terms of EU law. Sources: EUR-Lex, CJEU, European Commission.",
"🔍 Buscar término…":"🔍 Search term…",
"Cargando glosario…":"Loading glossary…",
"Todas":"All",
"En palabras simples":"In plain words",
"Ejemplo práctico":"Practical example",
"Por qué importa":"Why it matters",
"Fuente:":"Source:",

/* Comunidad / foro */
"— Foro de debate sobre derecho europeo":"— Discussion forum on European law",
"Únete al debate. Tu análisis puede cambiar cómo otros entienden Europa.":"Join the debate. Your analysis can change how others understand Europe.",
"No hace falta ser abogado. Hace falta pensar.":"You don't need to be a lawyer. You need to think.",
"Aquí no vienes a memorizar. Vienes a entender y a opinar.":"You don't come here to memorise. You come to understand and to have your say.",
"🗳️ Debate del día":"🗳️ Debate of the day",
"🗳️ Debate de la semana":"🗳️ Debate of the week",
"Cargando debate…":"Loading debate…",
"✓ Sí":"✓ Yes",
"✗ No":"✗ No",
"Votaste: Sí ✓":"You voted: Yes ✓",
"Votaste: No ✓":"You voted: No ✓",
"Ya has votado en este debate":"You have already voted in this debate",
"¡Voto registrado! 🗳️":"Vote recorded! 🗳️",
"Error al registrar voto":"Could not record your vote",
"💬 Foro de la comunidad":"💬 Community forum",
"miembros ya activos":"members already active",
"Fundador ⭐":"Founder ⭐",
"⭐ Fundador":"⭐ Founder",
"Tu nombre o apodo…":"Your name or nickname…",
"¿Qué piensas? Aquí no hay respuestas incorrectas, solo argumentos. Escribe el tuyo.":"What do you think? There are no wrong answers here, only arguments. Write yours.",
"🔒 Sin registro ·":"🔒 No sign-up ·",
"únete como miembro ⭐":"join as a member ⭐",
"cambiar alias":"change alias",
"Publicar →":"Post →",
"🕐 Reciente":"🕐 Recent",
"🔥 Top":"🔥 Top",
"🗑 Limpiar foro":"🗑 Clear forum",
"Cargando…":"Loading…",
"Ver más mensajes":"Show more messages",
"Este canal está esperando tu primera opinión":"This channel is waiting for your first opinion",
"Escribe algo arriba — sin registro, solo tu nombre":"Write something above — no sign-up, just your name",
"No se pudo conectar con el servidor":"Could not connect to the server",
"Comprueba tu conexión y":"Check your connection and",
"vuelve a intentarlo":"try again",
"Enviando…":"Sending…",
"Error al guardar":"Could not save",
"Anónimo":"Anonymous",
"💬 Responder":"💬 Reply",
"Responder →":"Reply →",
"🔥 Mensaje más votado":"🔥 Most upvoted message",
"🔥 Sé el primero en destacar":"🔥 Be the first to stand out",
"Publica y recibe upvotes para aparecer aquí":"Post and get upvotes to appear here",
"🏆 Top participantes":"🏆 Top contributors",
"ahora":"now",
"💬 Nuevo mensaje en el foro":"💬 New message in the forum",
"Escribe tu nombre o apodo":"Enter your name or nickname",
"El mensaje es demasiado corto (mín. 3 caracteres)":"The message is too short (min. 3 characters)",
"Error al guardar en servidor":"Could not save on the server",
"¡Publicado! ✓":"Posted! ✓",
"La respuesta es demasiado corta":"The reply is too short",
"Respuesta publicada":"Reply posted",
"Error al quitar voto":"Could not remove your vote",
"Error al votar":"Could not vote",
"¿Eliminar este mensaje?":"Delete this message?",
"Error al eliminar en servidor":"Could not delete on the server",
"Mensaje eliminado":"Message deleted",
"Error cargando más mensajes":"Could not load more messages",
"Recibe los análisis en tu correo":"Get our analysis in your inbox",
"Sin spam · Solo derecho europeo":"No spam · Only European law",
"tu@email.com":"you@email.com",
"Suscribirme":"Subscribe",
"✍️ Colabora con nosotros":"✍️ Work with us",
"¿Quieres publicar con nosotros?":"Want to publish with us?",
"Si eres jurista, académico o simplemente apasionado del derecho europeo, escríbenos. Publicamos análisis rigurosos y accesibles.":"If you are a lawyer, an academic or simply passionate about European law, write to us. We publish rigorous and accessible analysis.",
"Enviar propuesta":"Send a proposal",

/* Alias de comunidad */
"Elige tu alias de comunidad":"Choose your community alias",
"Una vez guardado, queda en este dispositivo. Solo necesitas hacerlo una vez.":"Once saved, it stays on this device. You only need to do this once.",
"Tu alias (ej: JuristaNovato)":"Your alias (e.g. RookieLawyer)",
"Email para notificaciones":"Email for notifications",
"¿Cuál es tu perfil? (opcional)":"What's your background? (optional)",
"Estudiante de Derecho":"Law student",
"Abogado/a":"Lawyer",
"Académico / Investigador":"Academic / Researcher",
"Ciudadano interesado":"Interested citizen",
"🎁 Los primeros":"🎁 The first",
"miembros reciben la insignia":"members get the",
"— visible en todos tus mensajes.":"badge — shown on all your messages.",
"Quedan":"Only",
"plazas disponibles.":"spots left.",
"Ahora no":"Not now",
"Unirme y publicar →":"Join and post →",
"Elige un alias para la comunidad":"Choose a community alias",
"Introduce un email válido":"Enter a valid email",
"¡Bienvenido/a, Miembro Fundador! ⭐ Ya puedes publicar.":"Welcome, Founding Member! ⭐ You can post now.",
"¡Alias guardado! Escribe tu primer mensaje 🎉":"Alias saved! Write your first message 🎉",
"Alias borrado. Elige uno nuevo al publicar.":"Alias cleared. Choose a new one when you post.",

/* Quiero publicar / newsletter */
"¿Quieres":"Want to",
"publicar":"publish",
"con nosotros?":"with us?",
"Si tienes algo que decir sobre derecho europeo, este es tu espacio. Estudiantes, juristas, investigadores — cualquier voz rigurosa es bienvenida.":"If you have something to say about European law, this is your space. Students, lawyers, researchers — every rigorous voice is welcome.",
"Quiero publicar →":"I want to publish →",
"Email no válido":"Invalid email",
"¡Recibido! Te contactaremos pronto 🎉":"Received! We'll be in touch soon 🎉",
"Error inesperado. Inténtalo de nuevo.":"Unexpected error. Please try again.",
"📬 Newsletter gratuita":"📬 Free newsletter",
"El análisis que":"The analysis that",
"importa":"matters",
"en tu bandeja de entrada":"in your inbox",
"Cada semana, las sentencias y directivas más relevantes de la UE explicadas en menos de 5 minutos. Sin ruido, sin tecnicismos innecesarios.":"Every week, the most relevant EU judgments and directives explained in under 5 minutes. No noise, no unnecessary jargon.",
"Análisis de las últimas sentencias del TJUE":"Analysis of the latest CJEU judgments",
"Directivas que afectan a tu vida cotidiana":"Directives that affect your everyday life",
"Sin spam. Baja cuando quieras.":"No spam. Unsubscribe any time.",
"Suscribirme gratis":"Subscribe for free",
"Sin spam · Baja en un clic · Gratis para siempre":"No spam · One-click unsubscribe · Free forever",
"Ya estás suscrito 👍":"You're already subscribed 👍",
"Este email ya está suscrito 👍":"This email is already subscribed 👍",
"Error al suscribir. Inténtalo de nuevo.":"Could not subscribe. Please try again.",
"¡Suscripción confirmada! Nos vemos en tu bandeja 🎉":"Subscription confirmed! See you in your inbox 🎉",

/* Pregunta del día */
"Pregunta del día":"Question of the day",
"Siguiente pregunta en":"Next question in",
"Cargando pregunta…":"Loading question…",
"↺ Cambiar voto":"↺ Change vote",
"⚖ Análisis jurídico":"⚖ Legal analysis",
"Preguntas anteriores":"Previous questions",
"Cargando historial…":"Loading history…",
"No hay preguntas anteriores disponibles aún.":"No previous questions available yet.",
"✓ Estás con la mayoría":"✓ You're with the majority",
"← Estás en minoría":"← You're in the minority",
"Una":"A",
"Con una":"With a",
", los participantes":", participants",
"de los participantes":"of participants",
"En un resultado muy ajustado, el":"In a very close result,",
"se inclina por la opción":"lean towards the option",
"de los participantes se inclina por la opción":"of participants lean towards the option",
", los participantes se inclina por la opción":", participants lean towards the option",

/* Pie de página */
"📬 Una vez a la semana. Sin rollo.":"📬 Once a week. No waffle.",
"Esto no es otro newsletter. Es el resumen que nadie más hace.":"This isn't just another newsletter. It's the summary nobody else writes.",
"Esto no es otro blog jurídico. Aquí vienes a entender lo que te afecta de verdad.":"This isn't just another law blog. You come here to understand what really affects you.",
"☕ Apóyanos":"☕ Support us",
"Términos":"Terms",
"Lectores":"Readers",
"Secciones":"Sections",
"Sentencias TJUE":"CJEU judgments",
"Directivas UE":"EU directives",
"Opinión":"Opinion",
"§ Glosario jurídico":"§ Legal glossary",
"› Comunidad":"› Community",
"Proyecto":"Project",
"Sobre nosotros":"About us",
"Newsletter":"Newsletter",
"¿Quieres publicar?":"Want to publish?",
"Colaboradores":"Partners",
"Sé el primero":"Be the first",
"© 2026 El Despacho de Overton. Contenido divulgativo, no asesoramiento jurídico.":"© 2026 El Despacho de Overton. Educational content, not legal advice.",
"Privacidad":"Privacy",
"Aviso legal":"Legal notice",
"Cookies":"Cookies",
"Configurar cookies":"Cookie settings",

/* Cookies */
"Antes de entrar, una decisión que es tuya":"Before you come in, a decision that's yours",
"Usamos cookies propias para que el sitio funcione y, si nos lo permites, cookies analíticas para entender cómo se lee derecho europeo aquí. Nunca cookies de marketing engañoso. Puedes cambiar de idea en cualquier momento desde el pie de página. Más información en nuestra":"We use our own cookies to make the site work and, if you allow us, analytics cookies to understand how European law is read here. Never deceptive marketing cookies. You can change your mind at any time from the footer. More information in our",
"política de cookies":"cookie policy",
"y":"and",
"política de privacidad":"privacy policy",
"Rechazar todas":"Reject all",
"Configurar":"Settings",
"Aceptar todas":"Accept all",
"Configura tus cookies":"Set your cookies",
"Activa solo las categorías que quieras permitir. Las técnicas no pueden desactivarse porque son imprescindibles para que el sitio funcione.":"Turn on only the categories you want to allow. Technical cookies can't be turned off because the site needs them to work.",
"Técnicas (necesarias)":"Technical (necessary)",
"Siempre activas":"Always on",
"Permiten la sesión iniciada, prevención de fraude y memoria del propio consentimiento. Sin ellas el sitio no funciona. Base jurídica: interés legítimo.":"They keep you signed in, prevent fraud and remember your consent. Without them the site doesn't work. Legal basis: legitimate interest.",
"Preferencias":"Preferences",
"Recuerdan tus elecciones (modo oscuro, idioma, tipografía Cormorant Garamond y Outfit servidas desde Google Fonts). Sin tu consentimiento se usan tipografías del sistema.":"They remember your choices (dark mode, language, the Cormorant Garamond and Outfit fonts served by Google Fonts). Without your consent, system fonts are used.",
"Analíticas":"Analytics",
"Medición agregada de visitas y comportamiento para entender qué contenido funciona. Datos pseudonimizados. Solo se cargan tras tu consentimiento.":"Aggregated measurement of visits and behaviour to understand which content works. Pseudonymised data. Only loaded after your consent.",
"Marketing y redes sociales":"Marketing and social media",
"Permiten incrustar tweets, vídeos y medir efectividad. Implican transferencia internacional de datos. Solo se cargan tras tu consentimiento explícito.":"They allow embedding tweets and videos and measuring effectiveness. They involve international data transfers. Only loaded after your explicit consent.",
"Guardar selección":"Save selection",
"Página no encontrada.":"Page not found.",
"No se pudo cargar el contenido legal.":"The legal content could not be loaded.",
"Ábrelo directamente":"Open it directly",

/* Acceso de administración (solo la ventana de entrada) */
"Acceso al panel de administración":"Admin panel sign-in",
"Contraseña":"Password",
"Introduce tu contraseña…":"Enter your password…",
"Contraseña incorrecta. Inténtalo de nuevo.":"Wrong password. Please try again.",
"Introduce tu email y contraseña.":"Enter your email and password.",
"Email o contraseña incorrectos.":"Wrong email or password.",
"Cancelar":"Cancel",
"Entrar":"Sign in",

/* Errores generales */
"Error de conexión":"Connection error",
"No se pudo cargar un recurso necesario.":"A required resource could not be loaded.",
"Comprueba tu conexión a internet y recarga la página.":"Check your internet connection and reload the page.",
"↺ Recargar":"↺ Reload",
"⏳ Subiendo imagen…":"⏳ Uploading image…",

/* Lex, la rana */
"¡Hola! Soy Lex 🐸":"Hi! I'm Lex 🐸",
"¡Hola! Soy Lex, la rana jurista del Despacho 🐸⚖️":"Hi! I'm Lex, El Despacho's lawyer frog 🐸⚖️",
"¡Pss! ¿Sabes algo sobre la UE? ¡Pregúntame! 🤓":"Psst! Know anything about the EU? Ask me! 🤓",
"La UE nació del Tratado de Roma de 1957. ¡Ya llovió! 🏛️":"The EU was born from the 1957 Treaty of Rome. That was a while ago! 🏛️",
"El Tratado de Maastricht (1992) creó la ciudadanía europea 🇪🇺":"The Maastricht Treaty (1992) created EU citizenship 🇪🇺",
"La UE comenzó como una comunidad del carbón y el acero (CECA, 1951) ⚙️":"The EU began as a coal and steel community (ECSC, 1951) ⚙️",
"El Tratado de Lisboa (2007) dio a la UE su estructura actual 📜":"The Treaty of Lisbon (2007) gave the EU its current structure 📜",
"La Carta de los Derechos Fundamentales es legalmente vinculante desde 2009 📖":"The Charter of Fundamental Rights has been legally binding since 2009 📖",
"Los fundadores de la UE fueron Schuman, Adenauer y De Gasperi 🤝":"The EU's founders were Schuman, Adenauer and De Gasperi 🤝",
"27 países, un solo mercado. Fascinante, ¿no? ✨":"27 countries, one single market. Fascinating, right? ✨",
"El TJUE dicta más de 600 sentencias al año. ¡Yo las leo todas! 📜":"The CJEU delivers more than 600 judgments a year. I read them all! 📜",
"El Parlamento Europeo tiene 720 diputados elegidos por los ciudadanos 🗳️":"The European Parliament has 720 MEPs elected by citizens 🗳️",
"La Comisión Europea tiene un comisario por cada Estado miembro 🏢":"The European Commission has one commissioner per member state 🏢",
"El Consejo de la UE reúne a los ministros de los 27 estados 🤝":"The Council of the EU brings together ministers from the 27 states 🤝",
"El Tribunal de Cuentas audita el presupuesto de la UE cada año 🔍":"The Court of Auditors audits the EU budget every year 🔍",
"El BCE gestiona la política monetaria del euro desde 1998 💶":"The ECB has run the euro's monetary policy since 1998 💶",
"Hay 3 sedes del Parlamento: Estrasburgo, Bruselas y Luxemburgo 🏛️":"Parliament has 3 seats: Strasbourg, Brussels and Luxembourg 🏛️",
"Los valores fundacionales de la UE son la dignidad, la libertad y la igualdad 🌟":"The EU's founding values are dignity, freedom and equality 🌟",
"La UE garantiza la libre circulación de personas, bienes, servicios y capital 🔄":"The EU guarantees the free movement of people, goods, services and capital 🔄",
"El principio de subsidiariedad significa que la UE solo actúa cuando es necesario 📏":"The principle of subsidiarity means the EU only acts when necessary 📏",
"La UE tiene 24 idiomas oficiales. ¡Auch, los traductores! 🗣️":"The EU has 24 official languages. Ouch, those poor translators! 🗣️",
"El Estado de Derecho es un valor irrenunciable de la UE ⚖️":"The rule of law is a non-negotiable EU value ⚖️",
"¿Sabías que el himno de la UE es la Oda a la Alegría de Beethoven? 🎵":"Did you know the EU anthem is Beethoven's Ode to Joy? 🎵",
"El día de Europa se celebra el 9 de mayo cada año 🎉":"Europe Day is celebrated on 9 May every year 🎉",
"El euro lo usan 20 de los 27 países de la UE 💰":"The euro is used by 20 of the 27 EU countries 💰",
"La UE es el mayor donante de ayuda humanitaria del mundo ❤️":"The EU is the world's largest humanitarian aid donor ❤️",
"El mercado interior de la UE es el más grande del mundo 🌍":"The EU single market is the largest in the world 🌍",
"¡El derecho europeo nos afecta a todos! 🇪🇺":"European law affects us all! 🇪🇺",
"Las directivas no muerden, te lo prometo 😄":"Directives don't bite, I promise 😄",
"Croac... digo, ¡buenos días! ☀️":"Ribbit... I mean, good morning! ☀️",
"¿Leíste el último análisis del Despacho? ¡Vale la pena! 💙":"Have you read El Despacho's latest analysis? It's worth it! 💙",
"El Espacio Schengen permite viajar sin pasaporte en 27 países 🛫":"The Schengen Area lets you travel passport-free across 27 countries 🛫",
"La UE financia proyectos de investigación con Horizon Europe 🔬":"The EU funds research projects through Horizon Europe 🔬",
"Erasmus+ ha beneficiado a más de 10 millones de estudiantes 🎓":"Erasmus+ has benefited more than 10 million students 🎓",
"El RGPD europeo es el estándar global de protección de datos 🔒":"The EU's GDPR is the global standard for data protection 🔒",
"¡Gracias por leer El Despacho de Overton! 💙":"Thanks for reading El Despacho de Overton! 💙",
"¡Pss! Haz clic en mí para saber más sobre la UE 👆":"Psst! Click me to learn more about the EU 👆",

/* Frases que rotan en portada y pie */
"El Derecho Europeo como espacio de debate":"European law as a space for debate",
"Interpretar Europa es construirla":"To interpret Europe is to build it",
"La integración europea empieza en las ideas":"European integration starts with ideas",
"El Derecho vive en su interpretación":"Law lives in its interpretation",
"La Unión Europea también se piensa":"The European Union is also something you think about",
"Del aula al pensamiento jurídico":"From the classroom to legal thinking",
"Reflexión crítica sobre el Derecho de la Unión":"Critical reflection on EU law",
"Jóvenes juristas, nuevas perspectivas":"Young lawyers, new perspectives",
"Construyendo Europa desde el análisis":"Building Europe through analysis",
"El Derecho como conversación":"Law as a conversation",
"Publica tu idea":"Publish your idea",
"Escribe. Debate. Impacta.":"Write. Debate. Make an impact.",
"Haz que tu opinión cuente":"Make your opinion count",
"Únete al debate europeo":"Join the European debate",
"Da el paso: publica":"Take the step: publish",
"Convierte tu argumento en influencia":"Turn your argument into influence",
"Tu artículo empieza aquí":"Your article starts here",
"Europa necesita tu voz":"Europe needs your voice",
"No solo estudies Derecho, créalo":"Don't just study law, shape it",
"Sube tu punto de vista":"Share your point of view",

/* Títulos de la pestaña del navegador */
"El Despacho de Overton — Derecho Europeo, Sentencias TJUE y Debates":"El Despacho de Overton — European Law, CJEU Judgments and Debates",
"El Despacho de Overton — Las leyes europeas te afectan. Aquí las entenderás.":"El Despacho de Overton — European laws affect you. Here you'll understand them.",
"Sentencias del TJUE — El Despacho de Overton":"CJEU Judgments — El Despacho de Overton",
"Directivas de la Unión Europea — El Despacho de Overton":"European Union Directives — El Despacho de Overton",
"Derecho Europeo de Medio Ambiente — El Despacho de Overton":"EU Environmental Law — El Despacho de Overton",
"Opinión sobre Derecho Europeo — El Despacho de Overton":"Opinion on European Law — El Despacho de Overton",
"Glosario de Derecho Europeo — El Despacho de Overton":"European Law Glossary — El Despacho de Overton",
"Comunidad — Debate sobre Derecho Europeo | El Despacho de Overton":"Community — European Law Debate | El Despacho de Overton",
"Sobre El Despacho de Overton — Equipo y misión":"About El Despacho de Overton — Team and mission",
"Documentos y Análisis de Derecho Europeo — El Despacho de Overton":"European Law Documents and Analysis — El Despacho de Overton",
"Pregunta del Día — Debate Jurídico Europeo | El Despacho de Overton":"Question of the Day — European Legal Debate | El Despacho de Overton",

/* Debates de la semana (preguntas fijas) */
"¿Debe la Unión Europea tener su propio ejército permanente?":"Should the European Union have its own standing army?",
"¿Debería la UE prohibir TikTok para menores de 16 años?":"Should the EU ban TikTok for under-16s?",
"¿Debería existir un salario mínimo europeo igual en todos los estados miembros?":"Should there be a single European minimum wage across all member states?",
"¿Está haciendo suficiente la UE para combatir el cambio climático?":"Is the EU doing enough to fight climate change?",
"¿Debería la UE sancionar a países que no respetan el Estado de Derecho?":"Should the EU sanction countries that don't respect the rule of law?",
"¿Crees que Europa debería tener fronteras más abiertas para la inmigración?":"Do you think Europe should have more open borders for immigration?",
"¿Debería la UE tener el poder de recaudar impuestos directamente?":"Should the EU have the power to collect taxes directly?",
"¿Debe prohibirse la IA en las decisiones judiciales europeas?":"Should AI be banned from European court decisions?",
"¿Debería el euro ser obligatorio para todos los países de la UE?":"Should the euro be mandatory for all EU countries?",
"¿Debería la UE regular el precio de la vivienda en las grandes ciudades?":"Should the EU regulate housing prices in big cities?",
"¿Crees que el Parlamento Europeo tiene demasiado poco poder?":"Do you think the European Parliament has too little power?",
"¿Debería la UE reconocer el matrimonio igualitario en todos sus estados miembros?":"Should the EU recognise same-sex marriage in all its member states?",
"¿Debe la UE prohibir la exportación de armas a zonas en conflicto?":"Should the EU ban arms exports to conflict zones?",
"¿Crees que las redes sociales están suficientemente reguladas en Europa?":"Do you think social media is regulated enough in Europe?",
"¿Debería la UE crear una renta básica universal para sus ciudadanos?":"Should the EU create a universal basic income for its citizens?",
"¿Crees que el Brexit fue un error para el Reino Unido?":"Do you think Brexit was a mistake for the United Kingdom?",
"¿Debe la UE intervenir más en las crisis de salud pública de sus estados miembros?":"Should the EU intervene more in its member states' public health crises?",
"¿Debería la energía nuclear considerarse 'verde' en la política europea?":"Should nuclear energy be considered 'green' in European policy?",
"¿Debería la UE tener un presidente elegido directamente por los ciudadanos?":"Should the EU have a president directly elected by its citizens?",
"¿Tienen Google y Meta demasiado poder en Europa?":"Do Google and Meta have too much power in Europe?",
"¿Debería prohibirse el uso de pesticidas en la agricultura europea?":"Should pesticides be banned in European agriculture?",
"¿Protege suficientemente la UE los datos personales de sus ciudadanos?":"Does the EU protect its citizens' personal data well enough?",
"¿Debería la UE ofrecer formación universitaria gratuita a todos sus ciudadanos?":"Should the EU offer free university education to all its citizens?",
"¿Es demasiado restrictiva la política de asilo en Europa?":"Is Europe's asylum policy too restrictive?",
"¿Debe la UE regular el uso de criptomonedas y activos digitales?":"Should the EU regulate cryptocurrencies and digital assets?",
"¿Debería la UE tener competencias para actuar contra la corrupción interna?":"Should the EU have powers to act against internal corruption?",
"¿Está suficientemente protegida la libertad de prensa en la Unión Europea?":"Is press freedom sufficiently protected in the European Union?",
"¿Debe la UE abandonar los combustibles fósiles antes de 2035?":"Should the EU phase out fossil fuels before 2035?",
"¿Debería Europa tener una política exterior más unida e independiente de EE.UU.?":"Should Europe have a more united foreign policy, independent of the US?",
"¿Debería la UE regular los algoritmos de recomendación de YouTube e Instagram?":"Should the EU regulate YouTube's and Instagram's recommendation algorithms?",
"¿Crees que la UE tarda demasiado en tomar decisiones importantes?":"Do you think the EU takes too long to make important decisions?",
"¿Debería reducirse la semana laboral a 4 días en toda la UE?":"Should the working week be cut to 4 days across the EU?",
"¿Prioriza la UE la economía por encima de los derechos fundamentales?":"Does the EU put the economy ahead of fundamental rights?",
"¿Debería la UE imponer cuotas de representación femenina en grandes empresas?":"Should the EU impose quotas for women on the boards of large companies?",
"¿Tiene el TJUE suficiente autoridad para hacer cumplir sus sentencias?":"Does the CJEU have enough authority to enforce its judgments?",
"¿Debería la UE crear su propia plataforma de redes sociales sin ánimo de lucro?":"Should the EU create its own non-profit social media platform?",
"¿Entienden los ciudadanos europeos cómo funciona realmente la UE?":"Do European citizens understand how the EU really works?",
"¿Debe la UE establecer límites máximos a los salarios de directivos?":"Should the EU cap executive pay?",
"¿Debería la UE adherirse de forma más vinculante al Convenio Europeo de DDHH?":"Should the EU be more firmly bound by the European Convention on Human Rights?",
"¿Debería prohibirse los vuelos cortos cuando exista alternativa en tren?":"Should short flights be banned where a train alternative exists?",
"¿Respeta el pacto migratorio europeo los derechos humanos?":"Does the European migration pact respect human rights?",
"¿Debería la UE tener una constitución que sustituya a los tratados actuales?":"Should the EU have a constitution to replace the current treaties?",
"¿Actúa la UE con suficiente rapidez ante las crisis internacionales?":"Does the EU act quickly enough in international crises?",
"¿Debería prohibirse la publicidad dirigida a menores en plataformas digitales?":"Should advertising aimed at minors be banned on digital platforms?",
"¿Debe la UE garantizar el acceso a internet como derecho fundamental?":"Should the EU guarantee internet access as a fundamental right?",
"¿Debería la UE crear un tribunal específico para delitos medioambientales?":"Should the EU create a dedicated court for environmental crimes?",
"¿Tiene el lobby corporativo demasiada influencia en la legislación europea?":"Does corporate lobbying have too much influence on European legislation?",
"¿Debería la UE negociar en exclusiva todos los tratados comerciales internacionales?":"Should the EU have exclusive power to negotiate all international trade agreements?",
"¿Es efectiva la política de competencia de la UE frente a los monopolios digitales?":"Is EU competition policy effective against digital monopolies?",
"¿Debería la UE exigir etiquetado obligatorio de huella de carbono en todos los productos?":"Should the EU require carbon footprint labelling on all products?",
"¿Debería la UE prohibir los acuerdos de no competencia para trabajadores con salarios bajos?":"Should the EU ban non-compete agreements for low-wage workers?",
"¿Tiene sentido que la UE subvencione a empresas que deslocalizan empleos fuera de Europa?":"Does it make sense for the EU to subsidise companies that move jobs outside Europe?",
"¿Debería la IA estar obligada a revelar que es una IA en cada interacción con humanos?":"Should AI be required to disclose that it is an AI in every interaction with humans?",
"¿Crees que el RGPD ha mejorado realmente la privacidad de los ciudadanos europeos?":"Do you think the GDPR has really improved European citizens' privacy?",
"¿Debería la UE imponer aranceles más altos a productos fabricados con mano de obra explotada?":"Should the EU impose higher tariffs on goods made with exploited labour?",
"¿Tiene la Comisión Europea demasiado poder sobre los estados miembros?":"Does the European Commission have too much power over member states?",
"¿Debería el español tener el mismo estatus que el inglés y el francés en las instituciones de la UE?":"Should Spanish have the same status as English and French in the EU institutions?",
"¿Crees que la UE debería tener competencia exclusiva en materia de defensa?":"Do you think the EU should have exclusive competence over defence?",
"¿Debería la UE regular los precios de los medicamentos para garantizar el acceso universal?":"Should the EU regulate medicine prices to guarantee universal access?",
"¿Está la UE haciendo suficiente para proteger a los periodistas de la represión gubernamental?":"Is the EU doing enough to protect journalists from government repression?",
"¿Debería haber una lista negra europea de paraísos fiscales vinculante para los estados miembros?":"Should there be a European tax haven blacklist that is binding on member states?",
"¿Crees que el voto electrónico debería ser legal en las elecciones europeas?":"Do you think electronic voting should be allowed in European elections?",
"¿Debería la UE obligar a las plataformas digitales a pagar a los medios por usar sus contenidos?":"Should the EU make digital platforms pay news media for using their content?",
"¿Tiene la UE suficiente autonomía industrial para no depender de China ni de EE.UU.?":"Does the EU have enough industrial autonomy not to depend on China or the US?"
};

/* ── Mapa de la UE: países, capitales y organismos ─────────────── */
var COUNTRIES = {
"🇧🇪":["Bélgica","Belgium"],"🇫🇷":["Francia","France"],"🇱🇺":["Luxemburgo","Luxembourg"],
"🇩🇪":["Alemania","Germany"],"🇳🇱":["Países Bajos","Netherlands"],"🇵🇱":["Polonia","Poland"],
"🇫🇮":["Finlandia","Finland"],"🇩🇰":["Dinamarca","Denmark"],"🇭🇺":["Hungría","Hungary"],
"🇮🇹":["Italia","Italy"],"🇪🇸":["España","Spain"],"🇵🇹":["Portugal","Portugal"],
"🇬🇷":["Grecia","Greece"],"🇦🇹":["Austria","Austria"],"🇸🇰":["Eslovaquia","Slovakia"],
"🇸🇮":["Eslovenia","Slovenia"],"🇱🇻":["Letonia","Latvia"],"🇱🇹":["Lituania","Lithuania"],
"🇮🇪":["Irlanda","Ireland"],"🇪🇪":["Estonia","Estonia"],"🇨🇿":["República Checa","Czech Republic"],
"🇸🇪":["Suecia","Sweden"],"🇭🇷":["Croacia","Croatia"],"🇧🇬":["Bulgaria","Bulgaria"],
"🇷🇴":["Rumanía","Romania"],"🇨🇾":["Chipre","Cyprus"],"🇲🇹":["Malta","Malta"]
};
Object.keys(COUNTRIES).forEach(function(f){
  var c=COUNTRIES[f]; D[c[0]]=c[1]; D[f+' '+c[0]]=f+' '+c[1];
});
var MAP = {
"📍 Bruselas":"📍 Brussels","📍 París / Estrasburgo":"📍 Paris / Strasbourg","📍 Luxemburgo":"📍 Luxembourg",
"📍 Berlín":"📍 Berlin","📍 La Haya / Ámsterdam":"📍 The Hague / Amsterdam","📍 Varsovia":"📍 Warsaw",
"📍 Copenhague":"📍 Copenhagen","📍 Roma":"📍 Rome","📍 Lisboa":"📍 Lisbon","📍 Atenas":"📍 Athens",
"📍 Viena":"📍 Vienna","📍 Liubliana":"📍 Ljubljana","📍 Vilna":"📍 Vilnius","📍 Dublín":"📍 Dublin",
"📍 Tallin":"📍 Tallinn","📍 Praga":"📍 Prague","📍 Estocolmo":"📍 Stockholm","📍 Sofía":"📍 Sofia",
"📍 Bucarest":"📍 Bucharest","📍 La Valeta":"📍 Valletta",
"Comisión Europea":"European Commission",
"Ejecutivo de la UE (propone legislación)":"The EU's executive (proposes legislation)",
"Consejo de la Unión Europea":"Council of the European Union",
"Legislativo — representa a los gobiernos nacionales":"Legislature — represents national governments",
"Consejo Europeo":"European Council",
"Define las prioridades políticas de la UE":"Sets the EU's political priorities",
"Banco de Inversión Europeo (BEI)":"European Investment Bank (EIB)",
"(sede principal en Luxemburgo, oficina de enlace en Bruselas)":"(headquarters in Luxembourg, liaison office in Brussels)",
"Agencia Europea de Defensa (EDA)":"European Defence Agency (EDA)",
"Apoya el desarrollo de capacidades de defensa":"Supports the development of defence capabilities",
"Junta Única de Resolución (SRB)":"Single Resolution Board (SRB)",
"Supervisa la resolución bancaria en la eurozona":"Oversees bank resolution in the euro area",
"Parlamento Europeo (Pleno)":"European Parliament (Plenary)",
"Sede oficial de las sesiones plenarias — Estrasburgo":"Official seat of plenary sessions — Strasbourg",
"Autoridad Bancaria Europea (EBA)":"European Banking Authority (EBA)",
"(trasladada a París desde Londres en 2019)":"(moved to Paris from London in 2019)",
"ESMA — Autoridad Europea de Valores y Mercados":"ESMA — European Securities and Markets Authority",
"Regula los mercados financieros de la UE — París":"Regulates EU financial markets — Paris",
"Agencia Ferroviaria de la UE (ERA)":"EU Agency for Railways (ERA)",
"Seguridad y interoperabilidad ferroviaria — Valenciennes":"Rail safety and interoperability — Valenciennes",
"Tribunal de Justicia de la UE (TJUE)":"Court of Justice of the EU (CJEU)",
"Máximo órgano judicial de la UE":"The EU's highest judicial body",
"Tribunal de Cuentas Europeo":"European Court of Auditors",
"Auditoría independiente del presupuesto de la UE":"Independent audit of the EU budget",
"Banco Europeo de Inversiones (BEI)":"European Investment Bank (EIB)",
"Financiación de proyectos de desarrollo en la UE":"Funds development projects in the EU",
"Oficina Estadística de la Unión Europea":"Statistical Office of the European Union",
"Fondo Europeo de Inversiones (FEI)":"European Investment Fund (EIF)",
"Financia pymes y start-ups en Europa":"Funds SMEs and start-ups in Europe",
"Banco Central Europeo (BCE)":"European Central Bank (ECB)",
"Política monetaria del euro — Fráncfort":"Monetary policy for the euro — Frankfurt",
"EIOPA — Autoridad Europea de Seguros y Pensiones":"EIOPA — European Insurance and Occupational Pensions Authority",
"Supervisión de seguros — Fráncfort":"Insurance supervision — Frankfurt",
"ESRB — Junta Europea de Riesgo Sistémico":"ESRB — European Systemic Risk Board",
"Supervisión macroprudencial — Fráncfort":"Macroprudential oversight — Frankfurt",
"EASA — Agencia de Seguridad Aérea":"EASA — Aviation Safety Agency",
"Seguridad de la aviación civil — Colonia":"Civil aviation safety — Cologne",
"Agencia Europea del Medicamento (EMA)":"European Medicines Agency (EMA)",
"Autorización y supervisión de medicamentos — Ámsterdam":"Authorises and monitors medicines — Amsterdam",
"Cooperación policial europea — La Haya":"European police cooperation — The Hague",
"Cooperación judicial penal — La Haya":"Criminal justice cooperation — The Hague",
"Frontex — Agencia Europea de Fronteras y Costas":"Frontex — European Border and Coast Guard Agency",
"Gestión integrada de fronteras exteriores — Varsovia":"Integrated management of external borders — Warsaw",
"GSA/EUSPA — Agencia de la UE para el Programa Espacial":"GSA/EUSPA — EU Agency for the Space Programme",
"Gestiona los programas Galileo y Copernicus — Praga (sede principal en CZ)":"Runs the Galileo and Copernicus programmes — Prague (headquarters in CZ)",
"ECHA — Agencia Europea de Sustancias Químicas":"ECHA — European Chemicals Agency",
"Gestiona el registro y evaluación de sustancias químicas — Helsinki":"Manages the registration and evaluation of chemicals — Helsinki",
"AEMA — Agencia Europea de Medio Ambiente":"EEA — European Environment Agency",
"Información medioambiental para políticas europeas — Copenhague":"Environmental information for European policy — Copenhagen",
"CEPOL — Agencia de la UE para la Formación Policial":"CEPOL — EU Agency for Law Enforcement Training",
"Formación de agentes de policía — Budapest":"Training for police officers — Budapest",
"EIT — Instituto Europeo de Innovación y Tecnología":"EIT — European Institute of Innovation and Technology",
"Impulsa la innovación y el emprendimiento — Budapest":"Drives innovation and entrepreneurship — Budapest",
"EFSA — Autoridad Europea de Seguridad Alimentaria":"EFSA — European Food Safety Authority",
"Evaluación de riesgos alimentarios — Parma":"Food risk assessment — Parma",
"ETF — Fundación Europea de Formación":"ETF — European Training Foundation",
"Apoya la reforma de la formación profesional — Turín":"Supports vocational training reform — Turin",
"EUIPO — Oficina de Propiedad Intelectual de la UE":"EUIPO — EU Intellectual Property Office",
"Registra marcas y diseños comunitarios — Alicante":"Registers EU trade marks and designs — Alicante",
"EU-OSHA — Agencia Europea para la Seguridad en el Trabajo":"EU-OSHA — European Agency for Safety and Health at Work",
"Promueve entornos laborales sanos — Bilbao":"Promotes healthy workplaces — Bilbao",
"EFCA — Agencia Europea de Control de Pesca":"EFCA — European Fisheries Control Agency",
"Coordina el control de la pesca — Vigo":"Coordinates fisheries control — Vigo",
"EMSA — Agencia Europea de Seguridad Marítima":"EMSA — European Maritime Safety Agency",
"Seguridad marítima y prevención de contaminación — Lisboa":"Maritime safety and pollution prevention — Lisbon",
"ENISA — Agencia de Ciberseguridad de la UE":"ENISA — EU Agency for Cybersecurity",
"Seguridad de redes y sistemas de información — Atenas/Heraklion":"Network and information system security — Athens/Heraklion",
"Cedefop — Centro Europeo para el Desarrollo de la Formación Profesional":"Cedefop — European Centre for the Development of Vocational Training",
"Investigación en formación profesional — Salónica":"Research on vocational training — Thessaloniki",
"FRA — Agencia de los Derechos Fundamentales":"FRA — Fundamental Rights Agency",
"Asesora sobre derechos fundamentales en la UE — Viena":"Advises on fundamental rights in the EU — Vienna",
"ELA — Autoridad Laboral Europea":"ELA — European Labour Authority",
"Garantiza la movilidad laboral justa — Bratislava":"Ensures fair labour mobility — Bratislava",
"ACER — Agencia para la Cooperación de los Reguladores de la Energía":"ACER — Agency for the Cooperation of Energy Regulators",
"Coordina los reguladores nacionales de energía — Liubliana":"Coordinates national energy regulators — Ljubljana",
"BEREC — Organismo de Reguladores Europeos de Comunicaciones Electrónicas":"BEREC — Body of European Regulators for Electronic Communications",
"Coordina la regulación de telecomunicaciones — Riga":"Coordinates telecoms regulation — Riga",
"EIGE — Instituto Europeo de la Igualdad de Género":"EIGE — European Institute for Gender Equality",
"Investigación y datos sobre igualdad de género — Vilna":"Research and data on gender equality — Vilnius",
"Eurofound — Fundación Europea para la Mejora de las Condiciones de Vida y Trabajo":"Eurofound — European Foundation for the Improvement of Living and Working Conditions",
"Investigación sobre condiciones laborales — Dublín":"Research on working conditions — Dublin",
"eu-LISA — Agencia para la Gestión Operativa de Sistemas TI":"eu-LISA — Agency for the Operational Management of IT Systems",
"Gestiona sistemas IT de Schengen, Visados y Asilo — Tallin/Estrasburgo":"Runs the Schengen, visa and asylum IT systems — Tallinn/Strasbourg",
"EUSPA — Agencia de la UE para el Programa Espacial":"EUSPA — EU Agency for the Space Programme",
"Gestiona Galileo, Copernicus, EGNOS — Praga":"Runs Galileo, Copernicus, EGNOS — Prague",
"ECDC — Centro Europeo para la Prevención y el Control de las Enfermedades":"ECDC — European Centre for Disease Prevention and Control",
"Vigilancia epidemiológica — Solna (Estocolmo)":"Epidemiological surveillance — Solna (Stockholm)",
"Sin sede de agencia UE":"No EU agency seat",
"Croacia es el miembro más reciente (2013). Participa activamente en todas las instituciones.":"Croatia is the newest member (2013). It takes an active part in all the institutions.",
"Bulgaria participa en todas las instituciones europeas sin albergar una agencia descentralizada propia.":"Bulgaria takes part in all the European institutions without hosting a decentralised agency of its own.",
"Rumanía participa en todas las instituciones europeas. Aspira a albergar una agencia de la UE.":"Romania takes part in all the European institutions. It hopes to host an EU agency.",
"Chipre participa en todas las instituciones. Es miembro de la eurozona desde 2008.":"Cyprus takes part in all the institutions. It has been in the euro area since 2008.",
"Malta es el Estado miembro más pequeño de la UE. Participa activamente en todas las instituciones.":"Malta is the EU's smallest member state. It takes an active part in all the institutions."
};
for (var mk in MAP) D[mk]=MAP[mk];

/* ── Textos con números u otras partes variables ───────────────── */
var MES = {ene:'Jan',feb:'Feb',mar:'Mar',abr:'Apr',may:'May',jun:'Jun',jul:'Jul',ago:'Aug',sep:'Sep',sept:'Sep',oct:'Oct',nov:'Nov',dic:'Dec'};
var P = [
  [/^(\d+) mensajes?$/, function(m,n){ return n+(n==='1'?' message':' messages'); }],
  [/^(\d+) de (\d+) términos$/, '$1 of $2 terms'],
  [/^(\d+)% Sí(?: \((\d+)\))?$/, function(m,p,n){ return p+'% Yes'+(n!=null?' ('+n+')':''); }],
  [/^(\d+)% No(?: \((\d+)\))?$/, function(m,p,n){ return p+'% No'+(n!=null?' ('+n+')':''); }],
  [/^(\d+) votos? totales$/, function(m,n){ return n+(n==='1'?' vote':' votes')+' in total'; }],
  [/^(\d+) votos?$/, function(m,n){ return n+(n==='1'?' vote':' votes'); }],
  [/^▲ (\d+) votos$/, '▲ $1 votes'],
  [/^💬 Responder \((\d+)\)$/, '💬 Reply ($1)'],
  [/^Espera (\d+)s antes de publicar de nuevo 🕐$/, 'Wait $1s before posting again 🕐'],
  [/^Máx\. (\d+) caracteres$/, 'Max. $1 characters'],
  [/^Responde a (.+)…$/, 'Reply to $1…'],
  [/^📚 Jurisprudencia: (.+)$/, '📚 Case law: $1'],
  [/^mayoría (abrumadora|clara|ajustada) \((\d+)%\)$/, function(m,k,p){ return ({abrumadora:'overwhelming',clara:'clear',ajustada:'narrow'})[k]+' majority ('+p+'%)'; }],
  [/^(.+) · Tu voto: (.+)$/, '$1 · Your vote: $2'],
  [/^No se encontraron términos para "$/, 'No terms found for "'],
  [/^No hay términos en la categoría$/, 'There are no terms in the category'],
  [/^(\d{1,2}) (ene|feb|mar|abr|may|jun|jul|ago|sept?|oct|nov|dic)\.?( \d{4})?( · .*)?$/i, function(m,d,mo,y,rest){ return d+' '+MES[mo.toLowerCase()]+(y||'')+(rest||''); }]
];

/* ── Bloques con partes en distinto orden (data-i18n en index.html) ─ */
var HTML = {
  founderLeft: 'Only {0} <strong>Founder ⭐</strong> spots left'
};

/* Partes de la página que NO se traducen: panel de administración y
   contenido escrito por personas (artículos, mensajes, glosario…). */
var SKIP = 'script,style,noscript,[data-no-i18n],#view-admin,#legalAvisoContent,'+
  '#mTitle,#mExec,#mDetail,#mImps,#mRef,.art-com-body,.art-com-name,'+
  '.c-title,.c-sum,.fp-body,.fp-reply-body,.fp-name,.fp-reply-name,'+
  '.fw-top-post-body,.fw-lb-name,.glos-term,.glos-def,.glos-block-txt';

/* ── Motor de traducción ───────────────────────────────────────── */
function norm(s){ return s.replace(/\s+/g,' ').trim(); }
function tr(s){
  if(s==null) return null;
  var k=norm(String(s)); if(!k) return null;
  if(Object.prototype.hasOwnProperty.call(D,k)) return D[k];
  for(var i=0;i<P.length;i++){
    var m=k.match(P[i][0]);
    if(m) return typeof P[i][1]==='function' ? P[i][1].apply(null,m) : k.replace(P[i][0],P[i][1]);
  }
  return null;
}
function skipped(el){ return !el || (el.closest && el.closest(SKIP)); }
function trText(n){
  if(n.parentElement && n.parentElement.tagName==='TEXTAREA') return;
  var s=n.nodeValue, t=tr(s);
  if(t==null || t===norm(s)) return;
  var lead=s.match(/^\s*/)[0], trail=s.match(/\s*$/)[0];
  n.nodeValue=lead+t+trail;
}
var ATTRS=['placeholder','title','aria-label','alt'];
function trEl(el){
  for(var i=0;i<ATTRS.length;i++){
    var v=el.getAttribute && el.getAttribute(ATTRS[i]);
    if(v){ var t=tr(v); if(t!=null && t!==v) el.setAttribute(ATTRS[i],t); }
  }
  var key=el.getAttribute && el.getAttribute('data-i18n');
  if(key && HTML[key] && !el.__i18n && document.readyState!=='loading'){
    el.__i18n=1;
    var kids=[].slice.call(el.children);
    el.innerHTML=HTML[key].replace(/\{(\d+)\}/g,'<i data-slot="$1"></i>');
    [].slice.call(el.querySelectorAll('[data-slot]')).forEach(function(s){
      var k=kids[+s.getAttribute('data-slot')]; if(k) s.replaceWith(k); else s.remove();
    });
  }
}
function walk(root){
  if(root.nodeType===3){ if(!skipped(root.parentElement)) trText(root); return; }
  if(root.nodeType!==1 || skipped(root)) return;
  trEl(root);
  var w=document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT, {
    acceptNode:function(n){
      if(n.nodeType===1) return n.matches(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  var n, texts=[], els=[];
  while((n=w.nextNode())){ if(n.nodeType===3) texts.push(n); else els.push(n); }
  els.forEach(trEl); texts.forEach(trText);
}

/* Traduce lo que ya existe y todo lo que se vaya añadiendo después */
var obs=new MutationObserver(function(list){
  for(var i=0;i<list.length;i++){
    var r=list[i];
    if(r.type==='childList'){ for(var j=0;j<r.addedNodes.length;j++) walk(r.addedNodes[j]); }
    else if(r.type==='characterData'){ if(!skipped(r.target.parentElement)) trText(r.target); }
    else if(r.type==='attributes'){ if(!skipped(r.target)) trEl(r.target); }
  }
});
obs.observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS});
walk(document.documentElement);
/* Repaso final cuando la página ha terminado de cargarse */
document.addEventListener('DOMContentLoaded',function(){ walk(document.documentElement); });

/* Avisos del navegador (confirmar borrado, etc.) */
var _confirm=window.confirm, _alert=window.alert;
window.confirm=function(m){ return _confirm.call(window, tr(m)||m); };
window.alert=function(m){ return _alert.call(window, tr(m)||m); };

window.OVERTON_T=function(s){ var t=tr(s); return t==null?s:t; };
})();
