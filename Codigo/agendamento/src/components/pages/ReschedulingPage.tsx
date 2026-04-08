import { motion } from 'framer-motion';
import { RefreshCw, ArrowRight } from 'lucide-react';
import type { Lesson } from '../../types';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { formatTime } from '../../utils';

interface ReschedulingPageProps {
  lessons: Lesson[];
}

export function ReschedulingPage({ lessons }: ReschedulingPageProps) {
  // Show lessons that could be rescheduled (cancelled or upcoming)
  const candidates = lessons.filter(l => l.status === 'scheduled' || l.status === 'rescheduled');

  return (
    <div className="page-padding space-y-6">
      <Card className="p-5 border-l-4 border-l-[var(--accent-500)] app-surface">
        <div className="flex items-start gap-3">
          <RefreshCw size={18} className="text-[var(--accent-600)] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Reagendamento de Aulas</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Arraste aulas na agenda ou use os controles abaixo para reagendar. <br />
              {candidates.length} aula(s) disponíveis para reagendamento.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {candidates.map((lesson, i) => (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-4 app-surface">
              <div className="flex items-center gap-4">
                <div className="w-1 h-12 rounded-full shrink-0" style={{ backgroundColor: lesson.color }} />
                <Avatar name={lesson.studentName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{lesson.studentName}</p>
                  <p className="text-xs text-slate-400">{lesson.instrument} · {lesson.teacherName}</p>
                </div>
                <div className="text-center hidden sm:block">
                  <p className="text-xs text-slate-400">Data atual</p>
                  <p className="text-xs font-medium text-slate-700">
                    {new Date(lesson.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-xs text-slate-500">{formatTime(lesson.startTime)}</p>
                </div>
                <ArrowRight size={14} className="text-slate-300" />
                <div className="text-center">
                  <input
                    type="date"
                    defaultValue={lesson.date}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--accent-100)]"
                  />
                </div>
                <Button size="sm" variant="secondary">
                  <RefreshCw size={12} />
                  Reagendar
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
