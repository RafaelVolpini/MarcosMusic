import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
}

const variantClasses = {
  primary: 'text-white shadow-lg hover:brightness-105 active:brightness-95',
  secondary: 'bg-(--surface) text-(--text) border border-(--border) hover:bg-(--hover-bg) hover:border-(--accent-500)/40 shadow-sm',
  ghost: 'text-(--muted) hover:bg-(--hover-bg) hover:text-(--text)',
  danger: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 shadow-lg shadow-rose-500/25',
};

const sizeClasses = {
  sm: 'text-xs px-3 h-8 rounded-lg gap-1.5',
  md: 'text-sm px-4 h-10 rounded-xl gap-2',
  lg: 'text-sm px-6 h-11 rounded-xl gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading,
  className,
  disabled,
  type = 'button',
  ...props
}: ButtonProps & { type?: 'button' | 'submit' | 'reset' }) {
  const style = variant === 'primary'
    ? ({ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' } as const)
    : undefined;

  const isDisabled = Boolean(disabled || loading);

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading ? true : undefined}
      aria-disabled={isDisabled}
      style={style}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          <span className="sr-only">Carregando...</span>
        </>
      ) : children}
    </button>
  );
}
