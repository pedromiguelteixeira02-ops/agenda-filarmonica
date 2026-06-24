import { BANDS } from '@/data/constants';
import type { Band } from '@/types';

/**
 * Resolve a banda (cor/short) a partir do nome guardado no evento.
 * Faz match pela primeira palavra do `short` (ex: "Vale", "Figueiredo");
 * cai em "Outros" quando não encontra.
 */
export function bandInfo(name: string): Band {
  return BANDS.find((b) => name && name.includes(b.short.split(' ')[0])) ?? BANDS[3];
}
