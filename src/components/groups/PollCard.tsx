import type { AgendaEvent, VoteValue } from '@/types';
import { fmtD, todayStr } from '@/lib/date';
import { bandInfo } from '@/lib/bands';
import styles from './Groups.module.css';

interface PollCardProps {
  event: AgendaEvent;
  votes: Record<string, VoteValue>;
  myName: string;
  onVote: (eventId: string, vote: VoteValue) => void;
}

const VOTE_LABELS: Record<VoteValue, string> = { sim: 'vai', nao: 'não vai', talvez: 'talvez' };
const TAG_COLORS: Record<VoteValue, { bg: string; fg: string }> = {
  sim: { bg: 'var(--sbg)', fg: 'var(--success)' },
  nao: { bg: 'var(--dbg)', fg: 'var(--danger)' },
  talvez: { bg: 'var(--wbg)', fg: 'var(--warn)' },
};

export function PollCard({ event, votes, myName, onVote }: PollCardProps) {
  const values = Object.values(votes);
  const sim = values.filter((v) => v === 'sim').length;
  const nao = values.filter((v) => v === 'nao').length;
  const talvez = values.filter((v) => v === 'talvez').length;
  const myVote = votes[myName];
  const isPast = event.date < todayStr;
  const bi = bandInfo(event.band);

  return (
    <div className={`${styles.pollCard} ${isPast ? styles.past : ''}`}>
      <div className={styles.pollHeader}>
        <span className={styles.pollName}>{event.name || 'Evento'}</span>
        <span className="date-badge" style={{ background: bi.bg, color: bi.fg }}>
          {fmtD(event.date)}
        </span>
      </div>
      <div className={styles.pollSub}>
        {event.location} · {event.start || '—'}
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
            className={`${styles.voteBtn} ${myVote === 'sim' ? styles.sSim : ''}`}
            onClick={() => onVote(event.id, 'sim')}
          >
            ✓ Vou
          </button>
          <button
            className={`${styles.voteBtn} ${myVote === 'nao' ? styles.sNao : ''}`}
            onClick={() => onVote(event.id, 'nao')}
          >
            ✗ Não vou
          </button>
          <button
            className={`${styles.voteBtn} ${myVote === 'talvez' ? styles.sTal : ''}`}
            onClick={() => onVote(event.id, 'talvez')}
          >
            ? Talvez
          </button>
        </div>
      )}

      {Object.keys(votes).length > 0 && (
        <div className={styles.memberVotes}>
          {Object.entries(votes).map(([member, vote]) => (
            <span
              key={member}
              className={styles.memberTag}
              style={{ background: TAG_COLORS[vote].bg, color: TAG_COLORS[vote].fg }}
            >
              {member}: {VOTE_LABELS[vote]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
