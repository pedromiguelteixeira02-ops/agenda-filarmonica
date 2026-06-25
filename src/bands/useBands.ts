import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface BandMembership {
  id: string;
  name: string;
  inviteCode: string;
  role: 'direcao' | 'membro';
}

const ACTIVE_KEY = 'af_active_band';

/** Gera um código de convite legível (sem caracteres ambíguos). */
function genCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

/** Bandas a que o utilizador pertence + criação/entrada e banda ativa. */
export function useBands(userId: string) {
  const [bands, setBands] = useState<BandMembership[]>([]);
  const [activeId, setActiveId] = useState<string | null>(() => localStorage.getItem(ACTIVE_KEY));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from('band_members')
      .select('role, bands(id, name, invite_code)')
      .eq('user_id', userId);
    if (!error && data) {
      setBands(
        data
          .map((r) => {
            const b = r.bands as unknown as { id: string; name: string; invite_code: string } | null;
            return b ? { id: b.id, name: b.name, inviteCode: b.invite_code, role: r.role } : null;
          })
          .filter((b): b is BandMembership => b !== null),
      );
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selectBand = useCallback((id: string | null) => {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
    setActiveId(id);
  }, []);

  const createBand = useCallback(
    async (name: string) => {
      const { data, error } = await supabase.rpc('create_band', { band_name: name, code: genCode() });
      if (error) throw error;
      await refresh();
      selectBand(data as string);
    },
    [refresh, selectBand],
  );

  const joinBand = useCallback(
    async (code: string) => {
      const { data, error } = await supabase.rpc('join_band', { code: code.trim().toUpperCase() });
      if (error) throw error;
      await refresh();
      selectBand(data as string);
    },
    [refresh, selectBand],
  );

  const active = bands.find((b) => b.id === activeId) ?? null;

  return { bands, active, loading, createBand, joinBand, selectBand, refresh };
}
