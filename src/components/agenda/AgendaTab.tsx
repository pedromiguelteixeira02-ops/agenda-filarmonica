import type { AgendaEvent } from '@/types';
import { MonthNav } from './MonthNav/MonthNav';
import { Calendar } from './Calendar/Calendar';
import { Stats } from './Stats/Stats';
import { todayStr } from '@/lib/date';

interface AgendaTabProps {
  events: AgendaEvent[];
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onAddDay: (date: string) => void;
  onEditEvent: (event: AgendaEvent) => void;
}

export function AgendaTab({
  events,
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onAddDay,
  onEditEvent,
}: AgendaTabProps) {
  return (
    <div>
      <MonthNav year={year} month={month} onPrev={onPrevMonth} onNext={onNextMonth} />
      <Calendar
        events={events}
        year={year}
        month={month}
        onAddDay={onAddDay}
        onEditEvent={onEditEvent}
      />
      <Stats events={events} year={year} month={month} onAdd={() => onAddDay(todayStr)} />
    </div>
  );
}
