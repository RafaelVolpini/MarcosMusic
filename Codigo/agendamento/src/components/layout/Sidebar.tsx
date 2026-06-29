import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Users,
  CalendarClock,
  RefreshCw,
  PlayCircle,
  MessageCircle,
  Settings,
  ChevronLeft,
  LayoutDashboard,
  Music2,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { Page } from '../../types';
import { cn } from '../../utils';
import marcosPhoto from '../../assets/image.png';
import type { AuthUser } from '../../lib/auth';
import { MarcosLogoMark } from '../ui/MarcosLogo';
import { useLanguage } from '../../context/LanguageContext';

interface NavItem {
  id: Page;
  label: string;
  icon: ReactNode;
  color: string;
  roles: Array<'teacher' | 'student'>;
}

function getNavItems(t: (k: string) => string): NavItem[] {
  return [
    { id: 'dashboard',    label: t('nav.dashboard'),    icon: <LayoutDashboard size={20} />, color: 'var(--accent-500)', roles: ['teacher'] },
    { id: 'agenda',       label: t('nav.agenda'),       icon: <CalendarDays size={20} />,    color: 'var(--accent-500)', roles: ['teacher', 'student'] },
    { id: 'rooms',        label: t('nav.rooms'),        icon: <CalendarClock size={20} />,   color: 'var(--accent-500)', roles: ['teacher'] },
    { id: 'rescheduling', label: t('nav.rescheduling'), icon: <RefreshCw size={20} />,       color: 'var(--accent-500)', roles: ['teacher', 'student'] },
    { id: 'video',        label: t('nav.video'),        icon: <PlayCircle size={20} />,      color: 'var(--accent-500)', roles: ['teacher', 'student'] },
    { id: 'lessonAlerts', label: t('nav.lessonAlerts'), icon: <MessageCircle size={20} />,   color: 'var(--accent-500)', roles: ['teacher'] },
    { id: 'students',     label: t('nav.students'),     icon: <Users size={20} />,           color: 'var(--accent-500)', roles: ['teacher'] },
    { id: 'settings',     label: t('nav.settings'),     icon: <Settings size={20} />,        color: 'var(--accent-500)', roles: ['teacher', 'student'] },
  ];
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activePage: Page;
  onNavigate: (page: Page) => void;
  user: AuthUser;
}

export function Sidebar({ collapsed, onToggle, activePage, onNavigate, user }: SidebarProps) {
  const { t } = useLanguage();
  const visibleNavItems = getNavItems(t).filter((item) => item.roles.includes(user.role));
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.trim().toUpperCase() || user.email.slice(0, 2).toUpperCase();
  const studentAvatarBg = 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))';

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-full overflow-hidden z-10 shrink-0 bg-(--surface) border-r border-(--border)"
    >
      {/* Gradient accent line */}
      <div
        className="absolute inset-y-0 right-0 w-0.5"
        style={{ background: 'linear-gradient(180deg, var(--accent-gradient-from) 0%, var(--accent-gradient-to) 100%)' }}
      />

      {/* Logo / brand */}
      <div className="flex items-center gap-3 px-4 py-5">
        <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} className="shrink-0">
          <MarcosLogoMark size={40} />
        </motion.div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden leading-none"
            >
              <p className="font-black text-(--heading) tracking-tight text-sm whitespace-nowrap">Marcos Music</p>
              <p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--accent-600)' }}>Agenda</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden">
        <div className="space-y-1">
          {visibleNavItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={activePage === item.id}
              collapsed={collapsed}
              onClick={() => onNavigate(item.id)}
            />
          ))}
        </div>
      </nav>

      {/* User card & toggle */}
      <div className="p-3 border-t border-(--border)">
        {/* Mini profile */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-3 rounded-xl bg-(--surface-soft) border border-(--border)"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-lg ring-2 ring-white/15"
                  style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from) 0%, var(--accent-gradient-to) 100%)' }}
                >
                  {user.role === 'teacher' ? (
                    <img src={marcosPhoto} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold" style={{ background: studentAvatarBg }}>
                      {initials}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-(--heading) truncate">{user.name || 'Usuario'}</p>
                    <Music2 size={11} style={{ color: 'var(--accent-600)' }} className="shrink-0" />
                  </div>
                  <p className="text-xs text-(--muted) truncate">{user.role === 'teacher' ? 'Professor' : 'Aluno'}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle button */}
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center justify-center gap-2 w-full rounded-xl h-10 text-(--muted) hover:text-(--text) hover:bg-(--hover-bg) transition-all duration-200',
            collapsed && 'w-10 mx-auto',
          )}
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          <motion.div 
            animate={{ rotate: collapsed ? 180 : 0 }} 
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft size={18} />
          </motion.div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-xs font-medium whitespace-nowrap overflow-hidden"
              >
                Recolher menu
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}

// ─── NavButton ──────────────────────────────────────────────────────────────

interface NavButtonProps {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

function NavButton({ item, active, collapsed, onClick }: NavButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative flex items-center gap-3 rounded-xl transition-all duration-200 w-full text-left overflow-hidden group',
        'px-3 h-12',
        active
          ? 'text-(--heading)'
          : 'text-(--muted) hover:text-(--text) hover:bg-(--hover-bg)',
      )}
      style={active ? { backgroundColor: 'var(--accent-icon-bg)' } : {}}
      title={collapsed ? item.label : undefined}
    >
      {/* Active indicator */}
      {active && (
        <motion.div
          layoutId="nav-active"
          className="absolute left-0 inset-y-2 w-1 rounded-full"
          style={{ backgroundColor: item.color }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
        style={{ backgroundColor: `color-mix(in srgb, ${item.color} 8%, transparent)` }}
      />

      {/* Icon with color */}
      <div
        className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 shrink-0"
        style={{
          backgroundColor: active
            ? `color-mix(in srgb, ${item.color} 20%, var(--surface))`
            : 'var(--accent-icon-bg)',
          boxShadow: active
            ? `0 0 16px color-mix(in srgb, ${item.color} 40%, transparent)`
            : 'none',
        }}
      >
        <span style={{ color: item.color }}>
          {item.icon}
        </span>
      </div>

      {/* Label */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className="text-sm font-medium whitespace-nowrap overflow-hidden"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Active badge */}
      {active && !collapsed && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-auto w-2 h-2 rounded-full"
          style={{ backgroundColor: item.color }}
        />
      )}
    </motion.button>
  );
}
