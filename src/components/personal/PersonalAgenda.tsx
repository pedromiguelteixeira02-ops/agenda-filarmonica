import { useState } from 'react';
import { dateStr, todayStr } from '@/lib/date';
import { DAYS_PT } from '@/data/constants';
import { usePersonalAgenda, type PersonalAgendaItem } from '@/hooks/usePersonalAgenda';
import type { PersonalEvent } from '@/lib/personalApi';
import { MonthNav } from '@/components/agenda/MonthNav/MonthNav';
import { PersonalEventModal } from './PersonalEventModal';
import { BandValueModal } from './BandValueModal';
import cal from '@/components/agenda/Calendar/Calendar.module.css';
import styles from './Personal.module.css';

const now = new Date();

/** Cor do chip conforme a origem/estado do item. */
function chipColor(item: PersonalAgendaItem) {
  if (item.kind === 'personal') return { background: 'var(--pbg)', color: 'var(--primary)' };
  return item.status === 'sim'
    ? { background: 'var(--sbg)', color: 'var(--success)' }
    : { background: 'var(--wbg)', color: 'var(--warn)' };
}

export function PersonalAgenda({ userId }: { userId: string }) {
  const {
    items,
    personalEvents,
    total,
    unpaid,
    loading,
    addPersonalEvent,
    editPersonalEvent,
    removePersonalEvent,
    setBandValue,
  } = usePersonalAgenda(userId);

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [showTotal, setShowTotal] = useState(false);
  const [peModal, setPeModal] = useState<{ event: PersonalEvent | null; date: string } | null>(null);
  const [bandModal, setBandModal] = useState<PersonalAgendaItem | null>(null);

  const peById = new Map(personalEvents.map((e) => [e.id, e]));

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  async function guard(fn: () => Promise<void>) {
    try {
      await fn();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ocorreu um erro.');
    }
  }

  function openItem(item: PersonalAgendaItem) {
    if (item.kind === 'personal') {
      const pe = peById.get(item.id);
      if (pe) setPeModal({ event: pe, date: pe.date });
    } else {
      setBandModal(item);
    }
  }

  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div className="card">
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}>🗓️ A minha agenda</span>
        <button className={styles.addBtn} onClick={() => setPeModal({ event: null, date: todayStr })}>
          ＋ Evento
        </button>
      </div>
      <p className={styles.privateNote}>
        Os teus serviços (Vou/Talvez) e eventos próprios. Toca num dia para adicionar; num evento
        para ver e meter o teu valor (privado).
      </p>

      <MonthNav year={year} month={month} onPrev={prevMonth} onNext={nextMonth} />

      <div className={cal.calWrap}>
        <div className={cal.calDaysHeader}>
          {DAYS_PT.map((d) => (
            <div key={d} className={cal.calDayLabel}>
              {d}
            </div>
          ))}
        </div>
        <div className={cal.calGrid}>
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`empty-${i}`} className={`${cal.calCell} ${cal.empty}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const ds = dateStr(year, month, day);
            const isToday = ds === todayStr;
            const dayItems = items.filter((it) => it.date === ds);
            return (
              <div
                key={ds}
                className={`${cal.calCell} ${isToday ? cal.today : ''}`}
                onClick={() => setPeModal({ event: null, date: ds })}
              >
                <span className={cal.calNum}>{day}</span>
                {dayItems.map((it) => {
                  const label = it.name || (it.kind === 'band' ? 'Serviço' : 'Evento');
                  return (
                    <span
                      key={`${it.kind}:${it.id}`}
                      className={cal.calEvent}
                      style={chipColor(it)}
                      title={label}
                      onClick={(e) => {
                        e.stopPropagation();
                        openItem(it);
                      }}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.legend}>
        <span>
          <span className={styles.dot} style={{ background: 'var(--success)' }} />
          Vou
        </span>
        <span>
          <span className={styles.dot} style={{ background: 'var(--warn)' }} />
          Talvez
        </span>
        <span>
          <span className={styles.dot} style={{ background: 'var(--primary)' }} />
          Pessoal
        </span>
      </div>

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total acumulado</span>
        <button
          className={styles.eyeBtn}
          onClick={() => setShowTotal((s) => !s)}
          title={showTotal ? 'Esconder' : 'Mostrar'}
        >
          <span className={styles.totalVal}>{showTotal ? `€${total.toFixed(2)}` : '€ ••••'}</span>
          <span className={styles.eye}>{showTotal ? '🙈' : '👁️'}</span>
        </button>
      </div>

      {showTotal && unpaid > 0 && (
        <div className={styles.unpaidRow}>
          <span>Por receber</span>
          <span className={styles.unpaidVal}>€{unpaid.toFixed(2)}</span>
        </div>
      )}

      {loading && <p className={styles.empty}>A carregar…</p>}

      {peModal && (
        <PersonalEventModal
          event={peModal.event}
          defaultDate={peModal.date}
          onSave={(data) =>
            guard(async () => {
              if (peModal.event) await editPersonalEvent(peModal.event.id, data);
              else await addPersonalEvent(data);
              setPeModal(null);
            })
          }
          onDelete={(id) =>
            guard(async () => {
              await removePersonalEvent(id);
              setPeModal(null);
            })
          }
          onClose={() => setPeModal(null)}
        />
      )}

      {bandModal && (
        <BandValueModal
          item={bandModal}
          onSave={(v, paid) =>
            guard(async () => {
              await setBandValue(bandModal.id, v, paid);
              setBandModal(null);
            })
          }
          onClose={() => setBandModal(null)}
        />
      )}
    </div>
  );
}
