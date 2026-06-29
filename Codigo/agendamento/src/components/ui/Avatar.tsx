import { cn } from '../../utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const sizeMap = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

const GRADIENT_COLORS = [
  'from-indigo-400 to-purple-600',
  'from-cyan-400 to-blue-600',
  'from-teal-400 to-emerald-600',
  'from-amber-400 to-orange-600',
  'from-rose-400 to-pink-600',
  'from-violet-400 to-indigo-600',
  'from-fuchsia-400 to-purple-600',
  'from-lime-400 to-emerald-600',
];

function pickGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENT_COLORS[Math.abs(hash) % GRADIENT_COLORS.length];
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const gradient = pickGradient(name);
  return (
    <div className={cn(
      'rounded-full bg-linear-to-br flex items-center justify-center text-white font-semibold shrink-0',
      gradient,
      sizeMap[size],
      className,
    )}>
      {getInitials(name)}
    </div>
  );
}
