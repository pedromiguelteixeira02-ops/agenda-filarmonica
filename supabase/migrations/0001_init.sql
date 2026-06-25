-- =====================================================================
-- Agenda Filarmónica — schema inicial (multi-tenant: Banda → Naipes → Eventos → Assiduidade)
-- =====================================================================
-- Modelo:
--   bands           o "grupo geral" (tenant)
--   band_members    pessoa ↔ banda, com papel (direcao | membro)
--   naipes          secções da banda (clarinetes, trompetes, ...)
--   naipe_members   pessoa ↔ naipe (muitos-para-muitos)
--   events          ensaios / serviços / festas (visíveis à banda toda)
--   attendance      voto de presença de cada pessoa por evento
--
-- Segurança: RLS em todas as tabelas. Os testes de pertença usam funções
-- SECURITY DEFINER para não causar recursão infinita nas políticas.

-- ---------------------------------------------------------------------
-- Perfis (espelho leve de auth.users para mostrar nomes)
-- ---------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at   timestamptz not null default now()
);

-- Cria automaticamente um profile quando nasce um auth.users
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Bandas
-- ---------------------------------------------------------------------
create table public.bands (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text not null unique,
  created_by  uuid not null references auth.users(id),
  created_at  timestamptz not null default now()
);

create table public.band_members (
  band_id   uuid not null references public.bands(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  role      text not null default 'membro' check (role in ('direcao', 'membro')),
  created_at timestamptz not null default now(),
  primary key (band_id, user_id)
);
create index band_members_user_idx on public.band_members(user_id);

-- ---------------------------------------------------------------------
-- Naipes (secções)
-- ---------------------------------------------------------------------
create table public.naipes (
  id         uuid primary key default gen_random_uuid(),
  band_id    uuid not null references public.bands(id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);
create index naipes_band_idx on public.naipes(band_id);

create table public.naipe_members (
  naipe_id  uuid not null references public.naipes(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  primary key (naipe_id, user_id)
);
create index naipe_members_user_idx on public.naipe_members(user_id);

-- ---------------------------------------------------------------------
-- Eventos
-- ---------------------------------------------------------------------
create table public.events (
  id          uuid primary key default gen_random_uuid(),
  band_id     uuid not null references public.bands(id) on delete cascade,
  type        text not null default 'Serviço',
  name        text not null default '',
  date        date not null,
  start_time  text not null default '',
  end_time    text not null default '',
  location    text not null default '',
  second_band text not null default '',
  value       numeric not null default 0,
  notes       text not null default '',
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now()
);
create index events_band_date_idx on public.events(band_id, date);

-- ---------------------------------------------------------------------
-- Assiduidade (votos de presença)
-- ---------------------------------------------------------------------
create table public.attendance (
  event_id   uuid not null references public.events(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  status     text not null check (status in ('sim', 'nao', 'talvez')),
  updated_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- =====================================================================
-- Funções auxiliares (SECURITY DEFINER → ignoram RLS, evitam recursão)
-- =====================================================================
create function public.is_band_member(b uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.band_members
    where band_id = b and user_id = auth.uid()
  );
$$;

create function public.is_band_direcao(b uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.band_members
    where band_id = b and user_id = auth.uid() and role = 'direcao'
  );
$$;

-- Entrar numa banda por código de convite (o utilizador adiciona-se a si próprio).
create function public.join_band(code text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  target_band uuid;
begin
  select id into target_band from public.bands where invite_code = code;
  if target_band is null then
    raise exception 'Código de convite inválido';
  end if;
  insert into public.band_members (band_id, user_id, role)
  values (target_band, auth.uid(), 'membro')
  on conflict (band_id, user_id) do nothing;
  return target_band;
end;
$$;

-- Criar uma banda e tornar o criador "direcao" numa só operação atómica.
create function public.create_band(band_name text, code text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  new_band uuid;
begin
  insert into public.bands (name, invite_code, created_by)
  values (band_name, code, auth.uid())
  returning id into new_band;
  insert into public.band_members (band_id, user_id, role)
  values (new_band, auth.uid(), 'direcao');
  return new_band;
end;
$$;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles      enable row level security;
alter table public.bands         enable row level security;
alter table public.band_members  enable row level security;
alter table public.naipes        enable row level security;
alter table public.naipe_members enable row level security;
alter table public.events        enable row level security;
alter table public.attendance    enable row level security;

-- profiles: cada um vê/edita o seu; também pode ver quem partilha bandas
create policy "profiles: select self or co-member"
  on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.band_members me
      join public.band_members them on them.band_id = me.band_id
      where me.user_id = auth.uid() and them.user_id = profiles.id
    )
  );
create policy "profiles: update self"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- bands: membros leem; qualquer autenticado cria (normalmente via create_band);
--        só a direção altera/apaga
create policy "bands: members read"
  on public.bands for select to authenticated
  using (public.is_band_member(id));
create policy "bands: authenticated insert"
  on public.bands for insert to authenticated
  with check (created_by = auth.uid());
create policy "bands: direcao update"
  on public.bands for update to authenticated
  using (public.is_band_direcao(id));
create policy "bands: direcao delete"
  on public.bands for delete to authenticated
  using (public.is_band_direcao(id));

-- band_members: membros da banda leem a lista; direção gere; cada um sai sozinho
create policy "band_members: members read"
  on public.band_members for select to authenticated
  using (public.is_band_member(band_id));
create policy "band_members: direcao manage"
  on public.band_members for all to authenticated
  using (public.is_band_direcao(band_id))
  with check (public.is_band_direcao(band_id));
create policy "band_members: leave self"
  on public.band_members for delete to authenticated
  using (user_id = auth.uid());

-- naipes: membros leem; direção gere
create policy "naipes: members read"
  on public.naipes for select to authenticated
  using (public.is_band_member(band_id));
create policy "naipes: direcao manage"
  on public.naipes for all to authenticated
  using (public.is_band_direcao(band_id))
  with check (public.is_band_direcao(band_id));

-- naipe_members: membros da banda leem; cada um entra/sai do seu naipe; direção gere
create policy "naipe_members: members read"
  on public.naipe_members for select to authenticated
  using (public.is_band_member((select band_id from public.naipes where id = naipe_id)));
create policy "naipe_members: self join/leave"
  on public.naipe_members for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy "naipe_members: direcao manage"
  on public.naipe_members for all to authenticated
  using (public.is_band_direcao((select band_id from public.naipes where id = naipe_id)))
  with check (public.is_band_direcao((select band_id from public.naipes where id = naipe_id)));

-- events: membros leem; direção cria/edita/apaga
create policy "events: members read"
  on public.events for select to authenticated
  using (public.is_band_member(band_id));
create policy "events: direcao manage"
  on public.events for all to authenticated
  using (public.is_band_direcao(band_id))
  with check (public.is_band_direcao(band_id));

-- attendance: membros da banda leem (UI filtra por naipe); cada um gere o seu voto
create policy "attendance: members read"
  on public.attendance for select to authenticated
  using (public.is_band_member((select band_id from public.events where id = event_id)));
create policy "attendance: self vote"
  on public.attendance for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
