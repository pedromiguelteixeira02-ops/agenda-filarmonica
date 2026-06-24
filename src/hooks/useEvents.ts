import { useCallback, useState } from 'react';
import type { AgendaEvent } from '@/types';
import { repo } from '@/lib/storage';
import { uid } from '@/lib/id';

/**
 * Gere a lista de eventos e o seu CRUD, persistindo pela camada de dados.
 * `saveEvent` cria (sem id) ou atualiza (com id existente).
 */
export function useEvents() {
  const [events, setEvents] = useState<AgendaEvent[]>(() => repo.getEvents());

  const persist = useCallback((next: AgendaEvent[]) => {
    repo.saveEvents(next);
    setEvents(next);
  }, []);

  const saveEvent = useCallback(
    (data: Omit<AgendaEvent, 'id'> & { id?: string | null }) => {
      const { id, ...rest } = data;
      if (id) {
        persist(events.map((e) => (e.id === id ? { ...rest, id } : e)));
      } else {
        persist([...events, { ...rest, id: uid() }]);
      }
    },
    [events, persist],
  );

  const deleteEvent = useCallback(
    (id: string) => {
      persist(events.filter((e) => e.id !== id));
    },
    [events, persist],
  );

  return { events, saveEvent, deleteEvent };
}
