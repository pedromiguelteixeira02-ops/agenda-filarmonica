import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  fetchPersonalEvents,
  fetchPersonalValues,
  fetchMyBandCommitments,
  createPersonalEvent,
  updatePersonalEvent,
  deletePersonalEvent,
  setPersonalValue,
  type PersonalEvent,
} from '@/lib/personalApi';

export interface PersonalAgendaItem {
  kind: 'band' | 'personal';
  id: string;
  date: string;
  name: string;
  start: string;
  end: string;
  location: string;
  value: number;
  paid: boolean;
  bandName?: string;
  status?: 'sim' | 'talvez';
}

/**
 * Agenda pessoal e privada: junta os compromissos nas bandas (Vou/Talvez) com os
 * eventos próprios, e calcula o total de valores — tudo só do/para o utilizador.
 */
export function usePersonalAgenda(userId: string) {
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([]);
  const [items, setItems] = useState<PersonalAgendaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [unpaid, setUnpaid] = useState(0);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [pes, vals, commits] = await Promise.all([
      fetchPersonalEvents(userId),
      fetchPersonalValues(userId),
      fetchMyBandCommitments(userId),
    ]);
    const byEvent = new Map(vals.map((v) => [v.eventId, v]));

    const bandItems: PersonalAgendaItem[] = commits.map((c) => {
      const v = byEvent.get(c.eventId);
      return {
        kind: 'band',
        id: c.eventId,
        date: c.date,
        name: c.name,
        start: c.start,
        end: c.end,
        location: c.location,
        value: v?.value ?? 0,
        paid: v?.paid ?? false,
        bandName: c.bandName,
        status: c.status,
      };
    });
    const personalItems: PersonalAgendaItem[] = pes.map((e) => ({
      kind: 'personal',
      id: e.id,
      date: e.date,
      name: e.name,
      start: e.start,
      end: e.end,
      location: e.location,
      value: e.value,
      paid: e.paid,
      bandName: e.band || undefined,
    }));

    setPersonalEvents(pes);
    setItems([...bandItems, ...personalItems].sort((a, b) => a.date.localeCompare(b.date)));

    const all = [...vals, ...pes];
    setTotal(all.reduce((a, x) => a + x.value, 0));
    setUnpaid(all.reduce((a, x) => a + (x.paid ? 0 : x.value), 0));

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    reload();
    const channel = supabase
      .channel(`personal:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'personal_events' }, () =>
        reload(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'personal_values' }, () =>
        reload(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => reload())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, reload]);

  const addPersonalEvent = useCallback(
    async (e: Omit<PersonalEvent, 'id'>) => {
      await createPersonalEvent(userId, e);
      await reload();
    },
    [userId, reload],
  );

  const editPersonalEvent = useCallback(
    async (id: string, e: Omit<PersonalEvent, 'id'>) => {
      await updatePersonalEvent(id, e);
      await reload();
    },
    [reload],
  );

  const removePersonalEvent = useCallback(
    async (id: string) => {
      await deletePersonalEvent(id);
      await reload();
    },
    [reload],
  );

  const setBandValue = useCallback(
    async (eventId: string, value: number, paid: boolean) => {
      await setPersonalValue(userId, eventId, value, paid);
      await reload();
    },
    [userId, reload],
  );

  return {
    items,
    personalEvents,
    total,
    unpaid,
    loading,
    addPersonalEvent,
    editPersonalEvent,
    removePersonalEvent,
    setBandValue,
  };
}
