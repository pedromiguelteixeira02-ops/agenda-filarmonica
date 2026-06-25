import { useCallback, useEffect, useState } from 'react';
import type { VoteValue } from '@/types';
import { supabase } from '@/lib/supabase';
import {
  fetchNaipes,
  fetchNaipeMembers,
  fetchBandMembers,
  fetchProfiles,
  fetchAttendance,
  createNaipe as apiCreateNaipe,
  toggleNaipe as apiToggleNaipe,
  setVote as apiSetVote,
  updateDisplayName as apiUpdateName,
  type Naipe,
} from '@/lib/rosterApi';

export interface RosterMember {
  userId: string;
  role: 'direcao' | 'membro';
  name: string;
}

/**
 * Carrega o "roster" da banda: naipes, membros (com nomes), associações a naipes
 * e votos de assiduidade — tudo com sincronização em tempo real.
 */
export function useBandRoster(bandId: string, userId: string) {
  const [naipes, setNaipes] = useState<Naipe[]>([]);
  const [members, setMembers] = useState<RosterMember[]>([]);
  /** naipeId -> Set<userId> */
  const [naipeMembers, setNaipeMembers] = useState<Record<string, Set<string>>>({});
  /** eventId -> (userId -> status) */
  const [attendance, setAttendance] = useState<Record<string, Record<string, VoteValue>>>({});
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [ns, bms, nms, att] = await Promise.all([
      fetchNaipes(bandId),
      fetchBandMembers(bandId),
      fetchNaipeMembers(bandId),
      fetchAttendance(bandId),
    ]);
    const profiles = await fetchProfiles(bms.map((m) => m.userId));
    const nameById = new Map(profiles.map((p) => [p.id, p.name]));

    setNaipes(ns);
    setMembers(bms.map((m) => ({ ...m, name: nameById.get(m.userId) ?? '' })));

    const nmMap: Record<string, Set<string>> = {};
    for (const r of nms) (nmMap[r.naipeId] ??= new Set()).add(r.userId);
    setNaipeMembers(nmMap);

    const attMap: Record<string, Record<string, VoteValue>> = {};
    for (const r of att) (attMap[r.eventId] ??= {})[r.userId] = r.status;
    setAttendance(attMap);

    setLoading(false);
  }, [bandId]);

  useEffect(() => {
    setLoading(true);
    reload();
    const channel = supabase
      .channel(`roster:${bandId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => reload())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'naipe_members' }, () => reload())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'naipes' }, () => reload())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'band_members' }, () => reload())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [bandId, reload]);

  const createNaipe = useCallback(
    async (name: string) => {
      await apiCreateNaipe(bandId, name.trim());
      await reload();
    },
    [bandId, reload],
  );

  const toggleMyNaipe = useCallback(
    async (naipeId: string, join: boolean) => {
      await apiToggleNaipe(naipeId, userId, join);
      await reload();
    },
    [userId, reload],
  );

  const vote = useCallback(
    async (eventId: string, status: VoteValue) => {
      await apiSetVote(eventId, userId, status);
      await reload();
    },
    [userId, reload],
  );

  const setMyName = useCallback(
    async (name: string) => {
      await apiUpdateName(userId, name.trim());
      await reload();
    },
    [userId, reload],
  );

  const myName = members.find((m) => m.userId === userId)?.name ?? '';

  return {
    naipes,
    members,
    naipeMembers,
    attendance,
    myName,
    loading,
    createNaipe,
    toggleMyNaipe,
    vote,
    setMyName,
  };
}
