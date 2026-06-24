import type { AgendaEvent, Group, Session } from '@/types';

/**
 * Camada de dados abstraída.
 *
 * Toda a UI fala com esta interface, nunca com `localStorage` diretamente.
 * Para passar a um backend partilhado no futuro, basta criar uma
 * implementação alternativa (ex: `apiRepo.ts`) e trocá-la em `repo` abaixo —
 * sem mexer nos hooks nem nos componentes.
 */
export interface AgendaRepository {
  getEvents(): AgendaEvent[];
  saveEvents(events: AgendaEvent[]): void;
  getGroup(code: string): Group | null;
  saveGroup(group: Group): void;
  getSession(): Session;
  setSession(code: string, member: string): void;
  clearSession(): void;
}

import { localStorageRepo } from './localStorageRepo';

/** Implementação ativa da camada de dados. */
export const repo: AgendaRepository = localStorageRepo;
