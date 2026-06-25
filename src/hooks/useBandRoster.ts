import { useCallback, useEffect, useState } from 'react';
import type { VoteValue } from '@/types';
import { supabase } from '@/lib/supabase';
import {
  fetchNaipes,
  fetchBandMembers,
  fetchProfiles,
  fetchAttendance,
  createNaipe as apiCreateNaipe,
  setVote as apiSetVote,
  updateDisplayName as apiUpdateName,
  setMyNaipe as apiSetMyNaipe,
  assignNaipe as apiAssignNaipe,
  setRole as apiSetRole,
  removeMember as apiRemoveMember,
  setNaipeResponsavel as apiSetNaipeResponsavel,
  setMemberVote as apiSetMemberVote,
  type Naipe,
} from '@/lib/rosterApi';

export interface RosterMember {
  userId: string;
  role: 'direcao' | 'membro';
  naipeId: string | null;
  name: string;
}

/**
 * Carrega o "roster" da banda: naipes, membros (com nome, papel e naipe) e votos
 * de assiduidade — tudo com sincronização em tempo real.
 */
export function useBandRoster(bandId: string, userId: string) {
  const [naipes, setNaipes] = useState<Naipe[]>([]);
  const [members, setMembers] = useState<RosterMember[]>([]);
  /** eventId -> (userId -> status) */
  const [attendance, setAttendance] = useState<Record<string, Record<string, VoteValue>>>({});
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [ns, bms, att] = await Promise.all([
      fetchNaipes(bandId),
      fetchBandMembers(bandId),
      fetchAttendance(bandId),
    ]);
    const profiles = await fetchProfiles(bms.map((m) => m.userId));
    const nameById = new Map(profiles.map((p) => [p.id, p.name]));

    setNaipes(ns);
    setMembers(bms.map((m) => ({ ...m, name: nameById.get(m.userId) ?? '' })));

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'naipes' }, () => reload())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'band_members' }, () => reload())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [bandId, reload]);

  /** naipeId -> Set<userId>, derivado dos membros. */
  const naipeMembers: Record<string, Set<string>> = {};
  for (const m of members) {
    if (m.naipeId) (naipeMembers[m.naipeId] ??= new Set()).add(m.userId);
  }

  const createNaipe = useCallback(
    async (name: string) => {
      await apiCreateNaipe(bandId, name.trim());
      await reload();
    },
    [bandId, reload],
  );

  const setMyNaipe = useCallback(
    async (naipeId: string | null) => {
      await apiSetMyNaipe(bandId, naipeId);
      await reload();
    },
    [bandId, reload],
  );

  const assignNaipe = useCallback(
    async (targetUserId: string, naipeId: string | null) => {
      await apiAssignNaipe(bandId, targetUserId, naipeId);
      await reload();
    },
    [bandId, reload],
  );

  const setRole = useCallback(
    async (targetUserId: string, role: 'direcao' | 'membro') => {
      await apiSetRole(bandId, targetUserId, role);
      await reload();
    },
    [bandId, reload],
  );

  const removeMember = useCallback(
    async (targetUserId: string) => {
      await apiRemoveMember(bandId, targetUserId);
      await reload();
    },
    [bandId, reload],
  );

  const setNaipeResponsavel = useCallback(
    async (naipeId: string, targetUserId: string | null) => {
      await apiSetNaipeResponsavel(naipeId, targetUserId);
      await reload();
    },
    [reload],
  );

  const vote = useCallback(
    async (eventId: string, status: VoteValue) => {
      await apiSetVote(eventId, userId, status);
      await reload();
    },
    [userId, reload],
  );

  const setMemberVote = useCallback(
    async (eventId: string, targetUserId: string, status: VoteValue) => {
      await apiSetMemberVote(eventId, targetUserId, status);
      await reload();
    },
    [reload],
  );

  const setMyName = useCallback(
    async (name: string) => {
      await apiUpdateName(userId, name.trim());
      await reload();
    },
    [userId, reload],
  );

  const me = members.find((m) => m.userId === userId);

  return {
    naipes,
    members,
    naipeMembers,
    attendance,
    myName: me?.name ?? '',
    myNaipeId: me?.naipeId ?? null,
    loading,
    createNaipe,
    setMyNaipe,
    assignNaipe,
    setRole,
    removeMember,
    setNaipeResponsavel,
    vote,
    setMemberVote,
    setMyName,
  };
}
