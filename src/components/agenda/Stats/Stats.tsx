import { useMemo } from 'react';
import type { AgendaEvent } from '@/types';
import { MONTHS_PT } from '@/data/constants';
import styles from './Stats.module.css';

interface StatsProps {
  events: AgendaEvent[];
  year: number;
  month: number;
  onAdd: () => void;
}

function summarize(events: AgendaEvent[]) {
  return {
    services: events.filter((e) => e.type === 'Serviço').length,
    rehearsals: events.filter((e) => e.type === 'Ensaio').length,
  };
}

export function Stats({ events, year, month, onAdd }: StatsProps) {
  const monthSummary = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return summarize(events.filter((e) => e.date.startsWith(prefix)));
  }, [events, year, month]);

  const allSummary = useMemo(() => summarize(events), [events]);

  return (
    <div className="content">
      <div className="card">
        <div className="card-title">
          📊 {MONTHS_PT[month]} {year}
        </div>
        <div className={styles.statGrid}>
          <div className={`${styles.statBox} ${styles.blue}`}>
            <div className={styles.statLabel}>Serviços</div>
            <div className={styles.statNum}>{monthSummary.services}</div>
          </div>
          <div className={`${styles.statBox} ${styles.gray}`}>
            <div className={styles.statLabel}>Ensaios</div>
            <div className={styles.statNum}>{monthSummary.rehearsals}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className={styles.accumRow}>
          <div>
            <div className={styles.accumTitle}>Total acumulado</div>
            <div className={styles.accumSub}>
              {allSummary.services} serviços · {allSummary.rehearsals} ensaios
            </div>
          </div>
        </div>
      </div>

      <button className={styles.addBtn} onClick={onAdd}>
        ＋ Adicionar evento
      </button>
    </div>
  );
}
