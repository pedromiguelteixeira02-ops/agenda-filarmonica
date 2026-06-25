import { supabase } from './supabase';
import type { VoteValue } from '@/types';

export interface Naipe {
  id: string;
  name: string;
}
export interface BandMemberRow {
  userId: string;
  role: 'direcao' | 'membro';
  naipeId: string | null;
}
export interface ProfileRow {
  id: string;
  name: string;
}
export interface AttendanceRow {
  eventId: string;
  userId: string;
  status: VoteValue;
}

// ---- Naipes ----
export async function fetchNaipes(bandId: string): Promise<Naipe[]> {
  const { data, error } = await supabase
    .from('naipes')
    .select('id, name')
    .eq('band_id', bandId)
    .order('name');
  if (error) throw error;
  return data as Naipe[];
}

export async function createNaipe(bandId: string, name: string): Promise<void> {
  const { error } = await supabase.from('naipes').insert({ band_id: bandId, name });
  if (error) throw error;
}

// ---- Membros & perfis ----
export async function fetchBandMembers(bandId: string): Promise<BandMemberRow[]> {
  const { data, error } = await supabase
    .from('band_members')
    .select('user_id, role, naipe_id')
    .eq('band_id', bandId);
  if (error) throw error;
  return (data as { user_id: string; role: 'direcao' | 'membro'; naipe_id: string | null }[]).map(
    (r) => ({ userId: r.user_id, role: r.role, naipeId: r.naipe_id }),
  );
}

export async function fetchProfiles(userIds: string[]): Promise<ProfileRow[]> {
  if (userIds.length === 0) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', userIds);
  if (error) throw error;
  return (data as { id: string; display_name: string }[]).map((r) => ({
    id: r.id,
    name: r.display_name,
  }));
}

export async function updateDisplayName(userId: string, name: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ display_name: name }).eq('id', userId);
  if (error) throw error;
}

// ---- Naipe do próprio (self-service, via RPC segura) ----
export async function setMyNaipe(bandId: string, naipeId: string | null): Promise<void> {
  const { error } = await supabase.rpc('set_my_naipe', { band: bandId, naipe: naipeId });
  if (error) throw error;
}

// ---- Gestão de membros (só direção, reforçado por RLS) ----
export async function assignNaipe(
  bandId: string,
  userId: string,
  naipeId: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('band_members')
    .update({ naipe_id: naipeId })
    .eq('band_id', bandId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function setRole(
  bandId: string,
  userId: string,
  role: 'direcao' | 'membro',
): Promise<void> {
  const { error } = await supabase
    .from('band_members')
    .update({ role })
    .eq('band_id', bandId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function removeMember(bandId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('band_members')
    .delete()
    .eq('band_id', bandId)
    .eq('user_id', userId);
  if (error) throw error;
}

// ---- Assiduidade ----
export async function fetchAttendance(bandId: string): Promise<AttendanceRow[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('event_id, user_id, status, events!inner(band_id)')
    .eq('events.band_id', bandId);
  if (error) throw error;
  return (data as { event_id: string; user_id: string; status: VoteValue }[]).map((r) => ({
    eventId: r.event_id,
    userId: r.user_id,
    status: r.status,
  }));
}

export async function setVote(eventId: string, userId: string, status: VoteValue): Promise<void> {
  const { error } = await supabase
    .from('attendance')
    .upsert({ event_id: eventId, user_id: userId, status }, { onConflict: 'event_id,user_id' });
  if (error) throw error;
}
