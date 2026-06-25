-- Cada membro pertence a no máximo UM naipe (passa de N:N para 1:N).
-- O naipe passa a ser uma coluna no próprio band_members; só a direção o altera.

alter table public.band_members
  add column naipe_id uuid references public.naipes(id) on delete set null;

-- Migra associações existentes (escolhe um naipe por utilizador, se houver).
update public.band_members bm
set naipe_id = (
  select nm.naipe_id
  from public.naipe_members nm
  join public.naipes n on n.id = nm.naipe_id
  where nm.user_id = bm.user_id and n.band_id = bm.band_id
  limit 1
);

-- A tabela N:N deixa de ser usada (a sua RLS e o realtime caem com o drop).
drop table public.naipe_members;
