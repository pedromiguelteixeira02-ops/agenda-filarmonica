-- Ativa Realtime nas tabelas que precisam de sincronização ao vivo entre dispositivos.
-- A publicação supabase_realtime já existe por omissão num projeto Supabase.
alter publication supabase_realtime add table public.attendance;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.band_members;
alter publication supabase_realtime add table public.naipe_members;
