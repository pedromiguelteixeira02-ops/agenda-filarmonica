import type { AgendaEvent, Group, Session } from '@/types';
import { SEED } from '@/data/seed';
import type { AgendaRepository } from './storage';

const KEYS = {
  events: 'af_events',
  group: (code: string) => `af_group_${code}`,
  sessionCode: 'af_gc',
  sessionMember: 'af_member',
} as const;

/** Implementação da camada de dados sobre o `localStorage` do browser. */
export const localStorageRepo: AgendaRepository = {
  getEvents() {
    const raw = localStorage.getItem(KEYS.events);
    // Sem dados guardados, arranca com o seed (cópia, para não mutar a constante).
    return raw ? (JSON.parse(raw) as AgendaEvent[]) : structuredClone(SEED);
  },

  saveEvents(events) {
    localStorage.setItem(KEYS.events, JSON.stringify(events));
  },

  getGroup(code) {
    const raw = localStorage.getItem(KEYS.group(code));
    return raw ? (JSON.parse(raw) as Group) : null;
  },

  saveGroup(group) {
    localStorage.setItem(KEYS.group(group.code), JSON.stringify(group));
  },

  getSession(): Session {
    return {
      code: localStorage.getItem(KEYS.sessionCode) ?? '',
      member: localStorage.getItem(KEYS.sessionMember) ?? '',
    };
  },

  setSession(code, member) {
    localStorage.setItem(KEYS.sessionCode, code);
    localStorage.setItem(KEYS.sessionMember, member);
  },

  clearSession() {
    localStorage.removeItem(KEYS.sessionCode);
    localStorage.removeItem(KEYS.sessionMember);
  },
};
