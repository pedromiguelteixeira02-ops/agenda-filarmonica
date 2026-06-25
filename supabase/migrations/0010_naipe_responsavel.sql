-- Responsável de naipe: um membro que gere a assiduidade da sua secção.
alter table public.naipes add column responsavel_id uuid references auth.users(id) on delete set null;

-- Marcar a presença de outro membro: permitido à direção da banda OU ao
-- responsável do naipe a que o membro-alvo pertence. SECURITY DEFINER porque
-- escreve numa linha de attendance que não é a do próprio (contorna o RLS "self vote").
create function public.set_member_vote(p_event uuid, p_user uuid, p_status text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_band uuid;
  v_naipe uuid;
begin
  if p_status not in ('sim', 'nao', 'talvez') then
    raise exception 'Estado inválido';
  end if;

  select band_id into v_band from public.events where id = p_event;
  if v_band is null then
    raise exception 'Evento inexistente';
  end if;

  select naipe_id into v_naipe
  from public.band_members
  where band_id = v_band and user_id = p_user;

  if public.is_band_direcao(v_band)
     or (
       v_naipe is not null
       and exists (select 1 from public.naipes where id = v_naipe and responsavel_id = auth.uid())
     )
  then
    insert into public.attendance (event_id, user_id, status)
    values (p_event, p_user, p_status)
    on conflict (event_id, user_id) do update set status = excluded.status, updated_at = now();
  else
    raise exception 'Sem permissão para marcar a presença deste membro';
  end if;
end;
$$;
