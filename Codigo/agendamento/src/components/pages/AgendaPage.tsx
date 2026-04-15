import { useState } from 'react';
import type { Lesson, Teacher, Room, LessonType, WeeklyAvailability, Student } from '../../types';
import type { AuthUser } from '../../lib/auth';
import { CalendarView } from '../calendar/CalendarView';
import { LessonModal } from '../modals/LessonModal';
import { NewLessonModal } from '../modals/NewLessonModal';

interface AgendaPageProps {
  lessons: Lesson[];
  students: Student[];
  teachers: Teacher[];
  rooms: Room[];
  availability: WeeklyAvailability;
  currentUser: AuthUser;
  onUpdateLesson: (lesson: Lesson) => void;
  onDeleteLesson: (id: string) => void;
  onCreateLesson: (data: {
    studentId: string;
    teacherId: string;
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    type: LessonType;
    instrument: string;
    notes: string;
    meetLink: string;
    attendanceConfirmed: boolean;
    reminderMinutesBefore: number;
  }) => void;
  onMoveLesson: (id: string, date: string, time: string) => void;
}

export function AgendaPage({
  lessons, students, teachers, rooms, availability, currentUser,
  onUpdateLesson, onDeleteLesson, onCreateLesson, onMoveLesson,
}: AgendaPageProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [newLessonModal, setNewLessonModal] = useState<{ date: string; time: string } | null>(null);

  return (
    <div className="flex flex-col h-full">
      <CalendarView
        lessons={lessons}
        availability={availability}
        onLessonClick={setSelectedLesson}
        onNewLesson={(date, time) => setNewLessonModal({ date, time })}
        onLessonMove={onMoveLesson}
      />

      <LessonModal
        lesson={selectedLesson}
        currentUser={currentUser}
        onClose={() => setSelectedLesson(null)}
        onUpdate={(lesson) => { onUpdateLesson(lesson); setSelectedLesson(null); }}
        onDelete={(id) => { onDeleteLesson(id); setSelectedLesson(null); }}
      />

      <NewLessonModal
        open={!!newLessonModal}
        defaultDate={newLessonModal?.date ?? ''}
        defaultTime={newLessonModal?.time ?? ''}
        lessons={lessons}
        students={students}
        teachers={teachers}
        rooms={rooms}
        availability={availability}
        currentUser={currentUser}
        onClose={() => setNewLessonModal(null)}
        onCreate={(data) => { onCreateLesson(data); setNewLessonModal(null); }}
      />
    </div>
  );
}
