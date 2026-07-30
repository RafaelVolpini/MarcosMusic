import { Calendar, CalendarCell, CalendarGrid, CalendarGridHeader, CalendarHeaderCell, CalendarGridBody, Heading, Button as AriaButton } from 'react-aria-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AuthUser } from '../../../lib/auth';
import type { Lesson, WeeklyAvailability } from '../../../types';

interface MobileAgendaPageProps {
  lessons: Lesson[];
  availability: WeeklyAvailability;
  availabilityReposicao: WeeklyAvailability;
  currentUser: AuthUser | null;
  onUpdateLesson: (lesson: Lesson) => void;
  onDeleteLesson: (id: string) => void;
  onMoveLesson: (id: string, date: string, time: string) => void;
}

export function MobileAgendaPage({
  lessons,
  availability,
  availabilityReposicao,
  currentUser,
}: MobileAgendaPageProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="rounded-xl border border-(--border) bg-(--surface) p-4 shadow-sm">
        <Calendar aria-label="Calendário de Aulas" className="w-full text-center">
          <header className="mb-4 flex items-center justify-between w-full">
            <AriaButton slot="previous" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-(--hover-bg) text-(--text)">
              <ChevronLeft size={16} />
            </AriaButton>
            <Heading className="font-semibold text-(--heading) capitalize text-sm" />
            <AriaButton slot="next" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-(--hover-bg) text-(--text)">
              <ChevronRight size={16} />
            </AriaButton>
          </header>
          
          <CalendarGrid className="w-full border-separate border-spacing-1">
            <CalendarGridHeader>
              {(day) => (
                <CalendarHeaderCell className="text-xs font-medium text-(--muted) pb-2">
                  {day}
                </CalendarHeaderCell>
              )}
            </CalendarGridHeader>
            <CalendarGridBody>
              {(date) => (
                <CalendarCell
                  date={date}
                  className={({ isSelected, isOutsideVisibleRange, isUnavailable }) => `
                    flex h-9 w-9 mx-auto items-center justify-center rounded-full text-sm outline-none transition-colors
                    ${isOutsideVisibleRange ? 'invisible' : ''}
                    ${isUnavailable ? 'text-(--muted) opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-(--hover-bg)'}
                    ${isSelected ? '!bg-(--accent-600) !text-white' : 'text-(--text)'}
                  `}
                />
              )}
            </CalendarGridBody>
          </CalendarGrid>
        </Calendar>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-(--heading)">Aulas do dia selecionado</h3>
        <p className="text-xs text-(--muted) mt-2">
          (As aulas do dia aparecerão aqui em breve!)
        </p>
      </div>
    </div>
  );
}
