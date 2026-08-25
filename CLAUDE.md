# ATHLOS · atlos-website

Sitio público de ATHLOS. **HTML/CSS/JS a mano, sin build, sin framework, sin
npm** — se sirve como sitio estático. Repo: `Athlos-Saas/website_athlos`
(rama `main`).

```
index.html   509 líneas · landing de una sola página
css/styles.css   498 líneas · única hoja de estilos
js/config.js     configuración pública (window.ATHLOS_CONFIG)
js/main.js       198 líneas · nav móvil, scroll, formulario de demo
assets/          logo.svg, favicon.svg
supabase/004_demo_requests.sql   copia de la migración del backend
```

Secciones de la landing: hero, `#problema`, `#producto`, `#como-funciona`,
`#resultados`, `#precios`, `#faq`, `#demo`.

## Lo importante

- **Solo la ANON key**, en `js/config.js`, que es un archivo público por
  definición. La política RLS de `demo_requests` permite **únicamente INSERT
  desde el público**: nadie puede leer lo que se envió. Si alguna vez se
  necesita leer datos desde aquí, no se hace — eso va al dashboard.
- El formulario de demo tiene un campo trampa (`website_url`, `tabindex="-1"`)
  como honeypot antispam. No lo quites ni lo hagas visible.
- `supabase/004_demo_requests.sql` es **una copia** de
  `atlos-backend/supabase/migrations/004_demo_requests.sql`. Si cambia la tabla
  `demo_requests`, hay que actualizar los dos archivos.
- Marca: **ATHLOS**. El nombre viejo era "Atlos" y ya se renombró en todo el
  sitio (los repos y los directorios locales conservan el prefijo `atlos-`).
  No reintroduzcas "Atlos" en texto visible.

## Verificación

No hay build ni tests: se abre `index.html` en el navegador. Revisa el
responsive (el `nav-toggle` móvil) y que el formulario siga enviando.

## Contexto de los otros repos

`atlos-frontend` (dashboard React, Render) y `atlos-backend` (FastAPI +
Supabase + video, Render). Son repos git independientes dentro de
`C:\GitHub\Athlos`, que no es un repo.
