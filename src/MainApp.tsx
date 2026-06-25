import { useState } from 'react';
import type { AgendaEvent, TabId } from '@/types';
import type { BandMembership } from '@/bands/useBands';
import { useEvents } from '@/hooks/useEvents';
import { signOut } from '@/auth/useAuth';
import { exportPDF } from '@/lib/pdf';
import { todayStr } from '@/lib/date';
import { Header } from '@/components/Header/Header';
import { AgendaTab } from '@/components/agenda/AgendaTab';
import { NextTab } from '@/components/next/NextTab';
import { AttendanceTab } from '@/components/attendance/AttendanceTab';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { EventModal } from '@/components/EventModal/EventModal';
import styles from './MainApp.module.css';

interface ModalState {
  event: AgendaEvent | null;
  defaultDate: string;
}

const now = new Date();

interface Props {
  band: BandMembership;
  userId: string;
  onSwitchBand: () => void;
}

export function MainApp({ band, userId, onSwitchBand }: Props) {
  const { events, saveEvent, deleteEvent } = useEvents(band.id);
  const canManage = band.role === 'direcao';

  const [tab, setTab] = useState<TabId>('agenda');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [modal, setModal] = useState<ModalState | null>(null);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const openAdd = (date: string) => {
    if (canManage) setModal({ event: null, defaultDate: date });
  };
  const openEdit = (event: AgendaEvent) => setModal({ event, defaultDate: event.date });
  const closeModal = () => setModal(null);

  async function handleSave(data: Parameters<typeof saveEvent>[0]) {
    try {
      await saveEvent(data);
      closeModal();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Não foi possível guardar o evento.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteEvent(id);
      closeModal();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Não foi possível apagar o evento.');
    }
  }

  return (
    <>
      <div className={styles.layout}>
        <Sidebar
          band={band}
          tab={tab}
          onTabChange={setTab}
          onExport={() => exportPDF(events)}
          onSwitchBand={onSwitchBand}
        />

        <div className={styles.mobileTop}>
          <div className={styles.bandBar}>
            <div className={styles.bandInfo}>
              <span className={styles.bandName}>{band.name}</span>
              {band.role === 'direcao' && (
                <span className={styles.code}>convite: {band.inviteCode}</span>
              )}
            </div>
            <div className={styles.actions}>
              <button onClick={onSwitchBand}>Trocar</button>
              <button onClick={() => signOut()}>Sair</button>
            </div>
          </div>
          <Header tab={tab} onTabChange={setTab} onExport={() => exportPDF(events)} />
        </div>

        <main className={styles.main}>
          {tab === 'agenda' && (
            <AgendaTab
              events={events}
              year={year}
              month={month}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
              onAddDay={openAdd}
              onEditEvent={openEdit}
            />
          )}

          {tab === 'next' && <NextTab events={events} onEditEvent={openEdit} />}

          {tab === 'groups' && (
            <AttendanceTab events={events} bandId={band.id} userId={userId} canManage={canManage} />
          )}
        </main>
      </div>

      {modal && (
        <EventModal
          event={modal.event}
          defaultDate={modal.defaultDate || todayStr}
          readOnly={!canManage}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeModal}
        />
      )}
    </>
  );
}
