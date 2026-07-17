-- ============================================================================
-- ATHLOS · 004_demo_requests.sql
-- Solicitudes de acceso a la demo enviadas desde el sitio web público.
-- Cualquier visitante (rol anon) puede INSERTAR; nadie puede leer desde el
-- cliente público — solo el backend con SERVICE_ROLE key (o el SQL Editor).
-- ============================================================================

create table public.demo_requests (
  id           uuid primary key default gen_random_uuid(),
  full_name    text not null,
  email        text not null,
  organization text not null,
  role         text,
  country      text,
  team_level   text,          -- universitario | profesional | semipro | academia
  message      text,
  source       text not null default 'website',
  status       text not null default 'new',   -- new | contacted | converted | discarded
  created_at   timestamptz not null default now()
);

create index demo_requests_status_idx on public.demo_requests (status, created_at desc);

alter table public.demo_requests enable row level security;

-- Inserción pública desde el formulario (anon key). Validaciones mínimas
-- para frenar basura obvia; el honeypot del frontend hace el resto.
create policy demo_requests_public_insert on public.demo_requests
  for insert
  to anon, authenticated
  with check (
    char_length(full_name) between 2 and 120
    and char_length(organization) between 2 and 160
    and position('@' in email) > 1
    and char_length(coalesce(message, '')) <= 2000
  );

-- Sin política de SELECT: las solicitudes solo se leen con la SERVICE_ROLE
-- key (backend / panel interno) o desde el dashboard de Supabase.
