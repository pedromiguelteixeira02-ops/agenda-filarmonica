import { MONTHS_PT } from '@/data/constants';
import styles from './MonthNav.module.css';

interface MonthNavProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthNav({ year, month, onPrev, onNext }: MonthNavProps) {
  return (
    <div className={styles.monthNav}>
      <button className={styles.navBtn} onClick={onPrev}>
        ‹
      </button>
      <div className={styles.monthName}>
        <h2>{MONTHS_PT[month]}</h2>
        <p>{year}</p>
      </div>
      <button className={styles.navBtn} onClick={onNext}>
        ›
      </button>
    </div>
  );
}
