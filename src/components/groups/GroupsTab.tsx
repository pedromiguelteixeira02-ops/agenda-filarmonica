import { useMemo, useState } from 'react';
import type { AgendaEvent, Group, VoteValue } from '@/types';
import { GroupSetup } from './GroupSetup';
import { PollCard } from './PollCard';
import styles from './Groups.module.css';

interface GroupsTabProps {
  events: AgendaEvent[];
  code: string;
  member: string;
  group: Group | null;
  onCreate: (name: string, member: string) => void;
  onJoin: (code: string, member: string) => boolean;
  onVote: (eventId: string, vote: VoteValue) => void;
  onLeave: () => void;
}

const COPY_DEFAULT = 'Clica no código para copiar · Partilha com os colegas';

export function GroupsTab({
  events,
  code,
  member,
  group,
  onCreate,
  onJoin,
  onVote,
  onLeave,
}: GroupsTabProps) {
  const [copyNotice, setCopyNotice] = useState(COPY_DEFAULT);

  const services = useMemo(
    () => events.filter((e) => e.type === 'Serviço').sort((a, b) => a.date.localeCompare(b.date)),
    [events],
  );

  function copyCode() {
    if (!code) return;
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopyNotice('✓ Código copiado!');
        setTimeout(() => setCopyNotice(COPY_DEFAULT), 2000);
      })
      .catch(() => {
        prompt('Copia o código:', code);
      });
  }

  function handleLeave() {
    if (!confirm('Sair do grupo? Os dados do grupo ficam guardados neste dispositivo.')) return;
    onLeave();
  }

  if (!code) {
    return (
      <div className="content">
        <GroupSetup onCreate={onCreate} onJoin={onJoin} />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="content">
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            Grupo não encontrado.
            <br />
            <small>
              O grupo pode ter sido criado noutro dispositivo.
              <br />
              Os grupos partilhados requerem ligação a servidor.
            </small>
            <br />
            <br />
            <button className={styles.leaveBtn} onClick={handleLeave}>
              Sair
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="card">
        <div>
          <div className={styles.groupName}>{group.name || 'Grupo'}</div>
          <div className={styles.groupMeta}>
            👥 {group.members.length} membros: {group.members.join(', ')}
          </div>
          <div className={`${styles.groupMeta} ${styles.votingAs}`}>
            A votar como: <strong>{member}</strong>
          </div>
        </div>
        <div className={styles.codeDisplay} onClick={copyCode} title="Clica para copiar">
          {code}
        </div>
        <div className={styles.copyNotice}>{copyNotice}</div>
        <div className={styles.groupTip} style={{ marginTop: 8 }}>
          ⚠️ Os votos são guardados neste dispositivo. Para votos partilhados em tempo real é
          necessário ligação a servidor.
        </div>
      </div>

      {services.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          Adiciona serviços na aba Agenda para votar aqui.
        </div>
      )}

      {services.map((ev) => (
        <PollCard
          key={ev.id}
          event={ev}
          votes={group.votes[ev.id] ?? {}}
          myName={member}
          onVote={onVote}
        />
      ))}

      <div className={styles.leaveWrap}>
        <button className={styles.leaveBtn} onClick={handleLeave}>
          Sair do grupo
        </button>
      </div>
    </div>
  );
}
