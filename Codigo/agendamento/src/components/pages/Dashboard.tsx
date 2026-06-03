import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, CalendarDays, Music,
  Clock, AlertCircle, CheckCircle, Copy, Check,
} from 'lucide-react';
import type { Lesson, Aluno, Page } from '../../types';
import { StatCard, Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { formatTime, timeToMinutes } from '../../utils';
import { useLanguage } from '../../context/LanguageContext';

interface DashboardProps {
  lessons: Lesson[];
  students: Aluno[];
  onNavigate: (page: Page) => void;
}

function NextLessonBanner({ lesson }: { lesson: Lesson }) {
  const [now, setNow] = useState(new Date());
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const lessonStart = new Date(`${lesson.date}T${lesson.startTime}:00`);
  const lessonEnd = new Date(`${lesson.date}T${lesson.endTime}:00`);
  const isHappening = now >= lessonStart && now < lessonEnd;
  const diffMs = lessonStart.getTime() - now.getTime();

  const countdownLabel = (() => {
    if (isHappening) return t('dashboard.happeningNow');
    if (diffMs <= 0) return '';
    const mins = Math.floor(diffMs / 60_000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `em ${h}h ${m}min`;
    if (h > 0) return `em ${h}h`;
    return `em ${m}min`;
  })();

  const handleCopy = () => {
    if (lesson.meetLink) {
      navigator.clipboard.writeText(lesson.meetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }}>
      <div className="relative overflow-hidden rounded-2xl bg-(--accent-600) p-5 text-white">
        <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-12 -bottom-10 h-28 w-28 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {isHappening ? (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                </span>
              ) : (
                <Clock size={12} className="shrink-0 text-white/70" />
              )}
              <span className="text-xs font-semibold uppercase tracking-wide text-white/80">
                {t('dashboard.nextLesson')}{countdownLabel ? ` ${countdownLabel}` : ''}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Avatar name={lesson.studentName} size="sm" />
              <div className="min-w-0">
                <p className="truncate font-bold text-white">{lesson.studentName}</p>
                <p className="text-xs text-white/70">{lesson.instrument}</p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <p className="text-2xl font-bold tabular-nums text-white">{formatTime(lesson.startTime)}</p>
            <button
              onClick={handleCopy}
              disabled={!lesson.meetLink}
              className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? t('dashboard.copied') : t('dashboard.copyLink')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function Dashboard({ lessons, students, onNavigate }: DashboardProps) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const { t } = useLanguage();
  const currentMonthPrefix = today.slice(0, 7);
  const todayLessons = lessons.filter(l => l.date === today);
  const scheduledToday = todayLessons.filter(l => l.status === 'scheduled');
  const completedToday = todayLessons.filter(l => l.status === 'completed');
  const cancelledToday = todayLessons.filter(l => l.status === 'cancelled');

  const lessonsThisMonth = lessons.filter(l => l.date.startsWith(currentMonthPrefix)).length;
  const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const nextLesson = lessons
    .filter(l => l.status === 'scheduled')
    .filter(l => {
      if (l.date > today) return true;
      if (l.date === today) return timeToMinutes(l.endTime) > nowMinutes;
      return false;
    })
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))[0] ?? null;

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
      {nextLesson && <NextLessonBanner lesson={nextLesson} />}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }}>
          <StatCard
            title={t('dashboard.activeStudents')}
            value={students.length}
            subtitle={t('dashboard.enrolled')}
            icon={<Users size={18} />}
            trend={{ value: '+2 este mês', positive: true }}
            color="purple"
          />
        </motion.div>
        <motion.div variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }}>
          <StatCard
            title={t('dashboard.monthLessons')}
            value={lessonsThisMonth}
            subtitle={monthLabel}
            icon={<Music size={18} />}
            color="blue"
          />
        </motion.div>
        <motion.div variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }}>
          <StatCard
            title={t('dashboard.todayLessons')}
            value={scheduledToday.length}
            subtitle={`${todayLessons.length} ${t('dashboard.total')}`}
            icon={<CalendarDays size={18} />}
            color="green"
          />
        </motion.div>
        <motion.div variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }}>
          <StatCard
            title={t('dashboard.completedToday')}
            value={completedToday.length}
            subtitle={`${cancelledToday.length} ${t('dashboard.cancelled')}`}
            icon={<CheckCircle size={18} />}
            trend={{ value: completedToday.length > 0 ? t('dashboard.progress') : t('dashboard.dayStarting'), positive: true }}
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
              <h3 className="text-sm font-bold text-(--heading)">{t('dashboard.upcomingLessons')}</h3>
              <button onClick={() => onNavigate('agenda')} className="text-xs text-(--accent-600) hover:text-(--accent-700) font-semibold transition-colors">
                {t('dashboard.viewSchedule')}
              </button>
            </div>
            <div className="space-y-2">
              {upcomingLessons.map(lesson => (
                <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-(--hover-bg) transition-colors">
                  <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: lesson.color }} />
                  <Avatar name={lesson.studentName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-(--heading) truncate">{lesson.studentName}</p>
                    <p className="text-xs text-(--muted)">{lesson.instrument}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-(--text)">{formatTime(lesson.startTime)}</p>
                    <p className="text-xs text-(--muted)">
                      {new Date(lesson.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  {lesson.type === 'online' && (
                    <Badge variant="info" className="shrink-0">Online</Badge>
                  )}
                </div>
              ))}
              {upcomingLessons.length === 0 && (
                <p className="text-sm text-(--muted) text-center py-6">{t('dashboard.noLesson')}</p>
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
            <h3 className="text-sm font-bold text-(--heading) mb-3">{t('dashboard.alerts')}</h3>
            <div className="space-y-2">
              {todayLessons.filter(l => l.status === 'cancelled').map(l => (
                <div key={l.id} className="flex items-start gap-2 p-2.5 rounded-xl border bg-rose-50 border-rose-100 dark:bg-rose-950/40 dark:border-rose-900/50">
                  <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-(--heading)">{l.studentName}</p>
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{t('dashboard.lessonCancelled')}</p>
                  </div>
                </div>
              ))}
              {todayLessons.filter(l => l.status === 'rescheduled').map(l => (
                <div key={l.id} className="flex items-start gap-2 p-2.5 rounded-xl border bg-amber-50 border-amber-100 dark:bg-amber-950/40 dark:border-amber-900/50">
                  <Clock size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-(--heading)">{l.studentName}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">{t('dashboard.lessonRescheduled')}</p>
                  </div>
                </div>
              ))}
              {todayLessons.filter(l => l.status === 'cancelled' || l.status === 'rescheduled').length === 0 && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl border bg-emerald-50 border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900/50">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">{t('dashboard.noAlerts')}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Students */}
          <Card className="p-5">
            <h3 className="text-sm font-bold text-(--heading) mb-3">{t('dashboard.recentStudents')}</h3>
            <div className="space-y-2">
              {students.slice(0, 4).map(s => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-(--hover-bg) transition-colors">
                  <Avatar name={s.nome} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-(--heading) truncate">{s.nome}</p>
                    <p className="text-xs text-(--muted) truncate">{s.email}</p>
                  </div>
                  <Badge variant={s.ativo ? 'success' : 'warning'} className="text-[10px]">
                    {s.ativo ? t('common.active') : t('common.inactive')}
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
