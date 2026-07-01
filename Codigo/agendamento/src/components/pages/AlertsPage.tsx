import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, BookOpen, CheckCircle2, ChevronDown, ChevronRight,
  CreditCard, Clock, Loader2, MessageCircle, PenLine, Phone, Search, Users,
} from 'lucide-react';
import type { Aluno, Lesson } from '../../types';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { formatTime, formatPhoneGlobal, phoneToWhatsApp, getNowInTimezone } from '../../utils';
import { useAppSettings } from '../../context/AppSettingsContext';
import { buscarAulas } from '../../services/aulaService';
import { listarAlunos } from '../../services/alunoService';
import { listarReposicoes, type ReposicaoDTO } from '../../services/reposicaoService';
import { toLesson } from '../../adapters/aulaAdapter';

// ─── tipos ────────────────────────────────────────────────────────────────────

type Mode = 'aula' | 'aluno';
type TemplateCategory = 'lembrete' | 'presenca' | 'cobranca' | 'vencimento' | 'personalizado';

const ACTIVE_STATUSES = ['scheduled', 'rescheduled'] as const;

// ─── dados de template ────────────────────────────────────────────────────────

const CATEGORIES: {
  id: TemplateCategory;
  label: string;
  icon: React.ReactNode;
  colorActive: string;
  colorDot: string;
  options: { id: string; label: string; text: string }[];
}[] = [
  {
    id: 'lembrete',
    label: 'Lembrete',
    icon: <Bell size={12} />,
    colorActive: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    colorDot: 'bg-blue-400',
    options: [
      { id: 'l1', label: 'Padrão', text: 'Ola, {nome}! Passando para lembrar da sua aula de {instrumento} em {data}, as {hora}. Ate ja!' },
      { id: 'l2', label: 'Informal', text: 'Oi {nome}! So lembrando da sua aula de {instrumento} em {data} as {hora}. Te espero!' },
      { id: 'l3', label: 'Antecipado', text: 'Ola, {nome}! Sua proxima aula de {instrumento} esta marcada para {data} as {hora}. Qualquer duvida e so me chamar!' },
    ],
  },
  {
    id: 'presenca',
    label: 'Presença',
    icon: <CheckCircle2 size={12} />,
    colorActive: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    colorDot: 'bg-emerald-400',
    options: [
      { id: 'p1', label: 'Simples', text: 'Oi {nome}! Voce vai conseguir comparecer a aula de {instrumento} no dia {data} as {hora}? Me confirma aqui!' },
      { id: 'p2', label: 'Antecipado', text: 'Ola, {nome}! Passando para confirmar sua presenca na aula de {instrumento} em {data} as {hora}. Tudo certo?' },
    ],
  },
  {
    id: 'cobranca',
    label: 'Cobrança',
    icon: <CreditCard size={12} />,
    colorActive: 'bg-red-500/15 text-red-400 border-red-500/30',
    colorDot: 'bg-red-400',
    options: [
      { id: 'c1', label: 'Amigável', text: 'Ola, {nome}! Tudo bem? Passando para avisar que sua mensalidade de {instrumento} esta em aberto. Pode me chamar para acertar!' },
      { id: 'c2', label: 'Direto', text: 'Oi {nome}, mensalidade de {instrumento} em aberto. Pode realizar o pagamento e me enviar o comprovante. Obrigado!' },
    ],
  },
  {
    id: 'vencimento',
    label: 'Vencimento',
    icon: <Clock size={12} />,
    colorActive: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    colorDot: 'bg-amber-400',
    options: [
      { id: 'v1', label: 'Suave', text: 'Ola, {nome}! So um aviso: o vencimento da sua mensalidade de {instrumento} se aproxima (5 dias). Estou a disposicao!' },
      { id: 'v2', label: 'Com opções', text: 'Oi {nome}! Sua mensalidade de {instrumento} vence em 5 dias. Pode pagar via Pix ou dinheiro, como preferir!' },
    ],
  },
  {
    id: 'personalizado',
    label: 'Livre',
    icon: <PenLine size={12} />,
    colorActive: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    colorDot: 'bg-purple-400',
    options: [],
  },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getLessonDateLabel(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: '2-digit',
  });
}

