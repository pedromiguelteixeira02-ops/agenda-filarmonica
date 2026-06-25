import { useAuth } from '@/auth/useAuth';
import { Login } from '@/auth/Login';
import { ResetPassword } from '@/auth/ResetPassword';
import { BandGate } from '@/bands/BandGate';

export function App() {
  const { session, loading, recovery, clearRecovery } = useAuth();

  if (loading) return <div className="content">A carregar…</div>;
  if (recovery) return <ResetPassword onDone={clearRecovery} />;
  if (!session) return <Login />;
  return <BandGate session={session} />;
}
