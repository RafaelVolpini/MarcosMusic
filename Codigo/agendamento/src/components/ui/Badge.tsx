import type { ReactNode } from 'react';
import { cn } from '../../utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-(--surface-soft) text-(--text)',
  success: 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200/50 dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-400 dark:border-emerald-900/50',
  warning: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200/50 dark:from-amber-950 dark:to-orange-950 dark:text-amber-400 dark:border-amber-900/50',
  danger: 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border border-rose-200/50 dark:from-rose-950 dark:to-pink-950 dark:text-rose-400 dark:border-rose-900/50',
  info: 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border border-cyan-200/50 dark:from-cyan-950 dark:to-blue-950 dark:text-cyan-400 dark:border-cyan-900/50',
  purple: 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200/50 dark:from-indigo-950 dark:to-purple-950 dark:text-indigo-400 dark:border-indigo-900/50',
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

export function Badge({ children, variant = 'default', className, dot }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full',
      variantClasses[variant],
      className,
    )}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
