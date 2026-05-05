// ─── Shared helpers and constants for Reposição components ──────────────────

export const DAY_LABELS: Record<string, string> = {
  seg: 'Segunda', ter: 'Terça', qua: 'Quarta', qui: 'Quinta',
  sex: 'Sexta', sab: 'Sábado', dom: 'Domingo',
};

export const STATUS_LABEL: Record<string, string> = {
  ABERTA: 'Aberta', REALIZADA: 'Realizada', CANCELADA: 'Cancelada',
};

export const STATUS_COLOR: Record<string, string> = {
  ABERTA:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  REALIZADA: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
  CANCELADA: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
};

export const DAY_NUM: Record<string, number> = {
  dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6,
};

export function getThisWeek(): { weekStart: string; weekEnd: string } {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { weekStart: fmt(monday), weekEnd: fmt(sunday) };
}

export function thisWeekDate(dayKey: string): string | null {
  const target = DAY_NUM[dayKey] ?? 1;
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  const slotDate = new Date(monday);
  const offsetFromMonday = target === 0 ? 6 : target - 1;
  slotDate.setDate(monday.getDate() + offsetFromMonday);
  slotDate.setHours(0, 0, 0, 0);
  const todayMidnight = new Date(today);
  todayMidnight.setHours(0, 0, 0, 0);
  if (slotDate < todayMidnight) return null;
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return fmt(slotDate);
}

export function normalizeName(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}
