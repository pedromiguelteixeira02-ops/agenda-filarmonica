import { useState } from 'react';
import type { PersonalAgendaItem } from '@/hooks/usePersonalAgenda';
import { fmtD } from '@/lib/date';
import styles from './Personal.module.css';

interface Props {
  item: PersonalAgendaItem;
  onSave: (value: number, paid: boolean) => void;
  onClose: () => void;
}

/** Detalhe de um serviço de banda na agenda pessoal: info (só leitura) + o teu € privado. */
export function BandValueModal({ item, onSave, onClose }: Props) {
  const [v, setV] = useState(String(item.value ?? 0));
  const [paid, setPaid] = useState(item.paid);

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.box}>
        <div className={styles.boxHeader}>
          <span className={styles.boxTitle}>{item.name || 'Serviço'}</span>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <p className={styles.detailLine}>
          <span className={styles.detailLabel}>Banda:</span> {item.bandName || '—'}
        </p>
        <p className={styles.detailLine}>
          <span className={styles.detailLabel}>Data:</span> {fmtD(item.date)}
          {item.start ? ` · ${item.start}${item.end ? '–' + item.end : ''}` : ''}
        </p>
        {item.location && (
          <p className={styles.detailLine}>
            <span className={styles.detailLabel}>Local:</span> {item.location}
          </p>
        )}
        <p className={styles.detailLine}>
          <span className={styles.detailLabel}>Vais:</span>{' '}
          <span className={item.status === 'sim' ? styles.vou : styles.talvez}>
            {item.status === 'sim' ? 'Vou' : 'Talvez'}
          </span>
        </p>

        <div className="field" style={{ marginTop: 12 }}>
          <label>O teu valor recebido (€) — privado</label>
          <input
            type="number"
            min="0"
            step="5"
            inputMode="decimal"
            autoFocus
            value={v}
            onChange={(e) => setV(e.target.value)}
          />
        </div>

        <label className={styles.checkRow}>
          <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
          Já recebi este valor
        </label>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => onSave(Number(v || 0), paid)}>
            💾 Guardar
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
