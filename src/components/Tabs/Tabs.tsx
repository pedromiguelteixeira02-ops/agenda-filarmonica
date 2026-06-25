import type { TabId } from '@/types';
import styles from './Tabs.module.css';

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'agenda', icon: '📅', label: 'Agenda' },
  { id: 'next', icon: '🕐', label: 'Próximos' },
  { id: 'groups', icon: '✅', label: 'Assiduidade' },
  { id: 'members', icon: '👥', label: 'Membros' },
];

interface TabsProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export function Tabs({ active, onChange }: TabsProps) {
  return (
    <div className={styles.tabs}>
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`${styles.tabBtn} ${active === t.id ? styles.active : ''}`}
          onClick={() => onChange(t.id)}
        >
          <span className={styles.icon}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}