function applyTemplate(tpl: string, lesson: Lesson, aluno: Aluno) {
  const vars: Record<string, string> = {
    nome: aluno.apelido || aluno.nome.split(' ')[0],
    instrumento: lesson.instrument,
    data: getLessonDateLabel(lesson.date),
    hora: formatTime(lesson.startTime),
  };
  return tpl.replace(/\{(nome|instrumento|data|hora)\}/g, (_, k: string) => vars[k] ?? '');
}

function isFutureLesson(lesson: Lesson, nowDate: string, nowTime: string) {
  if (lesson.date > nowDate) return true;
  if (lesson.date === nowDate && lesson.startTime > nowTime) return true;
  return false;
}

function reposicaoToLessons(r: ReposicaoDTO): Lesson[] {
  return r.alunos.map(a => ({
    id: `repo-${r.id}-${a.id}`,
    studentId: a.id,
    studentName: a.nome,
    studentPhone: '',
    type: 'individual' as const,
    instrument: 'Reposição',
    color: '#0891b2',
    notes: r.observacao ?? '',
    date: r.dataAula,
    startTime: r.horario,
    endTime: r.horario,
    status: 'rescheduled' as const,
    attendanceConfirmed: false,
    recorrente: false,
    meetLink: undefined,
    isOnline: false,
  }));
}

function dedupeLessonsById(lessons: Lesson[]): Lesson[] {
  const map = new Map<string, Lesson>();
  for (const lesson of lessons) {
    if (!map.has(lesson.id)) {
      map.set(lesson.id, lesson);
    }
  }
  return Array.from(map.values());
}

// ─── StudentCombobox (com portal para evitar clip por overflow-hidden) ────────

interface ComboboxProps {
  students: Aluno[];
  selectedId: string;
  onSelect: (id: string) => void;
}

