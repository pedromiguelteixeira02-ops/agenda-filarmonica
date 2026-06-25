-- Estado de pagamento (privado): saber se já recebeste o valor de cada serviço/evento.
alter table public.personal_values add column paid boolean not null default false;
alter table public.personal_events add column paid boolean not null default false;
