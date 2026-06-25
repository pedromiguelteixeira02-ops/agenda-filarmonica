import { supabase } from './supabase';
import type { AgendaEvent, EventType } from '@/types';

/** Linha tal como vive na tabela `events`. */
interface EventRow {
  id: string;
  band: string;
  type: string;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  second_band: string;
  value: number;
  notes: string;
}

const COLS =
  'id, band, type, name, date, start_time, end_time, location, second_band, value, notes';

function rowToEvent(r: EventRow): AgendaEvent {
  return {
    id: r.id,
    band: r.band,
    type: r.type as EventType,
    name: r.name,
    date: r.date,
    start: r.start_time,
    end: r.end_time,
    location: r.location,
    secondBand: r.second_band,
    value: Number(r.value),
    notes: r.notes,
  };
}

/** Campos de escrita (sem id), mapeados para as colunas da tabela. */
function eventToRow(e: Omit<AgendaEvent, 'id'>) {
  return {
    band: e.band,
    type: e.type,
    name: e.name,
    date: e.date,
    start_time: e.start,
    end_time: e.end,
    location: e.location,
    second_band: e.secondBand,
    value: e.value,
    notes: e.notes,
  };
}

export async function fetchEvents(bandId: string): Promise<AgendaEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select(COLS)
    .eq('band_id', bandId)
    .order('date');
  if (error) throw error;
  return (data as EventRow[]).map(rowToEvent);
}

export async function createEvent(bandId: string, e: Omit<AgendaEvent, 'id'>): Promise<void> {
  const { error } = await supabase.from('events').insert({ band_id: bandId, ...eventToRow(e) });
  if (error) throw error;
}

export async function updateEvent(id: string, e: Omit<AgendaEvent, 'id'>): Promise<void> {
  const { error } = await supabase.from('events').update(eventToRow(e)).eq('id', id);
  if (error) throw error;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}
