export type EventType = 'Serviço' | 'Ensaio';

export interface AgendaEvent {
  id: string;
  band: string;
  type: EventType;
  name: string;
  date: string; // ISO yyyy-mm-dd
  start: string; // hh:mm
  end: string; // hh:mm
  location: string;
  secondBand: string;
  value: number;
  notes: string;
}

export interface Band {
  name: string;
  short: string;
  bg: string;
  fg: string;
}

export type VoteValue = 'sim' | 'nao' | 'talvez';

export type TabId = 'agenda' | 'next' | 'groups';
