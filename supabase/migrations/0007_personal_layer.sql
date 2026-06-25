-- Camada PESSOAL e PRIVADA. Todo o dinheiro passa a ser pessoal: a direção não
-- preenche valores. RLS garante que só o dono (auth.uid()) lê/escreve — invisível
-- para a banda e para a direção.

-- Eventos próprios do utilizador (não ligados a banda nenhuma).
create table public.personal_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,
  name       text not null default '',
  start_time text not null default '',
  end_time   text not null default '',
  location   text not null default '',
  value      numeric not null default 0,
  notes      text not null default '',
  created_at timestamptz not null default now()
);
create index personal_events_user_idx on public.personal_events(user_id, date);

-- Ganho privado do utilizador por cada evento de banda.
create table public.personal_values (
  user_id  uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  value    numeric not null default 0,
  primary key (user_id, event_id)
);

alter table public.personal_events enable row level security;
alter table public.personal_values enable row level security;

create policy "personal_events: owner all"
  on public.personal_events for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "personal_values: owner all"
  on public.personal_values for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Realtime para sincronizar entre os dispositivos do próprio utilizador.
alter publication supabase_realtime add table public.personal_events;
alter publication supabase_realtime add table public.personal_values;
