import type { Lesson, WeeklyAvailability, DayKey } from '../types';
import type { CalendarResponseDTO } from '../services/aulaService';

// ─── AulaAluno (template semanal) ─────────────────────────────────────────────

export interface AulaAlunoDTO {
  dia: number;          // 1=Segunda … 7=Domingo (Java DayOfWeek)
  horarioInicio: string; // "HH:mm" ou "HH:mm:ss"
  horarioFim: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extrai "HH:mm" de strings como "09:00" ou "09:00:00". */
function toHHMM(timeStr: string): string {
  return timeStr.slice(0, 5);
}

/** Converte java.time.LocalDateTime serializado para data ISO (YYYY-MM-DD). */
function isoToDate(isoStr: string): string {
  // O Jackson serializa LocalDateTime como "2026-04-22T09:00:00"
  return isoStr.slice(0, 10);
}

/** Extrai "HH:mm" de uma string ISO-8601. */
function isoToTime(isoStr: string): string {
  return isoStr.slice(11, 16);
}

// Mapa de dia Java (1=SEG … 7=DOM) → DayKey do frontend
const JAVA_DAY_TO_KEY: Record<number, DayKey> = {
  1: 'seg',
  2: 'ter',
  3: 'qua',
  4: 'qui',
  5: 'sex',
  6: 'sab',
  7: 'dom',
};

// ─── toLesson ─────────────────────────────────────────────────────────────────

/**
 * Converte CalendarResponseDTO (backend) → Lesson (frontend).
 *
 * Campos não fornecidos pelo backend (studentName, teacherName, etc.)
 * recebem defaults explícitos e serão preenchidos quando o backend
 * expandir o CalendarResponseDTO (ver relatório de endpoints faltantes).
 */
export function toLesson(dto: CalendarResponseDTO): Lesson {
  return {
    id: String(dto.id),

    // ── Campos vindos do backend ──────────────────────────────────────────────
    studentId: dto.idAluno ?? '',
    studentName: dto.nomeAluno ?? 'Aluno',
    studentPhone: '',
    type: 'individual',
    instrument: 'Piano',
    color: '#7c3aed',
    notes: '',

    date: isoToDate(dto.dataInicio),
    startTime: isoToTime(dto.dataInicio),
    endTime: isoToTime(dto.dataFim),

    status: dto.flagRealizada ? 'completed' : dto.flagCancelada ? 'cancelled' : 'scheduled',
    attendanceConfirmed: dto.presencaConfirmada ?? false,
    recorrente: dto.recorrente ?? false,
    meetLink: dto.meetLink ?? undefined,
    isOnline: dto.isOnline ?? false,
  };
}

// ─── toWeeklyAvailability ─────────────────────────────────────────────────────

/**
 * Converte lista de AulaAluno (templates semanais) → WeeklyAvailability.
 * Cada slot é arredondado para a hora cheia (o calendário exibe por hora).
 */
export function toWeeklyAvailability(horarios: AulaAlunoDTO[]): WeeklyAvailability {
  const result: WeeklyAvailability = {
    seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [],
  };

  for (const h of horarios) {
    const key = JAVA_DAY_TO_KEY[h.dia];
    if (!key) continue;

    const slot = `${toHHMM(h.horarioInicio).slice(0, 2)}:00`;
    if (!result[key].includes(slot)) {
      result[key].push(slot);
    }
  }

  // Ordena os slots de cada dia
  for (const key of Object.keys(result) as DayKey[]) {
    result[key].sort();
  }

  return result;
}
