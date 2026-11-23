# ATHLOS · atlos-website

Sitio público de ATHLOS. **HTML/CSS/JS a mano, sin build, sin framework, sin
npm** — se sirve como sitio estático. Repo: `Athlos-Saas/website_athlos`
(rama `main`).

```
index.html       ~1060 líneas · landing de una sola página
css/styles.css   ~770 líneas · única hoja de estilos
js/config.js     configuración pública (window.ATHLOS_CONFIG)
js/main.js       ~350 líneas · nav móvil, scroll, formulario (partido gratis / demo)
assets/          logo.svg, favicon.svg
supabase/004_demo_requests.sql        copia de la migración del backend
supabase/031_demo_requests_type.sql   copia de la migración del backend
```

Posicionamiento: **"los datos del talento que nadie está midiendo"** — datos
propios desde video normal y GPS para academias, universidades y ligas de
ascenso, sin perder IA, computer vision, xG y scouting.

Secciones de la landing (en orden): hero, `#problema`, `#partido-gratis`,
`#producto`, `#perfil-atleta` (Perfil verificado + Vitrina para scouts),
`#portal-atleta` (wellness desde el celular), `#como-funciona`, `#resultados`
(caso JBU), `#laboratorio` (visualizaciones SVG + bloque "Síguenos"),
`#clubes-piloto` (prueba social), `#precios` (Coach, Academy, Pro, Elite),
`#faq`, `#demo` (formulario).

## Lo importante

- **Solo la ANON key**, en `js/config.js`, que es un archivo público por
  definición. La política RLS de `demo_requests` permite **únicamente INSERT
  desde el público**: nadie puede leer lo que se envió. Si alguna vez se
  necesita leer datos desde aquí, no se hace — eso va al dashboard.
- El formulario tiene un campo trampa (`website_url`, `tabindex="-1"`) como
  honeypot antispam. No lo quites ni lo hagas visible.
- `supabase/004_demo_requests.sql` y `supabase/031_demo_requests_type.sql` son
  **copias** de `atlos-backend/supabase/migrations/`. Si cambia la tabla
  `demo_requests`, hay que actualizar los dos repos.
- Marca: **ATHLOS**. El nombre viejo era "Atlos" y ya se renombró en todo el
  sitio (los repos y los directorios locales conservan el prefijo `atlos-`).
  No reintroduzcas "Atlos" en texto visible.
- **No inventar** clientes, logos, testimonios, citas de prensa, cuentas de
  redes ni cifras. El Laboratorio y `#clubes-piloto` usan solo datos ya
  publicados (hoy: John Brown University, SAC 2025). Las maquetas (tarjeta del
  Perfil verificado, celular del portal) no llevan valores: muestran "—".
- Los comentarios `PROPUESTA PENDIENTE DE APROBACIÓN DEL NEGOCIO` y `TODO`
  marcan lo que falta aprobar o completar (plan Coach USD 39, "1 partido
  gratis sin tarjeta", oferta de club piloto, límites de Academy+, estado de
  lanzamiento de Perfil/Vitrina/Portal, URLs de redes sociales). Si cambia un
  precio, actualizar a la vez `#precios` **y** el JSON-LD del `<head>`.

## Formulario (`#demo`)

- Dos tipos de solicitud, columna `request_type` (migración 031):
  `free_report` (por defecto; "Analiza gratis un partido", exige `video_url`) y
  `demo`. Cualquier enlace con `data-request-type="free_report|demo"`
  preselecciona el tipo; `data-prefill` propone un mensaje si está vacío.
- `VIDEO_URL_RE` en `main.js` replica el `check` de `video_url` en SQL
  (12–500 caracteres, http(s), host con punto, sin espacios ni `< > " '`).
  Si cambia uno, cambia el otro.
- Si la migración 031 todavía no está aplicada, PostgREST responde `PGRST204`
  y `main.js` reenvía la solicitud con el formato viejo (tipo y enlace dentro
  de `message`) para no perder leads. Aun así: **aplicar 031 antes de
  publicar** el sitio.

## Verificación

No hay build ni tests: se abre `index.html` en el navegador. Revisa el
responsive (el `nav-toggle` aparece por debajo de 980px), que no haya scroll
horizontal en móvil y que el formulario siga enviando en sus dos modos.

## Contexto de los otros repos

`atlos-frontend` (dashboard React, Render) y `atlos-backend` (FastAPI +
Supabase + video, Render). Son repos git independientes dentro de
`C:\GitHub\Athlos`, que no es un repo.
