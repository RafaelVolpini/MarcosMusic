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
  const studentAvatarBg = 'linear-gradient(135deg, #0ea5e9, #2563eb)';

  return (
    <header className="app-surface h-16 flex items-center gap-4 px-6 border-b border-slate-200/60 shrink-0 relative z-20">
      {/* Page title */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold bg-linear-to-r from-slate-900 via-slate-700 to-slate-800 bg-clip-text text-transparent">{PAGE_LABELS[activePage]}</h1>
          <span className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full bg-(--accent-50) text-(--accent-600)">
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
              className="flex items-center gap-2 h-10 bg-slate-50 border border-slate-200 rounded-xl px-3"
            >
              <Search size={16} className="text-(--accent-600) shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar alunos..."
                className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button onClick={() => { setSearchOpen(false); setQuery(''); }} className="text-slate-400 hover:text-slate-600">
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
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-(--accent-600) transition-colors"
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
          className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-(--accent-600) transition-colors"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-white"
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
              className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-linear-to-r from-slate-50 to-white">
                <span className="text-sm font-bold text-slate-800">Notificações</span>
                {unreadCount > 0 && (
                  <span
                    className="text-xs text-white font-medium px-2.5 py-0.5 rounded-full"
                    style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                  >
                    {unreadCount} novas
                  </span>
                )}
              </div>
              <div className="divide-y divide-slate-50">
                {MOCK_NOTIFICATIONS.map(n => (
                  <div key={n.id} className={cn('px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors', n.unread && 'bg-(--accent-50)/70')}>
                    <div className="flex items-start gap-3">
                      {n.unread && (
                        <div
                          className="w-2 h-2 mt-1.5 shrink-0 rounded-full"
                          style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                        />
                      )}
                      {!n.unread && <div className="w-2 h-2 mt-1.5 shrink-0 rounded-full bg-transparent" />}
                      <div>
                        <p className="text-sm font-medium text-slate-800">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{n.time}</p>
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
          className="flex items-center gap-2 h-10 px-2 rounded-xl hover:bg-slate-50 transition-colors"
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
            <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name || 'Usuario'}</p>
            <p className="text-xs text-slate-400 leading-tight">{user.role === 'teacher' ? 'Professor' : 'Aluno'}</p>
          </div>
          <ChevronDown size={14} className={cn('text-slate-400 transition-transform', profileOpen && 'rotate-180')} />
        </button>

        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-800">{user.name || 'Usuario'}</p>
                  <Music size={12} className="text-(--accent-600)" />
                </div>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              {[
                { icon: <User size={14} />, label: 'Meu Perfil', color: 'text-[var(--accent-600)]' },
                { icon: <Music size={14} />, label: 'Minha Escola', color: 'text-teal-500' },
                { icon: <Settings size={14} />, label: 'Configurações', color: 'text-slate-500' },
              ].map(item => (
                <button key={item.label} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors group">
                  <span className={cn('transition-colors', item.color)}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <div className="border-t border-slate-100">
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
