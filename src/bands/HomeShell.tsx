import { useState, type FormEvent } from 'react';
import { signOut } from '@/auth/useAuth';
import { PersonalAgenda } from '@/components/personal/PersonalAgenda';
import type { BandMembership } from './useBands';
import styles from './HomeShell.module.css';

type HomeTab = 'agenda' | 'bands' | 'create';

const NAV: { id: HomeTab; icon: string; label: string }[] = [
  { id: 'agenda', icon: '🗓️', label: 'Agenda' },
  { id: 'bands', icon: '🎵', label: 'Bandas' },
  { id: 'create', icon: '➕', label: 'Criar / Juntar' },
];

interface Props {
  email: string;
  userId: string;
  bands: BandMembership[];
  onSelect: (id: string) => void;
  onCreate: (name: string) => Promise<void>;
  onJoin: (code: string) => Promise<void>;
}

/** "Casa" depois do login: agenda pessoal · bandas · criar/juntar, com sidebar (desktop) e abas (mobile). */
export function HomeShell({ email, userId, bands, onSelect, onCreate, onJoin }: Props) {
  const [tab, setTab] = useState<HomeTab>('agenda');
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
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>🎼 Agenda Filarmónica</div>
        <nav className={styles.nav}>
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`${styles.navItem} ${tab === n.id ? styles.active : ''}`}
              onClick={() => setTab(n.id)}
            >
              <span className={styles.navIcon}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div className={styles.footer}>
          <button className={styles.action} onClick={() => signOut()}>
            🚪 Sair
          </button>
          <div className={styles.email}>{email}</div>
        </div>
      </aside>

      <div className={styles.mobileTop}>
        <div className={styles.mHead}>
          <span className={styles.mTitle}>🎼 Agenda Filarmónica</span>
          <button className={styles.signout} onClick={() => signOut()}>
            Sair
          </button>
        </div>
        <div className={styles.tabs}>
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`${styles.tabBtn} ${tab === n.id ? styles.tabActive : ''}`}
              onClick={() => setTab(n.id)}
            >
              <span className={styles.tabIcon}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <main className={styles.main}>
        {tab === 'agenda' && (
          <div className={styles.section}>
            <PersonalAgenda userId={userId} />
          </div>
        )}

        {tab === 'bands' && (
          <div className={styles.section}>
            {bands.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎵</div>
                Ainda não estás em nenhuma banda.
                <br />
                Vai a <strong>Criar / Juntar</strong> para começar.
              </div>
            ) : (
              <div className="card">
                <div className="card-title">Entrar numa banda</div>
                {bands.map((b) => (
                  <button key={b.id} className={styles.bandRow} onClick={() => onSelect(b.id)}>
                    <span className={styles.bandName}>{b.name}</span>
                    <span
                      className="date-badge"
                      style={{ background: 'var(--pbg)', color: 'var(--primary)' }}
                    >
                      {b.role === 'direcao' ? 'Direção' : 'Membro'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'create' && (
          <div className={styles.section}>
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
        )}
      </main>
    </div>
  );
}
