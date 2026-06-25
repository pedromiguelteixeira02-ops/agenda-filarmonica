import { useCallback, useEffect, useState } from 'react';
import type { AgendaEvent } from '@/types';
import { supabase } from '@/lib/supabase';
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent as apiDeleteEvent,
} from '@/lib/eventsApi';

/**
 * Eventos da banda ativa, do Supabase, com sincronização em tempo real.
 * `saveEvent` cria (sem id) ou atualiza (com id). Só a direção tem permissão
 * de escrita — para membros, o RLS rejeita e o erro é propagado.
 */
export function useEvents(bandId: string) {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const list = await fetchEvents(bandId);
    setEvents(list);
    setLoading(false);
  }, [bandId]);

  useEffect(() => {
    setLoading(true);
    reload();
    const channel = supabase
      .channel(`events:${bandId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events', filter: `band_id=eq.${bandId}` },
        () => reload(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [bandId, reload]);

  const saveEvent = useCallback(
    async (data: Omit<AgendaEvent, 'id'> & { id?: string | null }) => {
      const { id, ...rest } = data;
      if (id) await updateEvent(id, rest);
      else await createEvent(bandId, rest);
      await reload();
    },
    [bandId, reload],
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      await apiDeleteEvent(id);
      await reload();
    },
    [reload],
  );

  return { events, loading, saveEvent, deleteEvent };
}
