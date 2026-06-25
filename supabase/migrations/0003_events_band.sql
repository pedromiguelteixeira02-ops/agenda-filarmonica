-- O evento tem um rótulo de banda (para os chips coloridos no calendário),
-- distinto do band_id (o tenant). Em falta no schema inicial.
alter table public.events add column band text not null default '';
