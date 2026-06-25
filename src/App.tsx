import { useAuth } from '@/auth/useAuth';
import { Login } from '@/auth/Login';
import { BandGate } from '@/bands/BandGate';

export function App() {
  const { session, loading } = useAuth();

  if (loading) return <div className="content">A carregar…</div>;
  if (!session) return <Login />;
  return <BandGate session={session} />;
}
