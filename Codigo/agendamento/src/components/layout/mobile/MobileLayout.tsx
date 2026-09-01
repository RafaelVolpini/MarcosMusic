import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Grid, Settings, CreditCard, LogOut } from 'lucide-react';
import type { AuthUser } from '../../../lib/auth';
import type { Page } from '../../../types';

interface MobileLayoutProps {
  children: ReactNode;
  activePage: Page;
  onNavigate: (page: Page) => void;
  user: AuthUser | null;
  onLogout: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

export function MobileLayout({
  children,
  activePage,
  onNavigate,
  user,
  onLogout,
}: MobileLayoutProps) {
  const isTeacher = user?.role === 'teacher';

  const navItems = isTeacher
    ? [
        { id: 'dashboard', icon: Grid, label: 'Início' },
        { id: 'agenda', icon: Calendar, label: 'Agenda' },
        { id: 'students', icon: Users, label: 'Alunos' },
        { id: 'settings', icon: Settings, label: 'Config' },
      ]
    : [
        { id: 'agenda', icon: Calendar, label: 'Agenda' },
        { id: 'credits', icon: CreditCard, label: 'Créditos' },
        { id: 'settings', icon: Settings, label: 'Perfil' },
      ];

  return (
    <div className="flex h-[100dvh] flex-col bg-(--bg) text-(--text)">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-(--border) bg-(--surface) px-4">
        <h1 className="text-lg font-semibold capitalize text-(--heading)">
          {activePage === 'dashboard' ? 'Início' : activePage === 'agenda' ? 'Calendário' : activePage}
        </h1>
        <button
          onClick={onLogout}
          className="flex h-8 w-8 items-center justify-center rounded-full text-(--muted) transition-colors hover:bg-(--hover-bg) hover:text-rose-500"
          title="Sair"
          aria-label="Sair"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="flex h-16 shrink-0 items-center justify-around border-t border-(--border) bg-(--surface) pb-safe">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
             <button
              key={item.id}
              onClick={() => onNavigate(item.id as Page)}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
                isActive ? 'text-(--accent-600)' : 'text-(--muted) hover:text-(--text)'
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-(--accent-600)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
