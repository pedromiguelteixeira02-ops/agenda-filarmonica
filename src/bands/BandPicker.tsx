import { useState, type FormEvent } from 'react';
import { signOut } from '@/auth/useAuth';
import type { BandMembership } from './useBands';
import styles from './BandPicker.module.css';

interface Props {
  email: string;
  bands: BandMembership[];
  onSelect: (id: string) => void;
  onCreate: (name: string) => Promise<void>;
  onJoin: (code: string) => Promise<void>;
}

/** Escolher uma banda existente, criar nova, ou entrar por código de convite. */
export function BandPicker({ email, bands, onSelect, onCreate, onJoin }: Props) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocorreu um erro');
    } finally {
      setBusy(false);
    }
  }

  const create = (e: FormEvent) => {
    e.preventDefault();
    run(() => onCreate(name.trim()));
  };
  const join = (e: FormEvent) => {
    e.preventDefault();
    run(() => onJoin(code));
  };

  return (
    <div className={`content ${styles.wrap}`}>
      <div className={styles.head}>
        <h1 className={styles.title}>As tuas bandas</h1>
        <button className={styles.signout} onClick={() => signOut()}>
          Sair ({email})
        </button>
      </div>

      {bands.length > 0 && (
        <div className="card">
          <div className="card-title">Entrar numa banda</div>
          {bands.map((b) => (
            <button key={b.id} className={styles.bandRow} onClick={() => onSelect(b.id)}>
              <span className={styles.bandName}>{b.name}</span>
              <span className="date-badge" style={{ background: 'var(--pbg)', color: 'var(--primary)' }}>
                {b.role === 'direcao' ? 'Direção' : 'Membro'}
              </span>
            </button>
          ))}
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <form className="card" onSubmit={create}>
        <div className="card-title">Criar banda nova</div>
        <div className="field">
          <label htmlFor="bname">Nome da banda</label>
          <input
            id="bname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Filarmónica de…"
            required
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy || !name.trim()}>
          Criar banda
        </button>
      </form>

      <form className="card" onSubmit={join}>
        <div className="card-title">Entrar por código de convite</div>
        <div className="field">
          <label htmlFor="bcode">Código</label>
          <input
            id="bcode"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ex: A1B2C3"
            maxLength={6}
            required
          />
        </div>
        <button className="btn btn-secondary" type="submit" disabled={busy || !code.trim()}>
          Entrar
        </button>
      </form>
    </div>
  );
}
