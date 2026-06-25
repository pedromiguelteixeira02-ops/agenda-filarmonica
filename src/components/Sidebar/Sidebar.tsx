import type { TabId } from '@/types';
import type { BandMembership } from '@/bands/useBands';
import { signOut } from '@/auth/useAuth';
import styles from './Sidebar.module.css';

const NAV: { id: TabId; icon: string; label: string }[] = [
  { id: 'agenda', icon: '📅', label: 'Agenda' },
  { id: 'next', icon: '🕐', label: 'Próximos' },
  { id: 'groups', icon: '✅', label: 'Assiduidade' },
  { id: 'members', icon: '👥', label: 'Membros' },
];

interface Props {
  band: BandMembership;
  tab: TabId;
  onTabChange: (tab: TabId) => void;
  onExport: () => void;
  onSwitchBand: () => void;
}

/** Navegação lateral — visível apenas em desktop largo (≥880px). */
export function Sidebar({ band, tab, onTabChange, onExport, onSwitchBand }: Props) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>🎼 Agenda Filarmónica</div>

      <div className={styles.bandCard}>
        <div className={styles.bandName}>{band.name}</div>
        <div className={styles.bandMeta}>
          {band.role === 'direcao' ? `Direção · convite ${band.inviteCode}` : 'Membro'}
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV.map((n) => (
          <button
            key={n.id}
            className={`${styles.navItem} ${tab === n.id ? styles.active : ''}`}
            onClick={() => onTabChange(n.id)}
          >
            <span className={styles.icon}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      <div className={styles.footer}>
        <button className={styles.action} onClick={onExport}>
          📄 Exportar PDF
        </button>
        <button className={styles.action} onClick={onSwitchBand}>
          🔁 Trocar banda
        </button>
        <button className={styles.action} onClick={() => signOut()}>
          🚪 Sair
        </button>
      </div>
    </aside>
  );
}
