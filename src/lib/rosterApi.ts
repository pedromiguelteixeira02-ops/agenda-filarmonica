import { supabase } from './supabase';
import type { VoteValue } from '@/types';

export interface Naipe {
  id: string;
  name: string;
}
export interface BandMemberRow {
  userId: string;
  role: 'direcao' | 'membro';
}
export interface ProfileRow {
  id: string;
  name: string;
}
export interface NaipeMemberRow {
  naipeId: string;
  userId: string;
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

export async function fetchNaipeMembers(bandId: string): Promise<NaipeMemberRow[]> {
  const { data, error } = await supabase
    .from('naipe_members')
    .select('naipe_id, user_id, naipes!inner(band_id)')
    .eq('naipes.band_id', bandId);
  if (error) throw error;
  return (data as { naipe_id: string; user_id: string }[]).map((r) => ({
    naipeId: r.naipe_id,
    userId: r.user_id,
  }));
}

export async function toggleNaipe(naipeId: string, userId: string, join: boolean): Promise<void> {
  if (join) {
    const { error } = await supabase.from('naipe_members').insert({ naipe_id: naipeId, user_id: userId });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('naipe_members')
      .delete()
      .eq('naipe_id', naipeId)
      .eq('user_id', userId);
    if (error) throw error;
  }
}

// ---- Membros & perfis ----
export async function fetchBandMembers(bandId: string): Promise<BandMemberRow[]> {
  const { data, error } = await supabase
    .from('band_members')
    .select('user_id, role')
    .eq('band_id', bandId);
  if (error) throw error;
  return (data as { user_id: string; role: 'direcao' | 'membro' }[]).map((r) => ({
    userId: r.user_id,
    role: r.role,
  }));
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
