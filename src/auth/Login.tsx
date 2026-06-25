import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './Login.module.css';

/** Ecrã de entrada por magic link (sem password). */
export function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.logo}>🎵</div>
      <h1 className={styles.title}>Agenda Filarmónica</h1>

      {sent ? (
        <div className="card">
          <p className={styles.lead}>
            Enviámos um link de entrada para <strong>{email}</strong>.
            <br />
            Abre o email neste dispositivo para entrares.
          </p>
          <button className="btn btn-secondary" onClick={() => setSent(false)}>
            Usar outro email
          </button>
        </div>
      ) : (
        <form className="card" onSubmit={submit}>
          <p className={styles.lead}>Entra com o teu email para gerir a tua banda.</p>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              placeholder="o-teu@email.pt"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading || !email}>
            {loading ? 'A enviar…' : 'Receber link de entrada'}
          </button>
        </form>
      )}
    </div>
  );
}
