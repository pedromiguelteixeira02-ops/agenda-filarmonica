import { useMemo, useState, type FormEvent } from 'react';
import type { AgendaEvent } from '@/types';
import { todayStr } from '@/lib/date';
import { useBandRoster } from '@/hooks/useBandRoster';
import { AttendanceCard, type AttendanceEntry } from './AttendanceCard';
import styles from './Attendance.module.css';

interface Props {
  events: AgendaEvent[];
  bandId: string;
  userId: string;
  canManage: boolean;
}

const ALL = '__all__';

export function AttendanceTab({ events, bandId, userId, canManage }: Props) {
  const {
    naipes,
    members,
    naipeMembers,
    attendance,
    myName,
    loading,
    createNaipe,
    toggleMyNaipe,
    vote,
    setMyName,
  } = useBandRoster(bandId, userId);

  const [filter, setFilter] = useState<string>(ALL);
  const [newNaipe, setNewNaipe] = useState('');
  const [nameInput, setNameInput] = useState('');

  const nameById = useMemo(() => new Map(members.map((m) => [m.userId, m.name])), [members]);

  const upcoming = useMemo(
    () =>
      events
        .filter((e) => e.date >= todayStr)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [events],
  );

  async function guard(fn: () => Promise<void>) {
    try {
      await fn();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ocorreu um erro.');
    }
  }

  if (loading) return <div className="content">A carregar naipes…</div>;

  // Quem entra no âmbito do filtro (todos os membros, ou os do naipe escolhido).
  const scopeIds =
    filter === ALL ? members.map((m) => m.userId) : [...(naipeMembers[filter] ?? new Set<string>())];

  const saveName = (e: FormEvent) => {
    e.preventDefault();
    guard(() => setMyName(nameInput));
  };
  const addNaipe = (e: FormEvent) => {
    e.preventDefault();
    if (!newNaipe.trim()) return;
    guard(async () => {
      await createNaipe(newNaipe);
      setNewNaipe('');
    });
  };

  return (
    <div className="content">
      {!myName && (
        <form className="card" onSubmit={saveName}>
          <div className="card-title">Como te chamas?</div>
          <p className={styles.hint}>O teu nome aparece nos votos de assiduidade.</p>
          <div className="field">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Ex: João Silva"
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={!nameInput.trim()}>
            Guardar nome
          </button>
        </form>
      )}

      <div className="card">
        <div className="card-title">Naipes {myName && `· ${myName}`}</div>
        {naipes.length === 0 && (
          <p className={styles.hint}>
            {canManage
              ? 'Ainda não há naipes. Cria o primeiro abaixo.'
              : 'A direção ainda não criou naipes.'}
          </p>
        )}
        {naipes.map((n) => {
          const mine = (naipeMembers[n.id] ?? new Set()).has(userId);
          const count = (naipeMembers[n.id] ?? new Set()).size;
          return (
            <div key={n.id} className={styles.naipeRow}>
              <span className={styles.naipeName}>
                {n.name} <span className={styles.naipeCount}>· {count}</span>
              </span>
              <button
                className={mine ? styles.inBtn : styles.outBtn}
                onClick={() => guard(() => toggleMyNaipe(n.id, !mine))}
              >
                {mine ? '✓ Estou' : '+ Entrar'}
              </button>
            </div>
          );
        })}

        {canManage && (
          <form className={styles.addNaipe} onSubmit={addNaipe}>
            <input
              value={newNaipe}
              onChange={(e) => setNewNaipe(e.target.value)}
              placeholder="Novo naipe (ex: Clarinetes)"
            />
            <button className="btn btn-primary" type="submit" disabled={!newNaipe.trim()}>
              Adicionar
            </button>
          </form>
        )}
      </div>

      <div className={styles.filterRow}>
        <label htmlFor="naipeFilter">Assiduidade de:</label>
        <select id="naipeFilter" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value={ALL}>Toda a banda</option>
          {naipes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </div>

      {upcoming.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          Sem eventos futuros. Adiciona na aba Agenda.
        </div>
      )}

      {upcoming.map((ev) => {
        const entries: AttendanceEntry[] = scopeIds
          .map((uid) => ({
            userId: uid,
            name: nameById.get(uid) ?? '',
            status: attendance[ev.id]?.[uid],
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        return (
          <AttendanceCard
            key={ev.id}
            event={ev}
            entries={entries}
            myStatus={attendance[ev.id]?.[userId]}
            onVote={(id, status) => guard(() => vote(id, status))}
          />
        );
      })}
    </div>
  );
}