function StudentCombobox({ students, selectedId, onSelect }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const selected = students.find(s => s.id === selectedId);
  const filtered = query
    ? students.filter(
        s =>
          s.nome.toLowerCase().includes(query.toLowerCase()) ||
          (s.apelido ?? '').toLowerCase().includes(query.toLowerCase()),
      )
    : students;

  // recalcula posição ao abrir
  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const r = buttonRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left, width: r.width });
  }, [open]);

  // fecha ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || dropRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="px-3 py-2.5 border-b border-(--border)">
      <button
        ref={buttonRef}
        onClick={() => setOpen(o => !o)}
        className="
          w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl
          bg-(--input-bg) border border-(--input-border)
          hover:border-(--accent-500)/50 transition-colors
          focus:outline-none focus:ring-2 focus:ring-(--accent-500)/25
        "
      >
        {selected ? (
          <>
            <Avatar name={selected.nome} size="sm" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-(--heading) truncate">{selected.nome}</p>
              <p className="text-xs text-(--muted) truncate">
                {selected.telefone ? formatPhoneGlobal(selected.telefone) : 'Sem telefone cadastrado'}
              </p>
            </div>
          </>
        ) : (
          <span className="flex-1 text-left text-sm text-(--muted)">Selecione um aluno...</span>
        )}
        <ChevronDown
          size={14}
          className={`text-(--muted) transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && createPortal(
        <AnimatePresence>
          <motion.div
            ref={dropRef}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
            className="bg-(--surface) border border-(--border) rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-(--border)">
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted) pointer-events-none" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar aluno..."
                  className="
                    w-full h-8 pl-8 pr-3 rounded-lg text-sm
                    bg-(--input-bg) border border-(--input-border)
                    text-(--text) placeholder:text-(--muted)
                    outline-none focus:ring-2 focus:ring-(--accent-500)/25
                  "
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-xs text-(--muted) text-center py-5">Nenhum aluno encontrado.</p>
              ) : (
                filtered.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { onSelect(s.id); setOpen(false); setQuery(''); }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left
                      ${s.id === selectedId ? 'bg-(--accent-500)/10' : 'hover:bg-(--hover-bg)'}
                    `}
                  >
                    <Avatar name={s.nome} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-(--heading) truncate">
                        {s.nome}
                        {s.apelido && (
                          <span className="text-(--muted) font-normal ml-1">({s.apelido})</span>
                        )}
                      </p>
                      <p className="text-xs text-(--muted) truncate">
                        {s.telefone ? formatPhoneGlobal(s.telefone) : 'Sem telefone'}
                      </p>
                    </div>
                    <span className={`shrink-0 w-2 h-2 rounded-full ${s.telefone ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}

// ─── painel de template + preview ────────────────────────────────────────────

function MessagePanel({
  lesson,
  student,
}: {
  lesson: Lesson | undefined;
  student: Aluno | undefined;
}) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('lembrete');
  const [selectedTemplateId, setSelectedTemplateId] = useState('l1');
  const [customText, setCustomText] = useState('');

  const currentCat = CATEGORIES.find(c => c.id === activeCategory)!;
  const templateText =
    activeCategory === 'personalizado'
      ? customText
      : currentCat.options.find(o => o.id === selectedTemplateId)?.text ?? '';

  const previewMessage =
    lesson && student && templateText.trim()
      ? applyTemplate(templateText, lesson, student)
      : '';

  function handleSelectCategory(id: TemplateCategory) {
    setActiveCategory(id);
    const cat = CATEGORIES.find(c => c.id === id);
    if (cat?.options.length) setSelectedTemplateId(cat.options[0].id);
  }

  function handleSend() {
    if (!student?.telefone || !previewMessage.trim()) return;
    const phone = phoneToWhatsApp(student.telefone);
    const url = `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(previewMessage)}&type=phone_number&app_absent=0`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-4 border-b border-(--border)">
        <h3 className="text-sm font-semibold text-(--heading)">Mensagem via WhatsApp</h3>
        <p className="text-xs text-(--muted) mt-0.5">Selecione um template e envie diretamente</p>
      </div>

      <div className="p-5 space-y-5">
        {/* categoria pills */}
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
                  transition-all whitespace-nowrap
                  ${isActive
                    ? cat.colorActive
                    : 'border-(--border) text-(--muted) hover:bg-(--hover-bg) hover:text-(--text)'
                  }
                `}
              >
                {cat.icon}
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* templates */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="space-y-2"
          >
            {activeCategory === 'personalizado' ? (
              <div className="space-y-2.5">
                <p className="text-[11px] text-(--muted)">
                  Variáveis:{' '}
                  {['{nome}', '{instrumento}', '{data}', '{hora}'].map(v => (
                    <code
                      key={v}
                      className="mx-0.5 px-1.5 py-0.5 rounded-md bg-(--input-bg) text-(--accent-500) font-mono text-[11px]"
                    >
                      {v}
                    </code>
                  ))}
                </p>
                <textarea
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  rows={4}
                  placeholder="Digite sua mensagem aqui..."
                  className="w-full rounded-xl border border-(--input-border) bg-(--input-bg) px-3 py-2.5 text-sm text-(--text) outline-none focus:ring-2 focus:ring-(--accent-500)/30 resize-none placeholder:text-(--muted)"
                />
              </div>
            ) : (
              currentCat.options.map(option => (
                <button
                  key={option.id}
                  onClick={() => setSelectedTemplateId(option.id)}
                  className={`
                    w-full text-left px-4 py-3 rounded-xl border transition-all flex items-start gap-3
                    ${selectedTemplateId === option.id
                      ? currentCat.colorActive
                      : 'border-(--border) hover:bg-(--hover-bg)'
                    }
                  `}
                >
                  <span className={`mt-0.5 shrink-0 w-2 h-2 rounded-full ${currentCat.colorDot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-(--heading)">{option.label}</span>
                      {selectedTemplateId === option.id && (
                        <span className="shrink-0 w-4 h-4 rounded-full bg-(--accent-500) flex items-center justify-center">
                          <ChevronRight size={9} className="text-white" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-(--muted) leading-relaxed line-clamp-2">{option.text}</p>
                  </div>
                </button>
              ))
            )}
          </motion.div>
        </AnimatePresence>

        {/* preview */}
        <div className="space-y-3 pt-1 border-t border-(--border)">
          <p className="text-[11px] font-semibold text-(--muted) uppercase tracking-wider">Prévia da mensagem</p>
          <div className="rounded-xl bg-(--input-bg) border border-(--border) px-4 py-3 min-h-[64px]">
            {previewMessage ? (
              <p className="text-sm text-(--text) whitespace-pre-wrap leading-relaxed">{previewMessage}</p>
            ) : (
              <p className="text-sm text-(--muted) italic">
                {!lesson
                  ? 'Selecione uma aula à esquerda.'
                  : !templateText.trim()
                  ? 'Escreva uma mensagem acima.'
                  : 'Selecione um template acima.'}
              </p>
            )}
          </div>

          {student && (
            <div className="flex items-center gap-2 text-xs text-(--muted)">
              <Phone size={11} className="text-(--accent-500) shrink-0" />
              <span>
                Para{' '}
                <strong className="text-(--text)">
                  {student.apelido || student.nome.split(' ')[0]}
                </strong>
                {student.telefone ? (
                  <span className="ml-1 opacity-70">{formatPhoneGlobal(student.telefone)}</span>
                ) : (
                  <span className="ml-1 text-amber-500"> · sem telefone</span>
                )}
              </span>
            </div>
          )}

          <Button
            className="w-full"
            disabled={!lesson || !student?.telefone || !previewMessage.trim()}
            onClick={handleSend}
          >
            <MessageCircle size={15} />
            Abrir WhatsApp
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ─── componente principal ─────────────────────────────────────────────────────

export function LessonAlertsPage() {
  const { appSettings } = useAppSettings();
  const { timezone } = appSettings;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('aula');

  // ── fetch próprio: hoje → +7 dias ──
  useEffect(() => {
    const today = new Date();
    const week = new Date(today);
    week.setDate(today.getDate() + 7);

    setLoading(true);
    Promise.all([
      buscarAulas(`${fmt(today)}T00:00:00`, `${fmt(week)}T23:59:59`),
      listarAlunos(),
      listarReposicoes(),
    ])
      .then(([dtos, alunos, repos]) => {
        const todayISO = fmt(today);
        const aulaLessons = dtos.map(toLesson);
        const repoLessons = repos
          .filter(r => r.dataAula >= todayISO && r.status === 'ABERTA' && r.alunos.length > 0)
          .flatMap(reposicaoToLessons);
        setLessons(dedupeLessonsById([...aulaLessons, ...repoLessons]));
        setStudents(alunos);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = getNowInTimezone(timezone);
  const nowDate = fmt(now);
  const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // ── modo Por Aula ──
  const allScheduled = useMemo(() => {
    return lessons
      .filter(l =>
        ACTIVE_STATUSES.includes(l.status as typeof ACTIVE_STATUSES[number]) &&
        isFutureLesson(l, nowDate, nowTime),
      )
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  }, [lessons, nowDate, nowTime]);

  const firstWithPhone = allScheduled.find(l => students.find(s => s.id === l.studentId)?.telefone);
  const [selectedLessonId, setSelectedLessonId] = useState('');

  // inicializa seleção quando dados carregam
  useEffect(() => {
    if (selectedLessonId === '' && allScheduled.length > 0) {
      setSelectedLessonId(firstWithPhone?.id ?? allScheduled[0].id);
    }
  }, [allScheduled, firstWithPhone, selectedLessonId]);

  const lessonModeLesson = useMemo(
    () => allScheduled.find(l => l.id === selectedLessonId),
    [selectedLessonId, allScheduled],
  );
  const lessonModeStudent = useMemo(
    () => students.find(s => s.id === lessonModeLesson?.studentId),
    [lessonModeLesson, students],
  );

  // ── modo Por Aluno ──
  const firstStudentWithPhone = useMemo(() =>
    students.find(s => s.telefone && lessons.some(l =>
      l.studentId === s.id && ACTIVE_STATUSES.includes(l.status as typeof ACTIVE_STATUSES[number]),
    )) ?? students.find(s => s.telefone) ?? students[0],
    [students, lessons],
  );

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStudentLessonId, setSelectedStudentLessonId] = useState('');

  useEffect(() => {
    if (selectedStudentId === '' && firstStudentWithPhone) {
      setSelectedStudentId(firstStudentWithPhone.id);
    }
  }, [firstStudentWithPhone, selectedStudentId]);

  const studentLessons = useMemo(() => {
    return lessons
      .filter(l =>
        l.studentId === selectedStudentId &&
        ACTIVE_STATUSES.includes(l.status as typeof ACTIVE_STATUSES[number]) &&
        isFutureLesson(l, nowDate, nowTime),
      )
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
      .slice(0, 8);
  }, [selectedStudentId, lessons, nowDate, nowTime]);

  function handleSelectStudent(id: string) {
    setSelectedStudentId(id);
    const list = lessons
      .filter(l =>
        l.studentId === id &&
        ACTIVE_STATUSES.includes(l.status as typeof ACTIVE_STATUSES[number]) &&
        isFutureLesson(l, nowDate, nowTime),
      )
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
    setSelectedStudentLessonId(list[0]?.id ?? '');
  }

  const studentModeLesson = useMemo(
    () => studentLessons.find(l => l.id === selectedStudentLessonId) ?? studentLessons[0],
    [selectedStudentLessonId, studentLessons],
  );
  const studentModeStudent = useMemo(
    () => students.find(s => s.id === selectedStudentId),
    [selectedStudentId, students],
  );

  const activeLesson = mode === 'aula' ? lessonModeLesson : studentModeLesson;
  const activeStudent = mode === 'aula' ? lessonModeStudent : studentModeStudent;
  const lessonsWithPhone = allScheduled.filter(l => students.find(s => s.id === l.studentId)?.telefone);

  const TABS = [
    { id: 'aula' as Mode, label: 'Por Aula', icon: <BookOpen size={13} /> },
    { id: 'aluno' as Mode, label: 'Por Aluno', icon: <Users size={13} /> },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-(--muted)">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Carregando aulas...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 items-start">

        {/* ── Coluna esquerda ── */}
        <div className="xl:col-span-2">
          {/* Card sem overflow-hidden para o combobox portal funcionar */}
          <div className="app-surface rounded-2xl border shadow-sm">

            {/* Tabs finas no topo */}
            <div className="flex rounded-t-2xl overflow-hidden border-b border-(--border)">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id)}
                  className={`
                    relative flex-1 flex items-center justify-center gap-1.5
                    px-4 py-3 text-xs font-semibold transition-colors
                    ${mode === tab.id
                      ? 'text-(--accent-500)'
                      : 'text-(--muted) hover:text-(--text) hover:bg-(--hover-bg)'
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                  {mode === tab.id && (
                    <motion.span
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                      style={{ background: 'var(--accent-500)' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Combobox (só no modo Por Aluno) FORA de overflow-hidden */}
            <AnimatePresence>
              {mode === 'aluno' && (
                <motion.div
                  key="combobox"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-visible"
                >
                  <StudentCombobox
                    students={students}
                    selectedId={selectedStudentId}
                    onSelect={handleSelectStudent}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cabeçalho da lista */}
            <div className="px-4 py-3 border-b border-(--border)">
              <p className="text-xs font-semibold text-(--heading)">
                {mode === 'aula' ? 'Aulas agendadas' : 'Aulas do aluno'}
              </p>
              <p className="text-[11px] text-(--muted) mt-0.5">
                {mode === 'aula'
                  ? `${lessonsWithPhone.length} de ${allScheduled.length} com WhatsApp`
                  : `${studentLessons.length} próximas agendadas`}
              </p>
            </div>

            {/* Lista de aulas */}
            <div className="divide-y divide-(--border) max-h-[460px] overflow-y-auto rounded-b-2xl">
              <AnimatePresence mode="wait">
                {mode === 'aula' ? (
                  <motion.div
                    key="aula-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    {allScheduled.length === 0 ? (
                      <div className="px-5 py-10 text-center text-sm text-(--muted)">
                        Nenhuma aula nos próximos 7 dias.
                      </div>
                    ) : (
                      allScheduled.map((lesson, i) => {
                        const aluno = students.find(s => s.id === lesson.studentId);
                        const hasPhone = Boolean(aluno?.telefone);
                        const isSelected = lesson.id === selectedLessonId;
                        return (
                          <motion.button
                            key={lesson.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02 }}
                            onClick={() => hasPhone && setSelectedLessonId(lesson.id)}
                            disabled={!hasPhone}
                            className={`
                              w-full text-left flex items-center gap-3 px-4 py-3 transition-colors relative
                              ${isSelected ? 'bg-(--accent-500)/8' : 'hover:bg-(--hover-bg)'}
                              ${!hasPhone ? 'opacity-40 cursor-not-allowed' : ''}
                            `}
                          >
                            {isSelected && (
                              <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-(--accent-500)" />
                            )}
                            <Avatar name={lesson.studentName} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-(--heading) truncate">
                                {lesson.studentName}
                              </p>
                              <p className="text-xs text-(--muted)">{lesson.instrument}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-medium text-(--text)">
                                {new Date(`${lesson.date}T00:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                              </p>
                              <p className="text-xs text-(--muted)">{formatTime(lesson.startTime)}</p>
                            </div>
                            <span className={`shrink-0 w-2 h-2 rounded-full ${hasPhone ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          </motion.button>
                        );
                      })
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="aluno-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    {studentLessons.length === 0 ? (
                      <div className="px-5 py-10 text-center text-sm text-(--muted)">
                        Nenhuma aula nos próximos 7 dias.
                      </div>
                    ) : (
                      studentLessons.map((lesson, i) => {
                        const isSelected = lesson.id === (studentModeLesson?.id ?? '');
                        const lessonDate = new Date(`${lesson.date}T00:00:00`);
                        return (
                          <motion.button
                            key={lesson.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => setSelectedStudentLessonId(lesson.id)}
                            className={`
                              w-full text-left flex items-center gap-3 px-4 py-3 transition-colors relative
                              ${isSelected ? 'bg-(--accent-500)/8' : 'hover:bg-(--hover-bg)'}
                            `}
                          >
                            {isSelected && (
                              <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-(--accent-500)" />
                            )}
                            <div
                              className={`
                                shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center text-center
                                ${isSelected ? 'bg-(--accent-500) text-white' : 'bg-(--input-bg) text-(--text)'}
                              `}
                            >
                              <span className={`text-[9px] font-bold uppercase leading-none ${isSelected ? 'text-white/70' : 'text-(--muted)'}`}>
                                {lessonDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                              </span>
                              <span className="text-sm font-black leading-tight">{lessonDate.getDate()}</span>
                              <span className={`text-[9px] font-bold uppercase leading-none ${isSelected ? 'text-white/70' : 'text-(--muted)'}`}>
                                {lessonDate.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-(--heading)">{lesson.instrument}</p>
                              <p className="text-xs text-(--muted)">
                                {formatTime(lesson.startTime)} {formatTime(lesson.endTime)}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="shrink-0 w-5 h-5 rounded-full bg-(--accent-500) flex items-center justify-center">
                                <CheckCircle2 size={11} className="text-white" />
                              </span>
                            )}
                          </motion.button>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Painel de mensagem (direita) ── */}
        <div className="xl:col-span-3">
          <MessagePanel lesson={activeLesson} student={activeStudent} />
        </div>
      </div>
    </div>
  );
}
