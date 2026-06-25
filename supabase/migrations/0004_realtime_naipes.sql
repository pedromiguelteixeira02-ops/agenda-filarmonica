-- Faltou a tabela naipes no realtime (o roster subscreve-a para ver naipes novos ao vivo).
alter publication supabase_realtime add table public.naipes;
