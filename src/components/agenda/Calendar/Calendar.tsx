import type { AgendaEvent } from '@/types';
import { DAYS_PT } from '@/data/constants';
import { dateStr, todayStr } from '@/lib/date';
import { bandInfo } from '@/lib/bands';
import styles from './Calendar.module.css';

interface CalendarProps {
  events: AgendaEvent[];
  year: number;
  month: number;
  onAddDay: (date: string) => void;
  onEditEvent: (event: AgendaEvent) => void;
}

export function Calendar({ events, year, month, onAddDay, onEditEvent }: CalendarProps) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // semana começa à segunda
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div className={styles.calWrap}>
      <div className={styles.calDaysHeader}>
        {DAYS_PT.map((d) => (
          <div key={d} className={styles.calDayLabel}>
            {d}
          </div>
        ))}
      </div>
      <div className={styles.calGrid}>
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} className={`${styles.calCell} ${styles.empty}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const ds = dateStr(year, month, day);
          const isToday = ds === todayStr;
          const dayEvents = events.filter((e) => e.date === ds);

          return (
            <div
              key={ds}
              className={`${styles.calCell} ${isToday ? styles.today : ''}`}
              onClick={() => onAddDay(ds)}
            >
              <span className={styles.calNum}>{day}</span>
              {dayEvents.map((ev) => {
                const bi = bandInfo(ev.band);
                const label = ev.name || ev.type;
                return (
                  <span
                    key={ev.id}
                    className={styles.calEvent}
                    style={{ background: bi.bg, color: bi.fg }}
                    title={label}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditEvent(ev);
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
  );
}
