/** Converte um Date para ISO yyyy-mm-dd (hora local). */
export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Formata um ISO yyyy-mm-dd como dd/mm/yyyy. */
export function fmtD(s: string): string {
  return s ? s.split('-').reverse().join('/') : '—';
}

/** Constrói o ISO de um dia dentro de um ano/mês (mês 0-indexado). */
export function dateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Data de hoje em ISO. */
export const todayStr = isoDate(new Date());
