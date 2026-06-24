import type { TabId } from '@/types';
import { Tabs } from '@/components/Tabs/Tabs';
import styles from './Header.module.css';

interface HeaderProps {
  tab: TabId;
  onTabChange: (tab: TabId) => void;
  onExport: () => void;
}

export function Header({ tab, onTabChange, onExport }: HeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.headerTop}>
        <div className={styles.headerTitle}>🎼 Agenda Filarmónica</div>
        <button className={styles.exportBtn} onClick={onExport}>
          📄 Exportar PDF
        </button>
      </div>
      <Tabs active={tab} onChange={onTabChange} />
    </div>
  );
}
