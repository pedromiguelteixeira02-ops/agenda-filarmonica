import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { PasswordInput } from './PasswordInput';
import styles from './Login.module.css';

/** Mostrado quando o utilizador volta de um link de recuperação: define nova password. */
export function ResetPassword({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError('A password tem de ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As passwords não coincidem.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setError(error.message);
    else onDone();
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.logo}>🔑</div>
      <h1 className={styles.title}>Nova password</h1>
      <form className="card" onSubmit={submit}>
        <p className={styles.lead}>Define a tua nova password de acesso.</p>
        <div className="field">
          <label htmlFor="np">Nova password</label>
          <PasswordInput
            id="np"
            autoFocus
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
          />
        </div>
        <div className="field">
          <label htmlFor="np2">Confirmar password</label>
          <PasswordInput id="np2" value={confirm} onChange={setConfirm} placeholder="••••••••" />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading || !password}>
          {loading ? 'A guardar…' : 'Guardar password'}
        </button>
      </form>
    </div>
  );
}
