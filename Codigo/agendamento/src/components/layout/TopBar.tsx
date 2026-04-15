import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, ChevronDown, Music, X, Settings, LogOut, User } from 'lucide-react';
import type { Page } from '../../types';
import { cn } from '../../utils';
import marcosPhoto from '../../assets/image.png';
import type { AuthUser } from '../../lib/auth';

const PAGE_LABELS: Record<Page, string> = {
  dashboard: 'Dashboard',
  aboutMe: 'Sobre Mim',
  agenda: 'Agenda',
  students: 'Alunos',
  rooms: 'Calendario de Disponibilidade',
  rescheduling: 'Reagendamentos',
  video: 'Aulas Online & Vídeos',
  lessonAlerts: 'Alertar Aula',
  settings: 'Configurações',
};

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Aula em 30 min', message: 'Pedro Alves - Piano às 10:00', time: '2h atrás', unread: true },
  { id: 'n2', title: 'Pagamento em atraso', message: 'Gabriel Mendes - R$ 480,00 vencido', time: '1d atrás', unread: true },
  { id: 'n3', title: 'Nova mensagem', message: 'Thiago: "Preciso reagendar minha aula"', time: '2d atrás', unread: false },
];

interface TopBarProps {
  activePage: Page;
  user: AuthUser;
  onLogout: () => void;
}

export function TopBar({ activePage, user, onLogout }: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState('');

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.unread).length;
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.trim().toUpperCase() || user.email.slice(0, 2).toUpperCase();
  const studentAvatarBg = 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))';

  return (
    <header className="app-surface h-16 flex items-center gap-4 px-6 border-b border-[var(--border)] shrink-0 relative z-20">
      {/* Page title */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[var(--heading)]">{PAGE_LABELS[activePage]}</h1>
          <span className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full bg-[var(--accent-icon-bg)] text-[var(--accent-icon-fg)]">
            <Music size={13} />
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <AnimatePresence initial={false}>
          {searchOpen ? (
            <motion.div
              key="search-expanded"
              initial={{ width: 40, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="flex items-center gap-2 h-10 bg-[var(--surface-soft)] border border-[var(--input-border)] rounded-xl px-3"
            >
              <Search size={16} className="text-(--accent-600) shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar alunos..."
                className="flex-1 bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
              />
              <button onClick={() => { setSearchOpen(false); setQuery(''); }} className="text-[var(--muted)] hover:text-[var(--text)]">
                <X size={14} />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="search-icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-[var(--muted)] hover:bg-[var(--hover-bg)] hover:text-(--accent-600) transition-colors"
            >
              <Search size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
          className="relative w-10 h-10 flex items-center justify-center rounded-xl text-[var(--muted)] hover:bg-[var(--hover-bg)] hover:text-(--accent-600) transition-colors"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-[var(--surface)]"
              style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
            />
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-80 bg-[var(--dropdown-bg)] rounded-2xl shadow-2xl border border-[var(--dropdown-border)] overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-soft)]">
                <span className="text-sm font-bold text-[var(--heading)]">Notificações</span>
                {unreadCount > 0 && (
                  <span
                    className="text-xs text-white font-medium px-2.5 py-0.5 rounded-full"
                    style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                  >
                    {unreadCount} novas
                  </span>
                )}
              </div>
              <div className="divide-y divide-[var(--border)]">
                {MOCK_NOTIFICATIONS.map(n => (
                  <div key={n.id} className={cn('px-4 py-3 hover:bg-[var(--hover-bg)] cursor-pointer transition-colors', n.unread && 'bg-[var(--accent-50)]/30')}>
                    <div className="flex items-start gap-3">
                      {n.unread && (
                        <div
                          className="w-2 h-2 mt-1.5 shrink-0 rounded-full"
                          style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                        />
                      )}
                      {!n.unread && <div className="w-2 h-2 mt-1.5 shrink-0 rounded-full bg-transparent" />}
                      <div>
                        <p className="text-sm font-medium text-[var(--heading)]">{n.title}</p>
                        <p className="text-xs text-[var(--muted)] mt-0.5">{n.message}</p>
                        <p className="text-xs text-[var(--muted)] mt-1 opacity-70">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
          className="flex items-center gap-2 h-10 px-2 rounded-xl hover:bg-[var(--hover-bg)] transition-colors"
        >
          <div
            className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-lg ring-2 ring-(--accent-100)"
            style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
          >
            {user.role === 'teacher' ? (
              <img src={marcosPhoto} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold" style={{ background: studentAvatarBg }}>
                {initials}
              </div>
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-[var(--heading)] leading-tight">{user.name || 'Usuario'}</p>
            <p className="text-xs text-[var(--muted)] leading-tight">{user.role === 'teacher' ? 'Professor' : 'Aluno'}</p>
          </div>
          <ChevronDown size={14} className={cn('text-[var(--muted)] transition-transform', profileOpen && 'rotate-180')} />
        </button>

        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-56 bg-[var(--dropdown-bg)] rounded-2xl shadow-2xl border border-[var(--dropdown-border)] overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-soft)]">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[var(--heading)]">{user.name || 'Usuario'}</p>
                  <Music size={12} className="text-(--accent-600)" />
                </div>
                <p className="text-xs text-[var(--muted)]">{user.email}</p>
              </div>
              {[
                { icon: <User size={14} />, label: 'Meu Perfil', color: 'text-[var(--accent-600)]' },
                { icon: <Music size={14} />, label: 'Minha Escola', color: 'text-[var(--accent-icon-fg)]' },
                { icon: <Settings size={14} />, label: 'Configurações', color: 'text-[var(--muted)]' },
              ].map(item => (
                <button key={item.label} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--hover-bg)] transition-colors group">
                  <span className={cn('transition-colors', item.color)}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <div className="border-t border-[var(--border)]">
                <button
                  onClick={onLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors font-medium"
                >
                  <LogOut size={14} />
                  Sair
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Backdrop for dropdowns */}
      {(notifOpen || profileOpen) && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => { setNotifOpen(false); setProfileOpen(false); }}
        />
      )}
    </header>
  );
}
