import type { AgendaEvent, VoteValue } from '@/types';
import { fmtD, todayStr } from '@/lib/date';
import { bandInfo } from '@/lib/bands';
import styles from '../groups/Groups.module.css';

export interface AttendanceEntry {
  userId: string;
  name: string;
  status?: VoteValue;
}

interface Props {
  event: AgendaEvent;
  entries: AttendanceEntry[];
  myStatus?: VoteValue;
  onVote: (eventId: string, status: VoteValue) => void;
  /** userIds cuja presença o utilizador atual pode marcar (responsável/direção). */
  manageableIds?: Set<string>;
  onSetEntry?: (eventId: string, userId: string, status: VoteValue) => void;
}

const TAG: Record<VoteValue, { bg: string; fg: string; label: string }> = {
  sim: { bg: 'var(--sbg)', fg: 'var(--success)', label: 'vai' },
  nao: { bg: 'var(--dbg)', fg: 'var(--danger)', label: 'não vai' },
  talvez: { bg: 'var(--wbg)', fg: 'var(--warn)', label: 'talvez' },
};

const MINI: { status: VoteValue; icon: string; cls: keyof typeof styles }[] = [
  { status: 'sim', icon: '✓', cls: 'miniSim' },
  { status: 'nao', icon: '✗', cls: 'miniNao' },
  { status: 'talvez', icon: '?', cls: 'miniTal' },
];

export function AttendanceCard({
  event,
  entries,
  myStatus,
  onVote,
  manageableIds,
  onSetEntry,
}: Props) {
  const sim = entries.filter((e) => e.status === 'sim').length;
  const nao = entries.filter((e) => e.status === 'nao').length;
  const talvez = entries.filter((e) => e.status === 'talvez').length;
  const isPast = event.date < todayStr;
  const bi = bandInfo(event.band);

  const canManage = !isPast && !!manageableIds && !!onSetEntry;
  const managed = canManage ? entries.filter((e) => manageableIds!.has(e.userId)) : [];
  const others = canManage ? entries.filter((e) => !manageableIds!.has(e.userId)) : entries;

  return (
    <div className={`${styles.pollCard} ${isPast ? styles.past : ''}`}>
      <div className={styles.pollHeader}>
        <span className={styles.pollName}>{event.name || event.type}</span>
        <span className="date-badge" style={{ background: bi.bg, color: bi.fg }}>
          {fmtD(event.date)}
        </span>
      </div>
      <div className={styles.pollSub}>
        {event.location || '—'} · {event.start || '—'}
        {event.end ? ' – ' + event.end : ''}
      </div>
      <div className={styles.tally}>
        <span className={styles.tSim}>✓ {sim} vão</span>
        <span className={styles.tNao}>✗ {nao} não vão</span>
        <span className={styles.tTal}>? {talvez} talvez</span>
      </div>

      {isPast ? (
        <div className={styles.pastNote}>Evento passado</div>
      ) : (
        <div className={styles.voteGrid}>
          <button
            className={`${styles.voteBtn} ${myStatus === 'sim' ? styles.sSim : ''}`}
            onClick={() => onVote(event.id, 'sim')}
          >
            ✓ Vou
          </button>
          <button
            className={`${styles.voteBtn} ${myStatus === 'nao' ? styles.sNao : ''}`}
            onClick={() => onVote(event.id, 'nao')}
          >
            ✗ Não vou
          </button>
          <button
            className={`${styles.voteBtn} ${myStatus === 'talvez' ? styles.sTal : ''}`}
            onClick={() => onVote(event.id, 'talvez')}
          >
            ? Talvez
          </button>
        </div>
      )}

      {managed.length > 0 && (
        <div className={styles.manageList}>
          {managed.map((e) => (
            <div key={e.userId} className={styles.manageRow}>
              <span className={styles.manageName}>{e.name || 'Sem nome'}</span>
              <div className={styles.manageBtns}>
                {MINI.map((b) => (
                  <button
                    key={b.status}
                    className={`${styles.miniBtn} ${e.status === b.status ? styles[b.cls] : ''}`}
                    onClick={() => onSetEntry!(event.id, e.userId, b.status)}
                  >
                    {b.icon}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {others.length > 0 && (
        <div className={styles.memberVotes}>
          {others.map((e) => {
            const t = e.status ? TAG[e.status] : null;
            return (
              <span
                key={e.userId}
                className={styles.memberTag}
                style={
                  t
                    ? { background: t.bg, color: t.fg }
                    : { background: 'var(--bg)', color: 'var(--text3)' }
                }
              >
                {e.name || 'Sem nome'}: {t ? t.label : 'pendente'}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
