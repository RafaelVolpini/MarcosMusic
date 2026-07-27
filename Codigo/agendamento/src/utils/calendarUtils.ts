export const HOUR_START = 7;
export const HOUR_END = 24;
export const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
export const CELL_HEIGHT = 64;

export function formatTime(time: string, lang: string): string {
  if (lang !== 'en') return time;
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const period = h < 12 ? 'AM' : 'PM';
  return `${h % 12 || 12}:${mStr} ${period}`;
}

export function formatHourLabel(hour: number, lang: string): string {
  if (lang !== 'en') return `${hour}:00`;
  const period = hour < 12 ? 'AM' : 'PM';
  return `${hour % 12 || 12} ${period}`;
}
