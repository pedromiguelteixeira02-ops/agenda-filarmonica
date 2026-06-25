import { supabase } from './supabase';

/** Evento próprio do utilizador (privado, não ligado a banda). */
export interface PersonalEvent {
  id: string;
  date: string;
  name: string;
  band: string;
  start: string;
  end: string;
  location: string;
  value: number;
  paid: boolean;
  notes: string;
}

/** Compromisso numa banda (evento onde o utilizador votou Vou/Talvez). */
export interface BandCommitment {
  eventId: string;
  name: string;
  date: string;
  start: string;
  end: string;
  location: string;
  bandName: string;
  status: 'sim' | 'talvez';
}

export interface PersonalValueRow {
  eventId: string;
  value: number;
  paid: boolean;
}

const PE_COLS = 'id, date, name, band, start_time, end_time, location, value, paid, notes';

function rowToPersonal(r: {
  id: string;
  date: string;
  name: string;
  band: string;
  start_time: string;
  end_time: string;
  location: string;
  value: number;
  paid: boolean;
  notes: string;
}): PersonalEvent {
  return {
    id: r.id,
    date: r.date,
    name: r.name,
    band: r.band,
    start: r.start_time,
    end: r.end_time,
    location: r.location,
    value: Number(r.value),
    paid: r.paid,
    notes: r.notes,
  };
}

function personalToRow(e: Omit<PersonalEvent, 'id'>) {
  return {
    date: e.date,
    name: e.name,
    band: e.band,
    start_time: e.start,
    end_time: e.end,
    location: e.location,
    value: e.value,
    paid: e.paid,
    notes: e.notes,
  };
}

// ---- Eventos pessoais ----
export async function fetchPersonalEvents(userId: string): Promise<PersonalEvent[]> {
  const { data, error } = await supabase
    .from('personal_events')
    .select(PE_COLS)
    .eq('user_id', userId)
    .order('date');
  if (error) throw error;
  return (data as Parameters<typeof rowToPersonal>[0][]).map(rowToPersonal);
}

export async function createPersonalEvent(
  userId: string,
  e: Omit<PersonalEvent, 'id'>,
): Promise<void> {
  const { error } = await supabase
    .from('personal_events')
    .insert({ user_id: userId, ...personalToRow(e) });
  if (error) throw error;
}

export async function updatePersonalEvent(id: string, e: Omit<PersonalEvent, 'id'>): Promise<void> {
  const { error } = await supabase.from('personal_events').update(personalToRow(e)).eq('id', id);
  if (error) throw error;
}

export async function deletePersonalEvent(id: string): Promise<void> {
  const { error } = await supabase.from('personal_events').delete().eq('id', id);
  if (error) throw error;
}

// ---- Valores privados por evento de banda ----
export async function fetchPersonalValues(userId: string): Promise<PersonalValueRow[]> {
  const { data, error } = await supabase
    .from('personal_values')
    .select('event_id, value, paid')
    .eq('user_id', userId);
  if (error) throw error;
  return (data as { event_id: string; value: number; paid: boolean }[]).map((r) => ({
    eventId: r.event_id,
    value: Number(r.value),
    paid: r.paid,
  }));
}

export async function setPersonalValue(
  userId: string,
  eventId: string,
  value: number,
  paid: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('personal_values')
    .upsert(
      { user_id: userId, event_id: eventId, value, paid },
      { onConflict: 'user_id,event_id' },
    );
  if (error) throw error;
}

// ---- Compromissos nas bandas (Vou/Talvez) ----
export async function fetchMyBandCommitments(userId: string): Promise<BandCommitment[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('status, events!inner(id, name, date, start_time, end_time, location, bands(name))')
    .eq('user_id', userId)
    .in('status', ['sim', 'talvez']);
  if (error) throw error;
  return (
    data as unknown as {
      status: 'sim' | 'talvez';
      events: {
        id: string;
        name: string;
        date: string;
        start_time: string;
        end_time: string;
        location: string;
        bands: { name: string } | null;
      };
    }[]
  ).map((r) => ({
    eventId: r.events.id,
    name: r.events.name,
    date: r.events.date,
    start: r.events.start_time,
    end: r.events.end_time,
    location: r.events.location,
    bandName: r.events.bands?.name ?? '',
    status: r.status,
  }));
}
