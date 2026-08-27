/* Configuración pública del sitio ATHLOS.
   Usa SOLO la ANON key de Supabase (la política RLS de `demo_requests`
   permite únicamente INSERT desde el público — nadie puede leer datos). */
window.ATHLOS_CONFIG = {
  SUPABASE_URL: 'https://djnkztulmcvvjtlgughs.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqbmt6dHVsbWN2dmp0bGd1Z2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzMTAyMTcsImV4cCI6MjA5OTg4NjIxN30.hgXpyPv9FMsWvsTA6aBePHtcuMUt_HWSiXnAtO_WJKQ',
  CONTACT_EMAIL: 'hola@athlos.app',
};
