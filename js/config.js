/* Configuración pública del sitio ATLOS.
   Usa SOLO la ANON key de Supabase (la política RLS de `demo_requests`
   permite únicamente INSERT desde el público — nadie puede leer datos). */
window.ATLOS_CONFIG = {
  SUPABASE_URL: 'https://TU-PROYECTO.supabase.co',
  SUPABASE_ANON_KEY: 'TU_ANON_KEY_PUBLICA',
  CONTACT_EMAIL: 'hola@atlos.app',
};
