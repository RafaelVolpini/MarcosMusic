import { Plus } from 'lucide-react';

export function CalendarCellOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100 cursor-pointer bg-(--accent-icon-bg) pointer-events-none" />
      <Plus size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none text-(--accent-600)" />
    </>
  );
}
