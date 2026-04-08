import type { ReactNode } from 'react';
import { cn } from '../../utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200/50',
  warning: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200/50',
  danger: 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border border-rose-200/50',
  info: 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border border-cyan-200/50',
  purple: 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200/50',
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
