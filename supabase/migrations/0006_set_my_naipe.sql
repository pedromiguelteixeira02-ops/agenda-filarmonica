-- Permite a cada membro escolher o SEU próprio naipe (e só o naipe, não o papel).
-- SECURITY DEFINER: corre com privilégios elevados mas só mexe na linha do próprio
-- utilizador (auth.uid()) e só na coluna naipe_id.
create function public.set_my_naipe(band uuid, naipe uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if naipe is not null and not exists (
    select 1 from public.naipes where id = naipe and band_id = band
  ) then
    raise exception 'Naipe inválido para esta banda';
  end if;

  update public.band_members
  set naipe_id = naipe
  where band_id = band and user_id = auth.uid();
end;
$$;
