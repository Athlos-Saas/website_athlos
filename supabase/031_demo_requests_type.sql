-- ============================================================================
-- ATHLOS · 031_demo_requests_type.sql
--
-- Tipo de solicitud en `demo_requests` (tabla creada en 004_demo_requests.sql)
-- para la entrada gratuita del sitio público: "Analiza gratis un partido".
--
--   request_type  'demo'        → solicitud de demo guiada (lo que ya existía;
--                                 es el default, así las filas viejas y
--                                 cualquier cliente antiguo siguen siendo válidos)
--                 'free_report' → el club envía el enlace a su video y recibe un
--                                 reporte (distancias, velocidades, mapa de calor,
--                                 red de pases)
--   video_url     enlace al video del partido. Opcional en la tabla; la política
--                 pública lo exige solo cuando request_type = 'free_report'.
--
-- Append-only: no modifica 004; añade columnas, constraints y reemplaza la
-- política de INSERT público por una equivalente con las validaciones nuevas.
-- Sigue SIN haber política de SELECT/UPDATE/DELETE: el público solo inserta.
--
-- Seguridad: video_url es texto escrito por cualquier visitante. Quien lo
-- procese en el backend NO debe descargarlo a ciegas (riesgo de SSRF): validar
-- el host contra una lista de proveedores permitidos antes de abrirlo.
--
-- Copia idéntica en atlos-website/supabase/031_demo_requests_type.sql.
-- ============================================================================

alter table public.demo_requests
  add column if not exists request_type text not null default 'demo',
  add column if not exists video_url    text;

-- Valores permitidos de request_type (aplica a cualquier escritura, también
-- la del backend con SERVICE_ROLE).
alter table public.demo_requests
  drop constraint if exists demo_requests_request_type_check;
alter table public.demo_requests
  add constraint demo_requests_request_type_check
  check (request_type in ('demo', 'free_report'));

-- Forma y longitud de video_url: http(s), host con al menos un punto, puerto
-- opcional, y ruta/consulta sin espacios ni < > " '. Entre 12 y 500 caracteres.
-- El frontend (js/main.js, VIDEO_URL_RE) replica esta misma validación.
alter table public.demo_requests
  drop constraint if exists demo_requests_video_url_check;
alter table public.demo_requests
  add constraint demo_requests_video_url_check
  check (
    video_url is null
    or (
      char_length(video_url) between 12 and 500
      and video_url ~* '^https?://[a-z0-9]([a-z0-9-]*[a-z0-9])?([.][a-z0-9]([a-z0-9-]*[a-z0-9])?)+(:[0-9]{2,5})?([/?#][^[:space:]<>"'']*)?$'
    )
  );

create index if not exists demo_requests_type_idx
  on public.demo_requests (request_type, status, created_at desc);

-- Política de INSERT público: las mismas validaciones de 004 + tipo válido y
-- enlace obligatorio para 'free_report'. Sigue siendo la ÚNICA política para
-- anon/authenticated (solo INSERT).
drop policy if exists demo_requests_public_insert on public.demo_requests;
create policy demo_requests_public_insert on public.demo_requests
  for insert
  to anon, authenticated
  with check (
    char_length(full_name) between 2 and 120
    and char_length(organization) between 2 and 160
    and position('@' in email) > 1
    and char_length(coalesce(message, '')) <= 2000
    and request_type in ('demo', 'free_report')
    and (request_type <> 'free_report' or video_url is not null)
  );

comment on column public.demo_requests.request_type is
  'demo | free_report (Analiza gratis un partido desde el sitio público)';
comment on column public.demo_requests.video_url is
  'Enlace al video del partido (requerido por la política pública si request_type = free_report). No descargar sin validar el host (SSRF).';
