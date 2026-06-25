import type { Session } from '@supabase/supabase-js';
import { useBands } from './useBands';
import { BandPicker } from './BandPicker';
import { MainApp } from '@/MainApp';

/** Depois do login: escolher banda (ou criar/entrar) e só então abrir a app. */
export function BandGate({ session }: { session: Session }) {
  const { bands, active, loading, createBand, joinBand, selectBand } = useBands(session.user.id);

  if (loading) return <div className="content">A carregar bandas…</div>;

  if (!active) {
    return (
      <BandPicker
        email={session.user.email ?? ''}
        bands={bands}
        onSelect={selectBand}
        onCreate={createBand}
        onJoin={joinBand}
      />
    );
  }

  return <MainApp band={active} userId={session.user.id} onSwitchBand={() => selectBand(null)} />;
}
