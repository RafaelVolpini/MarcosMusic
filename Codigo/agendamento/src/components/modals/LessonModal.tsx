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
} from "lucide-react";
import type { Lesson } from "../../types";
import type { AuthUser } from "../../lib/auth";
import {
  formatTime,
  formatDuration,
  generateMeetLink,
  timeToMinutes,
  minutesToTime,
} from "../../utils";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";

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

const TYPE_LABELS: Record<string, string> = {
  individual: "Individual",
  group: "Em grupo",
  online: "Online",
  trial: "Experimental",
};

const STATUS_BADGE: Record<
  string,
  {
    variant: "success" | "info" | "danger" | "warning" | "default";
    label: string;
  }
> = {
  scheduled: { variant: "info", label: "Agendada" },
  completed: { variant: "success", label: "Concluída" },
  cancelled: { variant: "danger", label: "Cancelada" },
  rescheduled: { variant: "warning", label: "Reagendada" },
};

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
  const ALL_HOURS = Array.from(
    { length: 17 },
    (_, i) => `${String(i + 7).padStart(2, "0")}:00`,
  );

  const handleRescheduleConfirm = async () => {
    if (!rescheduleDate || !rescheduleTime) return;
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
  };

  const handleGenerateMeet = () => {
    if (!canManageMeet) return;
    const link = generateMeetLink();
    setMeetLink(link);
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4"
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
              <div className="px-6 py-5 border-b border-[var(--border)]">
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
                    <h2 className="text-lg font-bold text-[var(--heading)]">
                      {lesson.instrument}
                    </h2>
                    <p className="text-sm text-[var(--muted)] mt-0.5">
                      {new Date(lesson.date).toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover-bg)] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Student & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow icon={<User size={14} />} label="Aluno">
                    <div className="flex items-center gap-2">
                      <Avatar name={lesson.studentName} size="sm" />
                      <span className="text-sm font-medium text-[var(--heading)]">
                        {lesson.studentName}
                      </span>
                    </div>
                  </InfoRow>
                  <InfoRow icon={<Clock size={14} />} label="Horário">
                    <span className="text-sm text-[var(--heading)]">
                      {formatTime(lesson.startTime)} –{" "}
                      {formatTime(lesson.endTime)}
                    </span>
                    <span className="text-xs text-[var(--muted)] ml-1">
                      ({duration})
                    </span>
                  </InfoRow>
                </div>

                {/* Meet link */}
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow icon={<Video size={14} />} label="Link da Aula">
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

                        {editing && canManageMeet && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setMeetLink("")}
                          >
                            <X size={12} />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleGenerateMeet}
                        disabled={!canManageMeet}
                      >
                        <Video size={12} />
                        Gerar link Meet
                      </Button>
                    )}
                  </InfoRow>
                  <InfoRow icon={<CheckCircle size={14} />} label="Presença">
                    {editing ? (
                      <label className="flex items-center gap-2 text-sm text-[var(--text)]">
                        <input
                          type="checkbox"
                          checked={attendanceConfirmed}
                          onChange={(e) =>
                            setAttendanceConfirmed(e.target.checked)
                          }
                          className="rounded border-[var(--input-border)]"
                        />
                        Confirmada
                      </label>
                    ) : (
                      <span className="text-sm text-[var(--heading)]">
                        {attendanceConfirmed ? "Confirmada" : "Pendente"}
                      </span>
                    )}
                  </InfoRow>
                </div>

                {/* Notes */}
                <InfoRow icon={<FileText size={14} />} label="Observações">
                  {editing ? (
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Adicionar observações sobre a aula..."
                      className="w-full text-sm border border-[var(--input-border)] rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-(--accent-100) text-[var(--text)] bg-[var(--input-bg)]"
                    />
                  ) : (
                    <p className="text-sm text-[var(--text)]">
                      {notes || (
                        <span className="text-[var(--muted)] italic">
                          Sem observações
                        </span>
                      )}
                    </p>
                  )}
                </InfoRow>

                {/* Recording */}
                {lesson.recording && (
                  <InfoRow icon={<Music size={14} />} label="Gravação">
                    <div className="flex items-center gap-2 bg-[var(--surface-soft)] rounded-xl px-3 py-2">
                      <div className="w-8 h-8 rounded-lg bg-(--accent-50) flex items-center justify-center">
                        <Video size={14} className="text-(--accent-600)" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--heading)] truncate">
                          {lesson.recording.title}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
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
              <div className="px-6 py-4 border-t border-[var(--border)] flex items-center gap-2 flex-wrap">
                {rescheduling ? (
                  <div className="flex flex-col gap-3 w-full">
                    <p className="text-sm font-semibold text-[var(--heading)]">
                      Novo horário
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="flex-1 border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] bg-[var(--input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-100)]"
                      />
                      <select
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className="flex-1 border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] bg-[var(--input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-100)]"
                      >
                        {ALL_HOURS.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRescheduling(false)}
                      >
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={handleRescheduleConfirm}>
                        <CheckCircle size={13} />
                        Confirmar reagendamento
                      </Button>
                    </div>
                  </div>
                ) : !editing ? (
                  <>
                    {currentUser.role === "teacher" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditing(true)}
                      >
                        Editar
                      </Button>
                    )}
                    {lesson.status !== "cancelled" && canModify && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRescheduling(true)}
                      >
                        <RefreshCw size={13} />
                        Reagendar
                      </Button>
                    )}
                    {lesson.status === "scheduled" &&
                      !attendanceConfirmed &&
                      canModify && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-600 hover:bg-emerald-50"
                          onClick={handleConfirmPresenceClick}
                        >
                          <CheckCircle size={13} />
                          Confirmar presença
                        </Button>
                      )}
                    {lesson.status === "scheduled" && attendanceConfirmed && (
                      <span className="text-xs text-emerald-600 flex items-center gap-1">
                        <CheckCircle size={12} /> Presença confirmada
                      </span>
                    )}
                    {!canModify && (
                      <span className="text-xs text-[var(--muted)] italic">
                        Somente visualização
                      </span>
                    )}
                    {canModify &&
                      (!confirmDelete ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-500 hover:bg-rose-50 ml-auto"
                          onClick={() => setConfirmDelete(true)}
                        >
                          <XCircle size={13} />
                          Cancelar aula
                        </Button>
                      ) : (
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-xs text-[var(--muted)]">
                            Tem certeza?
                          </span>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(lesson.id)}
                          >
                            Sim, cancelar
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
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing(false)}
                    >
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSave} className="ml-auto">
                      <CheckCircle size={13} />
                      Salvar
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
        <span className="text-[var(--muted)]">{icon}</span>
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="ml-5">{children}</div>
    </div>
  );
}
