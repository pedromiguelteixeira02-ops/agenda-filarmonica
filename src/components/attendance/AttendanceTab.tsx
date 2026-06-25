import { useMemo, useState } from 'react';
import type { AgendaEvent } from '@/types';
import { todayStr } from '@/lib/date';
import { exportAttendancePDF } from '@/lib/pdf';
import { useBandRoster } from '@/hooks/useBandRoster';
import { AttendanceCard, type AttendanceEntry } from './AttendanceCard';
import styles from './Attendance.module.css';

interface Props {
  events: AgendaEvent[];
  bandId: string;
  userId: string;
}

const ALL = '__all__';

export function AttendanceTab({ events, bandId, userId }: Props) {
  const { naipes, members, naipeMembers, attendance, loading, vote } = useBandRoster(bandId, userId);
  const [filter, setFilter] = useState<string>(ALL);

  const nameById = useMemo(() => new Map(members.map((m) => [m.userId, m.name])), [members]);
  const upcoming = useMemo(
    () => events.filter((e) => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)),
    [events],
  );

  async function castVote(eventId: string, status: AttendanceEntry['status']) {
    if (!status) return;
    try {
      await vote(eventId, status);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Não foi possível registar o voto.');
    }
  }

  function exportPdf() {
    const ids =
      filter === ALL ? members.map((m) => m.userId) : [...(naipeMembers[filter] ?? new Set<string>())];
    const scope = filter === ALL ? 'Toda a banda' : naipes.find((n) => n.id === filter)?.name ?? 'Naipe';
    const sortNames = (a: string, b: string) => a.localeCompare(b);
    const events = upcoming.map((ev) => {
      const entries = ids.map((uid) => ({
        name: nameById.get(uid) || 'Sem nome',
        status: attendance[ev.id]?.[uid],
      }));
      const pick = (s: string) => entries.filter((e) => e.status === s).map((e) => e.name).sort(sortNames);
      return {
        name: ev.name || ev.type,
        date: ev.date,
        location: ev.location,
        sim: pick('sim'),
        nao: pick('nao'),
        talvez: pick('talvez'),
        pendente: entries.filter((e) => !e.status).map((e) => e.name).sort(sortNames),
      };
    });
    exportAttendancePDF({ scope, events });
  }

  if (loading) return <div className="content">A carregar assiduidade…</div>;

  const scopeIds =
    filter === ALL ? members.map((m) => m.userId) : [...(naipeMembers[filter] ?? new Set<string>())];

  return (
    <div className="content">
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
        <button className={styles.pdfBtn} onClick={exportPdf} title="Exportar PDF">
          📄 PDF
        </button>
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
            onVote={castVote}
          />
        );
      })}
    </div>
  );
}
