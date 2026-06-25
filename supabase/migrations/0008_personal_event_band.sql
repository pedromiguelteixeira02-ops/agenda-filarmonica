-- Rótulo livre da banda/filarmónica num evento pessoal (texto, opcional).
-- Permite anotar "fui tocar com a Filarmónica X" mesmo sem se pertencer a esse grupo.
alter table public.personal_events add column band text not null default '';
