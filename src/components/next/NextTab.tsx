import { useMemo } from 'react';
import type { AgendaEvent } from '@/types';
import { fmtD, todayStr } from '@/lib/date';
import { bandInfo } from '@/lib/bands';
import styles from './NextTab.module.css';

interface NextTabProps {
  events: AgendaEvent[];
  onEditEvent: (event: AgendaEvent) => void;
}

export function NextTab({ events, onEditEvent }: NextTabProps) {
  const nextServices = useMemo(
    () =>
      events
        .filter((e) => e.date >= todayStr && e.type === 'Serviço')
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5),
    [events],
  );

  const futureEvents = useMemo(
    () =>
      events
        .filter((e) => e.date >= todayStr)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [events],
  );

  return (
    <div className="content">
      <div className="card">
        <div className="card-title">⏱ Próximos 5 serviços</div>
        {nextServices.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎵</div>
            Sem serviços futuros.
          </div>
        )}
        {nextServices.map((ev) => {
          const bi = bandInfo(ev.band);
          return (
            <div key={ev.id} className={styles.eventRow} onClick={() => onEditEvent(ev)}>
              <div className={styles.eventRowTop}>
                <span className={styles.eventName}>{ev.name || 'Evento'}</span>
                <span className="date-badge" style={{ background: bi.bg, color: bi.fg }}>
                  {fmtD(ev.date)}
                </span>
              </div>
              <div className={styles.eventLine}>
                <span className={styles.eventSub}>
                  {ev.location} · {ev.start || '—'}
                  {ev.end ? ' – ' + ev.end : ''}
                </span>
                <span className={styles.eventMoney}>€{Number(ev.value || 0).toFixed(0)}</span>
              </div>
              {ev.secondBand && <div className={styles.secondBand}>+ {ev.secondBand}</div>}
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-title">📋 Todos os eventos futuros</div>
        {futureEvents.length === 0 && <p className={styles.emptyText}>Sem eventos futuros.</p>}
        {futureEvents.map((ev) => {
          const bi = bandInfo(ev.band);
          return (
            <div key={ev.id} className={styles.futureRow} onClick={() => onEditEvent(ev)}>
              <div>
                <div className={styles.futureName}>{ev.name || 'Evento'}</div>
                <div className={styles.futureSub}>
                  {fmtD(ev.date)} · {ev.type} · {ev.location}
                </div>
              </div>
              <div className={styles.futureRight}>
                <div className={styles.futureMoney}>€{Number(ev.value || 0).toFixed(0)}</div>
                <span className={styles.bandBadge} style={{ background: bi.bg, color: bi.fg }}>
                  {bi.short}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
