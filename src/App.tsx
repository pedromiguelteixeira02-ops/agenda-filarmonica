import { useState } from 'react';
import type { AgendaEvent, TabId } from '@/types';
import { useEvents } from '@/hooks/useEvents';
import { useGroup } from '@/hooks/useGroup';
import { exportPDF } from '@/lib/pdf';
import { todayStr } from '@/lib/date';
import { Header } from '@/components/Header/Header';
import { AgendaTab } from '@/components/agenda/AgendaTab';
import { NextTab } from '@/components/next/NextTab';
import { GroupsTab } from '@/components/groups/GroupsTab';
import { EventModal } from '@/components/EventModal/EventModal';

interface ModalState {
  event: AgendaEvent | null;
  defaultDate: string;
}

const now = new Date();

export function App() {
  const { events, saveEvent, deleteEvent } = useEvents();
  const group = useGroup();

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

  const openAdd = (date: string) => setModal({ event: null, defaultDate: date });
  const openEdit = (event: AgendaEvent) => setModal({ event, defaultDate: event.date });
  const closeModal = () => setModal(null);

  return (
    <>
      <Header tab={tab} onTabChange={setTab} onExport={() => exportPDF(events)} />

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
        <GroupsTab
          events={events}
          code={group.code}
          member={group.member}
          group={group.group}
          onCreate={group.createGroup}
          onJoin={group.joinGroup}
          onVote={group.castVote}
          onLeave={group.leaveGroup}
        />
      )}

      {modal && (
        <EventModal
          event={modal.event}
          defaultDate={modal.defaultDate || todayStr}
          onSave={(data) => {
            saveEvent(data);
            closeModal();
          }}
          onDelete={(id) => {
            deleteEvent(id);
            closeModal();
          }}
          onClose={closeModal}
        />
      )}
    </>
  );
}
