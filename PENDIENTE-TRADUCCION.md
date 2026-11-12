# Traducción completa de la web + switch ES/EN — estado

Rama: `claude/project-thread-jp7tzi` (repo el-despacho-de-overton)

## Hecho
- Revisado cómo funciona el inglés actual (`i18n/en.js`, diccionario que cambia los textos de la interfaz; el glosario y los artículos se saltan a propósito).
- Traducidos al inglés los 152 términos del glosario → `i18n/content-en.js` (clave = id en Supabase).
- Decisión: las traducciones van en un archivo de la web, no en Supabase (añadir columnas a la base de datos de producción quedó bloqueado sin tu permiso).

## Pendiente
1. Traducir el artículo "Costa contra ENEL" (id 2) y añadirlo a `articles` en `i18n/content-en.js`.
2. En `index.html`: cargar `content-en.js` en modo EN y usar la traducción en el glosario (término, definición, bloques, orden alfabético y búsqueda en inglés) y en tarjetas + ventana del artículo.
3. Quitar `.glos-*`, `#mTitle`, `#mExec`… de SKIP en `en.js` solo donde haya traducción; añadir las 13 categorías del glosario al diccionario.
4. Rediseñar el botón ES/EN como switch (escritorio y menú móvil).
5. Probar con Playwright, subir `?v=` y abrir PR.
6. Opcional: campos en inglés en el panel de admin para artículos nuevos (requiere columna en Supabase, con tu OK).
