import { RefreshCw } from 'lucide-react';
import { cn } from '../../utils';
import { timeToMinutes } from '../../utils';
import type { ReposicaoDTO } from '../../services/reposicaoService';
import { useLanguage } from '../../context/LanguageContext';
import { formatTime } from './CalendarView';

export interface ReposicaoBlockProps {
  reposicao: ReposicaoDTO;
  hourStart: number;
  cellHeight: number;
  onClick?: (e: React.MouseEvent) => void;
}

export function ReposicaoBlock({ reposicao, hourStart, cellHeight, onClick }: ReposicaoBlockProps) {
  const { t, lang } = useLanguage();
  const startMins = timeToMinutes(reposicao.horario);
  const offsetMins = startMins - hourStart * 60;
  const top = (offsetMins / 60) * cellHeight;
  const height = Math.max((50 / 60) * cellHeight - 2, 24);

  const count = reposicao.alunos.length;
  const isFull = count >= 1; // visual hint when slots are taken

  return (
    <div
      onClick={onClick}
      className={cn(
        'absolute left-1 right-1 rounded-lg overflow-hidden select-none z-20 transition-all duration-150 group/repos',
        'border border-dashed',
        onClick ? 'cursor-pointer hover:z-30' : 'cursor-default',
        isFull
          ? 'border-(--accent-400) bg-[color-mix(in_srgb,var(--accent-500)_10%,var(--surface))]'
          : 'border-(--border) bg-(--surface-soft)',
      )}
      style={{ top: `${top}px`, height: `${height}px` }}
    >
      {/* Status stripe uses accent gradient so it adapts to the theme */}
      <div
        className="absolute left-0 inset-y-0 w-[3px]"
        style={{ background: 'linear-gradient(180deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
      />

      {/* Content */}
      <div className="flex items-center gap-1 pl-2 pr-1 h-full min-w-0">
        <RefreshCw size={9} className="shrink-0 text-(--accent-600) opacity-70" />
        <p className="text-[10px] font-semibold truncate text-(--accent-700) leading-tight">
          {t('calendar.makeUp')}
        </p>
        {height > 30 && count > 0 && (
          <span className="ml-auto shrink-0 text-[9px] font-medium text-(--muted)">
            {count}↑
          </span>
        )}
      </div>

      {/* Hover tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-none z-50 opacity-0 group-hover/repos:opacity-100 transition-opacity duration-150 flex flex-col items-center">
        <div className="px-2 py-0.5 rounded text-[9px] font-semibold border shadow-md whitespace-nowrap bg-(--surface) border-(--border) text-(--text)">
          {t('calendar.makeUp')} · {formatTime(reposicao.horario, lang)} · {count} {count !== 1 ? t('calendar.students') : t('calendar.student')}
        </div>
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-(--border)" />
      </div>
    </div>
  );
}
