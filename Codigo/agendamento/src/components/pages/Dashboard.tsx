import { motion } from 'framer-motion';
import {
  Users, CalendarDays, Music,
  Clock, AlertCircle, CheckCircle,
} from 'lucide-react';
import type { Lesson, Student, Page } from '../../types';
import { StatCard, Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { formatTime } from '../../utils';

interface DashboardProps {
  lessons: Lesson[];
  students: Student[];
  onNavigate: (page: Page) => void;
}

export function Dashboard({ lessons, students, onNavigate }: DashboardProps) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentMonthPrefix = today.slice(0, 7);
  const todayLessons = lessons.filter(l => l.date === today);
  const scheduledToday = todayLessons.filter(l => l.status === 'scheduled');
  const completedToday = todayLessons.filter(l => l.status === 'completed');
  const cancelledToday = todayLessons.filter(l => l.status === 'cancelled');

  const lessonsThisMonth = lessons.filter(l => l.date.startsWith(currentMonthPrefix)).length;
  const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const upcomingLessons = lessons
    .filter(l => l.date >= today && l.status === 'scheduled')
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
    .slice(0, 5);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
      className="p-6 space-y-6"
    >
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }}>
          <StatCard
            title="Alunos ativos"
            value={students.length}
            subtitle="matriculados"
            icon={<Users size={18} />}
            trend={{ value: '+2 este mês', positive: true }}
            color="purple"
          />
        </motion.div>
        <motion.div variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }}>
          <StatCard
            title="Aulas no mês"
            value={lessonsThisMonth}
            subtitle={monthLabel}
            icon={<Music size={18} />}
            color="blue"
          />
        </motion.div>
        <motion.div variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }}>
          <StatCard
            title="Aulas hoje"
            value={scheduledToday.length}
            subtitle={`${todayLessons.length} no total`}
            icon={<CalendarDays size={18} />}
            color="green"
          />
        </motion.div>
        <motion.div variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }}>
          <StatCard
            title="Concluidas hoje"
            value={completedToday.length}
            subtitle={`${cancelledToday.length} canceladas`}
            icon={<CheckCircle size={18} />}
            trend={{ value: completedToday.length > 0 ? 'Progresso em andamento' : 'Dia iniciando', positive: true }}
            color="yellow"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming lessons */}
        <motion.div
          variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }}
          className="lg:col-span-2"
        >
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">Próximas Aulas</h3>
              <button onClick={() => onNavigate('agenda')} className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                Ver agenda →
              </button>
            </div>
            <div className="space-y-2">
              {upcomingLessons.map(lesson => (
                <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: lesson.color }} />
                  <Avatar name={lesson.studentName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{lesson.studentName}</p>
                    <p className="text-xs text-slate-400">{lesson.instrument}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-slate-700">{formatTime(lesson.startTime)}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(lesson.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  {lesson.type === 'online' && (
                    <Badge variant="info" className="shrink-0">Online</Badge>
                  )}
                </div>
              ))}
              {upcomingLessons.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6">Nenhuma aula agendada</p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Right column */}
        <motion.div
          variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }}
          className="space-y-4"
        >
          {/* Alerts */}
          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Alertas</h3>
            <div className="space-y-2">
              {todayLessons.filter(l => l.status === 'cancelled').map(l => (
                <div key={l.id} className="flex items-start gap-2 p-2.5 bg-linear-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
                  <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{l.studentName}</p>
                    <p className="text-xs text-rose-600 font-medium">Aula cancelada hoje</p>
                  </div>
                </div>
              ))}
              {todayLessons.filter(l => l.status === 'rescheduled').map(l => (
                <div key={l.id} className="flex items-start gap-2 p-2.5 bg-linear-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                  <Clock size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{l.studentName}</p>
                    <p className="text-xs text-amber-600 font-medium">Aula reagendada</p>
                  </div>
                </div>
              ))}
              {todayLessons.filter(l => l.status === 'cancelled' || l.status === 'rescheduled').length === 0 && (
                <div className="flex items-center gap-2 p-2.5 bg-linear-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <p className="text-xs text-emerald-700 font-semibold">Agenda sem alertas no momento</p>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Students */}
          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Alunos Recentes</h3>
            <div className="space-y-2">
              {students.slice(0, 4).map(s => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <Avatar name={s.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.instrument}</p>
                  </div>
                  <Badge variant={s.level === 'advanced' ? 'success' : s.level === 'intermediate' ? 'warning' : 'default'} className="text-[10px]">
                    {s.level === 'beginner' ? 'Inic.' : s.level === 'intermediate' ? 'Inter.' : 'Avanç.'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
