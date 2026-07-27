import { CELL_HEIGHT } from '../../utils/calendarUtils';

export function NowLine({ minuteOffset }: { minuteOffset: number }) {
  return (
    <div
      className="absolute left-0 right-0 z-40 pointer-events-none flex items-center"
      style={{ top: `${Math.round((minuteOffset / 60) * CELL_HEIGHT)}px` }}
    >
      <div className="w-2 h-2 rounded-full shrink-0 bg-red-500" />
      <div className="flex-1 h-px bg-red-500 opacity-75" />
    </div>
  );
}
