import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { PasswordInput } from './PasswordInput';
import styles from './Login.module.css';

type Mode = 'signin' | 'signup' | 'magic' | 'forgot';

const REDIRECT = () => window.location.origin + import.meta.env.BASE_URL;

export function Login() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  function go(m: Mode) {
    setMode(m);
    setError('');
    setMsg('');
    setPassword('');
  }

  async function run(fn: () => Promise<{ error: { message: string } | null }>, ok?: string) {
    setLoading(true);
    setError('');
    setMsg('');
    const { error } = await fn();
    setLoading(false);
    if (error) setError(error.message);
    else if (ok) setMsg(ok);
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const mail = email.trim();
    if (mode === 'signin') {
      run(() => supabase.auth.signInWithPassword({ email: mail, password }));
    } else if (mode === 'signup') {
      run(async () => {
        const res = await supabase.auth.signUp({
          email: mail,
          password,
          options: { emailRedirectTo: REDIRECT() },
        });
        if (!res.error && !res.data.session) {
          setMsg('Conta criada! Confirma o teu email para entrares.');
        }
        return res;
      });
    } else if (mode === 'magic') {
      run(
        () => supabase.auth.signInWithOtp({ email: mail, options: { emailRedirectTo: REDIRECT() } }),
        'Enviámos um link de entrada. Vê o teu email.',
      );
    } else {
      run(
        () => supabase.auth.resetPasswordForEmail(mail, { redirectTo: REDIRECT() }),
        'Enviámos um email para repores a password.',
      );
    }
  };

  const titleByMode: Record<Mode, string> = {
    signin: 'Entrar para gerir a tua banda.',
    signup: 'Cria a tua conta.',
    magic: 'Recebe um link de entrada no email.',
    forgot: 'Recebe um email para repor a password.',
  };
  const cta: Record<Mode, string> = {
    signin: 'Entrar',
    signup: 'Criar conta',
    magic: 'Receber link',
    forgot: 'Enviar recuperação',
  };
  const showPassword = mode === 'signin' || mode === 'signup';

  return (
    <div className={styles.wrap}>
      <div className={styles.logo}>🎵</div>
      <h1 className={styles.title}>Agenda Filarmónica</h1>

      <form className="card" onSubmit={submit}>
        <p className={styles.lead}>{titleByMode[mode]}</p>

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

        {showPassword && (
          <div className="field">
            <label htmlFor="pw">Password</label>
            <PasswordInput
              id="pw"
              placeholder="••••••••"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={setPassword}
            />
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}
        {msg && <p className={styles.info}>{msg}</p>}

        <button className="btn btn-primary" type="submit" disabled={loading || !email}>
          {loading ? 'Só um momento…' : cta[mode]}
        </button>

        {mode === 'signin' && (
          <button type="button" className={styles.linkBtn} onClick={() => go('forgot')}>
            Esqueci-me da password
          </button>
        )}
      </form>

      <div className={styles.switch}>
        {mode === 'signin' && (
          <>
            Não tens conta?{' '}
            <button className={styles.linkInline} onClick={() => go('signup')}>
              Criar conta
            </button>
          </>
        )}
        {mode === 'signup' && (
          <>
            Já tens conta?{' '}
            <button className={styles.linkInline} onClick={() => go('signin')}>
              Entrar
            </button>
          </>
        )}
        {(mode === 'magic' || mode === 'forgot') && (
          <button className={styles.linkInline} onClick={() => go('signin')}>
            ← Voltar
          </button>
        )}
      </div>

      {(mode === 'signin' || mode === 'signup') && (
        <>
          <div className={styles.divider}>
            <span>ou</span>
          </div>
          <button className={`btn btn-secondary ${styles.magicBtn}`} onClick={() => go('magic')}>
            ✉️ Entrar com link mágico
          </button>
        </>
      )}
    </div>
  );
}
