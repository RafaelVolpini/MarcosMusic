import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Clock,
  FileText,
  Video,
  ExternalLink,
  CheckCircle,
  XCircle,
  RefreshCw,
  Music,
  Trash2,
} from "lucide-react";
import type { Lesson } from "../../types";
import type { AuthUser } from "../../lib/auth";
import {
  formatTime,
  formatDuration,
  timeToMinutes,
  minutesToTime,
  getNowInTimezone,
} from "../../utils";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";
import { useAppSettings } from "../../context/AppSettingsContext";
import { useToast } from "../ui/Toast";
import { useLanguage } from "../../context/LanguageContext";
import { regenerarMeetLink } from "../../services/aulaService";

interface LessonModalProps {
  lesson: Lesson | null;
  currentUser: AuthUser;
  onClose: () => void;
  onUpdate: (lesson: Lesson) => void;
  onDelete: (lessonId: string) => void;
  onReschedule?: (
    lessonId: string,
    dataInicio: string,
    dataFim: string,
  ) => Promise<void>;
  onConfirmPresence?: (lessonId: string) => Promise<void>;
}

export function LessonModal({
  lesson,
  currentUser,
  onClose,
  onUpdate,
  onDelete,
  onReschedule,
  onConfirmPresence,
}: LessonModalProps) {
  const [notes, setNotes] = useState("");
  const [meetLink, setMeetLink] = useState("");
  const [attendanceConfirmed, setAttendanceConfirmed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (!lesson) return;
    setNotes(lesson.notes ?? "");
    setMeetLink(lesson.meetLink ?? "");
    setAttendanceConfirmed(lesson.attendanceConfirmed ?? false);
    setEditing(false);
    setConfirmDelete(false);
    setRescheduling(false);
    setRescheduleDate(lesson.date);
    setRescheduleTime(lesson.startTime);
  }, [lesson]);

  // Hooks that must be called unconditionally (before any early return)
  const { appSettings } = useAppSettings();
  const toast = useToast();
  const { t } = useLanguage();

  const TYPE_LABELS: Record<string, string> = {
    individual: t('modals.lesson.types.individual'),
    group:      t('modals.lesson.types.group'),
    online:     t('modals.lesson.types.online'),
    trial:      t('modals.lesson.types.trial'),
  };

  const STATUS_BADGE: Record<string, { variant: 'success' | 'info' | 'danger' | 'warning' | 'default'; label: string }> = {
    scheduled:   { variant: 'info',    label: t('modals.lesson.status.scheduled') },
    completed:   { variant: 'success', label: t('modals.lesson.status.completed') },
    cancelled:   { variant: 'danger',  label: t('modals.lesson.status.cancelled') },
    rescheduled: { variant: 'warning', label: t('modals.lesson.status.rescheduled') },
  };

  if (!lesson) return null;

  const statusInfo = STATUS_BADGE[lesson.status];
  const duration = formatDuration(lesson.startTime, lesson.endTime);
  const canManageMeet = currentUser.role === "teacher";
  const LESSON_DURATION_MINUTES = 50;

  // Permissão: admin (teacher) pode tudo; aluno só pode agir na própria aula
  const isOwner =
    currentUser.role === "student" &&
    ((currentUser.id != null && lesson.studentId === currentUser.id) ||
      lesson.studentName.trim().toLowerCase() ===
        currentUser.name.trim().toLowerCase());
  const canModify = currentUser.role === "teacher" || isOwner;

  // Após confirmar presença o aluno perde a capacidade de cancelar/reagendar
  const isLockedByAttendance = attendanceConfirmed && currentUser.role !== "teacher";

  // Aula passada ou em andamento → modo somente leitura (timezone-aware)
  const nowDt = getNowInTimezone(appSettings.timezone);
  const todayStr = `${nowDt.getFullYear()}-${String(nowDt.getMonth()+1).padStart(2,'0')}-${String(nowDt.getDate()).padStart(2,'0')}`;
  const nowTimeStr = `${String(nowDt.getHours()).padStart(2, '0')}:${String(nowDt.getMinutes()).padStart(2, '0')}`;
  const isOngoing = lesson.date === todayStr && lesson.startTime <= nowTimeStr && lesson.endTime > nowTimeStr;
  const isPastLesson = lesson.date < todayStr || (lesson.date === todayStr && lesson.endTime <= nowTimeStr);
  const isReadOnly = isPastLesson || isOngoing;

  // Regra das 24h: aluno não pode cancelar/reagendar se faltam menos de 24h para o início
  const lessonStartDt = new Date(`${lesson.date}T${lesson.startTime}:00`);
  const deadlineDt = new Date(lessonStartDt.getTime() - 24 * 60 * 60 * 1000);
  const isWithin24h = currentUser.role !== "teacher" && nowDt >= deadlineDt;

  const ALL_HOURS = Array.from(
    { length: 17 },
    (_, i) => `${String(i + 7).padStart(2, "0")}:00`,
  );

  const availableHours =
    rescheduleDate === todayStr
      ? ALL_HOURS.filter((h) => h > nowTimeStr)
      : ALL_HOURS;

  const handleRescheduleConfirm = async () => {
    if (!rescheduleDate || !rescheduleTime) return;
    if (rescheduleDate < todayStr) {
      toast(t('modals.lesson.pastDateError'), 'error');
      return;
    }
    const endTime = minutesToTime(
      timeToMinutes(rescheduleTime) + LESSON_DURATION_MINUTES,
    );
    const dataInicio = `${rescheduleDate}T${rescheduleTime}:00`;
    const dataFim = `${rescheduleDate}T${endTime}:00`;
    await onReschedule?.(lesson.id, dataInicio, dataFim);
    setRescheduling(false);
  };

  const handleConfirmPresenceClick = () => {
    onConfirmPresence?.(lesson.id);
    setAttendanceConfirmed(true);
    toast('Presença confirmada com sucesso.', 'success');
  };

  const handleGenerateMeet = async () => {
    if (!canManageMeet || !lesson) return;
    setRegenerating(true);
    try {
      const updated = await regenerarMeetLink(String(lesson.id));
      const newLink = updated.meetLink ?? '';
      setMeetLink(newLink);
      onUpdate({ ...lesson, meetLink: newLink });
      toast('Link do Meet gerado com sucesso.', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao gerar link.', 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const handleSave = () => {
    onUpdate({
      ...lesson,
      notes,
      meetLink,
      attendanceConfirmed,
      attendanceConfirmedAt: attendanceConfirmed
        ? (lesson.attendanceConfirmedAt ?? new Date().toISOString())
        : undefined,
    });
    setEditing(false);
  };

  return (
    <AnimatePresence>
      {lesson && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none px-4"
          >
            <div className="app-surface rounded-3xl shadow-2xl w-full max-w-lg pointer-events-auto overflow-hidden">
              {/* Header with color accent */}
              <div
                className="h-2 rounded-t-3xl"
                style={{
                  background:
                    "linear-gradient(90deg, var(--accent-gradient-from), var(--accent-gradient-to))",
                }}
              />
              <div className="px-6 py-5 border-b border-(--border)">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </Badge>
                      <Badge variant="default">
                        {TYPE_LABELS[lesson.type]}
                      </Badge>
                    </div>
                    <h2 className="text-lg font-bold text-(--heading)">
                      {lesson.instrument}
                    </h2>
                    <p className="text-sm text-(--muted) mt-0.5">
                      {new Date(lesson.date).toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-(--muted) hover:text-(--text) hover:bg-(--hover-bg) transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Student & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow icon={<User size={14} />} label={t('modals.lesson.labelStudent')}>
                    <div className="flex items-center gap-2">
                      <Avatar name={lesson.studentName} size="sm" />
                      <span className="text-sm font-medium text-(--heading)">
                        {lesson.studentName}
                      </span>
                    </div>
                  </InfoRow>
                  <InfoRow icon={<Clock size={14} />} label={t('modals.lesson.labelTime')}>
                    <span className="text-sm text-(--heading)">
                      {formatTime(lesson.startTime)} –{" "}
                      {formatTime(lesson.endTime)}
                    </span>
                    <span className="text-xs text-(--muted) ml-1">
                      ({duration})
                    </span>
                  </InfoRow>
                </div>

                {/* Meet link */}
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow icon={<Video size={14} />} label={t('modals.lesson.labelLink')}>
                    {meetLink ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-(--accent-700) hover:underline flex items-center gap-1 truncate"
                        >
                          {meetLink.replace("https://", "")}
                          <ExternalLink size={12} className="shrink-0" />
                        </a>
                        {canManageMeet && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleGenerateMeet}
                            disabled={regenerating}
                          >
                            <RefreshCw size={12} />
                          </Button>
                        )}
                      </div>
                    ) : canManageMeet ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleGenerateMeet}
                        disabled={regenerating}
                      >
                        <Video size={12} />
                        {regenerating ? '...' : t('modals.lesson.generateMeet')}
                      </Button>
                    ) : null}
                  </InfoRow>
                  <InfoRow icon={<CheckCircle size={14} />} label={t('modals.lesson.labelAttendance')}>
                    {editing ? (
                      <label className="flex items-center gap-2 text-sm text-(--text)">
                        <input
                          type="checkbox"
                          checked={attendanceConfirmed}
                          onChange={(e) =>
                            setAttendanceConfirmed(e.target.checked)
                          }
                          className="rounded border-(--input-border)"
                        />
                        {t('modals.lesson.confirmed')}
                      </label>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        attendanceConfirmed
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {attendanceConfirmed ? t('modals.lesson.confirmed') : t('modals.lesson.pending')}
                      </span>
                    )}
                  </InfoRow>
                </div>

                {/* Notes */}
                <InfoRow icon={<FileText size={14} />} label={t('modals.lesson.labelNotes')}>
                  {editing ? (
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Adicionar observações sobre a aula..."
                      className="w-full text-sm border border-(--input-border) rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-(--accent-100) text-(--text) bg-(--input-bg)"
                    />
                  ) : (
                    <p className="text-sm text-(--text)">
                      {notes || (
                        <span className="text-(--muted) italic">
                          {t('modals.lesson.noNotes')}
                        </span>
                      )}
                    </p>
                  )}
                </InfoRow>

                {/* Recording */}
                {lesson.recording && (
                  <InfoRow icon={<Music size={14} />} label={t('modals.lesson.labelRecording')}>
                    <div className="flex items-center gap-2 bg-(--surface-soft) rounded-xl px-3 py-2">
                      <div className="w-8 h-8 rounded-lg bg-(--accent-50) flex items-center justify-center">
                        <Video size={14} className="text-(--accent-600)" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-(--heading) truncate">
                          {lesson.recording.title}
                        </p>
                        <p className="text-xs text-(--muted)">
                          {Math.floor(lesson.recording.duration / 60)} min
                        </p>
                      </div>
                      <a
                        href={lesson.recording.url}
                        className="text-(--accent-600) hover:text-(--accent-700)"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </InfoRow>
                )}
              </div>

              {/* Footer actions */}
              <div className="px-6 py-4 border-t border-(--border) flex items-center gap-2 flex-wrap">
                {rescheduling ? (
                  <div className="flex flex-col gap-3 w-full">
                    <p className="text-sm font-semibold text-(--heading)">
                      {t('modals.lesson.newTime')}
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={rescheduleDate}
                        min={todayStr}
                        onChange={(e) => {
                          const newDate = e.target.value;
                          setRescheduleDate(newDate);
                          if (newDate === todayStr) {
                            const avail = ALL_HOURS.filter((h) => h > nowTimeStr);
                            if (avail.length > 0 && rescheduleTime <= nowTimeStr) {
                              setRescheduleTime(avail[0]);
                            }
                          }
                        }}
                        className="flex-1 border border-(--input-border) rounded-xl px-3 py-2 text-sm text-(--text) bg-(--input-bg) focus:outline-none focus:ring-2 focus:ring-(--accent-100)"
                      />
                      <select
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className="flex-1 border border-(--input-border) rounded-xl px-3 py-2 text-sm text-(--text) bg-(--input-bg) focus:outline-none focus:ring-2 focus:ring-(--accent-100)"
                      >
                        {availableHours.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setRescheduling(false)}>
                        {t('modals.lesson.cancel')}
                      </Button>
                      <Button size="sm" onClick={handleRescheduleConfirm}>
                        <CheckCircle size={13} />
                        {t('modals.lesson.confirmReschedule')}
                      </Button>
                    </div>
                  </div>
                ) : !editing ? (
                  <>
                    {isReadOnly ? (
                      // Aula passada ou em andamento: apenas professor pode apagar
                      <>
                        {currentUser.role === "teacher" &&
                          (!confirmDelete ? (
                            <Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-50 ml-auto" onClick={() => setConfirmDelete(true)}>
                              <Trash2 size={13} />
                              {t('modals.lesson.deleteLesson')}
                            </Button>
                          ) : (
                            <div className="ml-auto flex items-center gap-2">
                              <span className="text-xs text-(--muted)">
                                {t('modals.lesson.deleteConfirmQ')}
                              </span>
                              <Button variant="danger" size="sm" onClick={() => onDelete(lesson.id)}>
                                {t('modals.lesson.deleteYes')}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                                {t('modals.lesson.no')}
                              </Button>
                            </div>
                          ))}
                        {currentUser.role !== "teacher" && (
                          <span className="text-xs text-(--muted) italic">
                            {t('modals.lesson.readOnly')}
                          </span>
                        )}
                      </>
                    ) : (
                      // Aula futura: controles completos
                      <>
                        {currentUser.role === "teacher" && (
                          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                            {t('modals.lesson.edit')}
                          </Button>
                        )}
                        {lesson.status !== "cancelled" && canModify && !isLockedByAttendance && !isWithin24h && (
                          <Button variant="ghost" size="sm" onClick={() => setRescheduling(true)}>
                            <RefreshCw size={13} />
                            {t('modals.lesson.reschedule')}
                          </Button>
                        )}
                        {lesson.status === "scheduled" &&
                          !attendanceConfirmed &&
                          canModify &&
                          currentUser.role !== "teacher" && (
                            <Button variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-50" onClick={handleConfirmPresenceClick}>
                              <CheckCircle size={13} />
                              {t('modals.lesson.confirmPresence')}
                            </Button>
                          )}
                        {lesson.status === "scheduled" && attendanceConfirmed && (
                          <span className="text-xs text-emerald-600 flex items-center gap-1">
                            <CheckCircle size={12} /> {t('modals.lesson.presenceConfirmed')}
                          </span>
                        )}
                        {isWithin24h && !isLockedByAttendance && canModify && (
                          <span className="text-xs text-(--muted) italic ml-auto">
                            Cancelamento bloqueado — menos de 24h para a aula
                          </span>
                        )}
                        {isLockedByAttendance && (
                          <span className="text-xs text-(--muted) italic ml-auto">
                            {t('modals.lesson.lockedByAttendance')}
                          </span>
                        )}
                        {!canModify && (
                          <span className="text-xs text-(--muted) italic">
                            {t('modals.lesson.readOnly')}
                          </span>
                        )}
                        {canModify && !isLockedByAttendance && !isWithin24h &&
                          (!confirmDelete ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-500 hover:bg-rose-50 ml-auto"
                              onClick={() => setConfirmDelete(true)}
                            >
                              <XCircle size={13} />
                              {t('modals.lesson.deleteLesson')}
                            </Button>
                          ) : (
                            <div className="ml-auto flex items-center gap-2">
                              <span className="text-xs text-(--muted)">
                                {t('modals.lesson.deleteConfirmQ')}
                              </span>
                              <Button variant="danger" size="sm" onClick={() => onDelete(lesson.id)}>
                                {t('modals.lesson.deleteYes')}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfirmDelete(false)}
                              >
                                Não
                              </Button>
                            </div>
                          ))}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                      {t('modals.lesson.cancel')}
                    </Button>
                    <Button size="sm" onClick={handleSave} className="ml-auto">
                      <CheckCircle size={13} />
                      {t('modals.lesson.save')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Info Row Helper ──────────────────────────────────────────────────────────

interface InfoRowProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}

function InfoRow({ icon, label, children }: InfoRowProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-(--muted)">{icon}</span>
        <span className="text-xs font-medium text-(--muted) uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="ml-5">{children}</div>
    </div>
  );
}
