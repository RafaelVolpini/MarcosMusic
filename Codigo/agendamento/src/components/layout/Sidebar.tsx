import { motion, AnimatePresence } from 'framer-motion';
import {
  Disc3,
  CalendarDays,
  Users,
  CalendarClock,
  RefreshCw,
  Music,
  MessageCircle,
  Settings,
  ChevronLeft,
  Gamepad2,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { Page } from '../../types';
import { cn } from '../../utils';
import marcosPhoto from '../../assets/image.png';
import type { AuthUser } from '../../lib/auth';

interface NavItem {
  id: Page;
  label: string;
  icon: ReactNode;
  color: string;
  roles: Array<'teacher' | 'student'>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',       icon: <Disc3 size={20} />,           color: 'var(--accent-500)', roles: ['teacher'] },
  { id: 'aboutMe',      label: 'Sobre Mim',       icon: <Gamepad2 size={20} />,        color: '#6366f1', roles: ['teacher', 'student'] },
  { id: 'agenda',       label: 'Agenda',          icon: <CalendarDays size={20} />,    color: '#14b8a6', roles: ['teacher', 'student'] },
  { id: 'students',     label: 'Alunos',          icon: <Users size={20} />,           color: '#f59e0b', roles: ['teacher'] },
  { id: 'rooms',        label: 'Calendario',      icon: <CalendarClock size={20} />,   color: '#8b5cf6', roles: ['teacher'] },
  { id: 'rescheduling', label: 'Reagendamentos',  icon: <RefreshCw size={20} />,       color: '#ec4899', roles: ['teacher', 'student'] },
  { id: 'video',        label: 'Aulas Online',    icon: <Music size={20} />,           color: '#06b6d4', roles: ['teacher', 'student'] },
  { id: 'lessonAlerts', label: 'Alertar Aula',    icon: <MessageCircle size={20} />,   color: '#22c55e', roles: ['teacher'] },
  { id: 'settings',     label: 'Configurações',   icon: <Settings size={20} />,        color: '#64748b', roles: ['teacher', 'student'] },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activePage: Page;
  onNavigate: (page: Page) => void;
  user: AuthUser;
}

export function Sidebar({ collapsed, onToggle, activePage, onNavigate, user }: SidebarProps) {
  const visibleNavItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.trim().toUpperCase() || user.email.slice(0, 2).toUpperCase();
  const studentAvatarBg = 'linear-gradient(135deg, #0ea5e9, #2563eb)';

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-full bg-slate-900 overflow-hidden z-10 shrink-0"
    >
      {/* Gradient accent line */}
      <div
        className="absolute inset-y-0 right-0 w-0.5"
        style={{ background: 'linear-gradient(180deg, var(--accent-gradient-from) 0%, var(--accent-gradient-to) 100%)' }}
      />

      {/* Logo / brand */}
      <div className="flex items-center gap-3 px-5 py-6">
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="flex items-center justify-center w-11 h-11 rounded-2xl text-white shrink-0 shadow-lg"
          style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from) 0%, var(--accent-gradient-to) 100%)' }}
        >
          <Disc3 size={22} />
        </motion.div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="font-bold text-white leading-tight tracking-tight text-lg whitespace-nowrap">Musga</p>
              <p className="text-xs text-slate-400 whitespace-nowrap">Gestão de Aulas</p>
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
      <div className="p-3 border-t border-slate-800">
        {/* Mini profile */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-3 rounded-xl bg-linear-to-r from-slate-800 to-slate-800/50 border border-slate-700/50"
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
                    <p className="text-sm font-medium text-white truncate">{user.name || 'Usuario'}</p>
                    <Music size={11} className="text-(--accent-300) shrink-0" />
                  </div>
                  <p className="text-xs text-slate-400 truncate">{user.role === 'teacher' ? 'Professor' : 'Aluno'}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle button */}
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center justify-center gap-2 w-full rounded-xl h-10 text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200',
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
          ? 'bg-white/10 text-white' 
          : 'text-slate-400 hover:text-white hover:bg-white/5',
      )}
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
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"
        style={{ backgroundColor: item.color }}
      />

      {/* Icon with color */}
      <div 
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 shrink-0',
          active ? 'bg-white/10' : 'bg-slate-800 group-hover:bg-slate-700',
        )}
        style={{ 
          boxShadow: active ? `0 0 20px ${item.color}30` : 'none',
        }}
      >
        <span style={{ color: active ? item.color : 'currentColor' }}>
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
