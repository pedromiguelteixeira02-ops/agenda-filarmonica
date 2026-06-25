import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Faltam variáveis de ambiente: define VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env.local',
  );
}

/** Cliente Supabase partilhado pela app (auth + dados + realtime). */
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
