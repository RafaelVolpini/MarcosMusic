import type { ReactNode } from 'react';
import { cn } from '../../utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className, onClick, hoverable }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'app-surface rounded-2xl border shadow-sm',
        hoverable && 'cursor-pointer hover:shadow-lg hover:border-(--accent-500)/30 transition-all duration-300',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  color?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, color = 'purple' }: StatCardProps) {
  const colorConfig: Record<string, { bg: string; icon: string; iconBg: string; gradient: string }> = {
    purple: {
      bg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      icon: 'text-white',
      iconBg: 'bg-white/20',
      gradient: 'from-indigo-500 to-purple-600',
    },
    blue: {
      bg: 'bg-gradient-to-br from-cyan-500 to-blue-600',
      icon: 'text-white',
      iconBg: 'bg-white/20',
      gradient: 'from-cyan-500 to-blue-600',
    },
    green: {
      bg: 'bg-gradient-to-br from-teal-400 to-emerald-600',
      icon: 'text-white',
      iconBg: 'bg-white/20',
      gradient: 'from-teal-400 to-emerald-600',
    },
    yellow: {
      bg: 'bg-gradient-to-br from-amber-400 to-orange-500',
      icon: 'text-white',
      iconBg: 'bg-white/20',
      gradient: 'from-amber-400 to-orange-500',
    },
    red: {
      bg: 'bg-gradient-to-br from-rose-500 to-pink-600',
      icon: 'text-white',
      iconBg: 'bg-white/20',
      gradient: 'from-rose-500 to-pink-600',
    },
  };

  const config = colorConfig[color] ?? colorConfig.purple;

  return (
    <div
      className={cn('relative overflow-hidden rounded-2xl p-5', color === 'purple' ? '' : config.bg)}
      style={color === 'purple' ? { background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' } : undefined}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-white/80 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-white/60 mt-0.5">{subtitle}</p>}
          {trend && (
            <p className={cn(
              'text-xs mt-2 font-semibold px-2 py-0.5 rounded-full inline-block',
              trend.positive ? 'bg-emerald-400/20 text-emerald-50' : 'bg-rose-400/20 text-rose-50',
            )}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', config.iconBg, config.icon)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
