import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChevronDown, Music, Settings, LogOut, User, MessageSquare } from 'lucide-react';
import { ChatPanel } from '../modals/ChatPanel';
import { chatService } from '../../services/chatService';
import { notificacaoService, type NotificacaoDTO } from '../../services/notificacaoService';
import { chatBus } from '../../lib/chatBus';
import type { Page } from '../../types';
import { cn } from '../../utils';
import type { AuthUser } from '../../lib/auth'; 
import marcosPhoto from '../../assets/image.png';
import { useLanguage } from '../../context/LanguageContext';

interface TopBarProps {
  activePage: Page;
  user: AuthUser;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
}

export function TopBar({ activePage, user, onLogout, onNavigate }: TopBarProps) {
  const { lang, setLang, t } = useLanguage();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatNaoLidas, setChatNaoLidas] = useState(0);
  const [notifications, setNotifications] = useState<NotificacaoDTO[]>([]);
  const [notifNaoLidas, setNotifNaoLidas] = useState(0);
  const [chatTargetAlunoId, setChatTargetAlunoId] = useState<string | undefined>();

  const dest = user.role === 'teacher' ? 'PROFESSOR' : (user.id ?? '');
  const remetente = user.role === 'teacher' ? 'professor' : 'aluno';

  // ── Chat não lidas ────────────────────────────────────────────────────────
  const refreshChatNaoLidas = useCallback(async () => {
    try {
      const total = await chatService.naoLidas(remetente as 'professor' | 'aluno');
      setChatNaoLidas(total);
    } catch { /* silencia */ }
  }, [remetente]);

  // ── Notificações ──────────────────────────────────────────────────────────
  const refreshNotificacoes = useCallback(async () => {
    if (!dest) return;
    try {
      const [lista, total] = await Promise.all([
        notificacaoService.listar(dest),
        notificacaoService.naoLidas(dest),
      ]);
      setNotifications(lista);
      setNotifNaoLidas(total);
    } catch { /* silencia */ }
  }, [dest]);

  // Polling inicial + periódico
  useEffect(() => {
    refreshChatNaoLidas();
    const id1 = setInterval(refreshChatNaoLidas, 10000);
    return () => clearInterval(id1);
  }, [refreshChatNaoLidas]);

  useEffect(() => {
    refreshNotificacoes();
    const id2 = setInterval(refreshNotificacoes, 10000);
    return () => clearInterval(id2);
  }, [refreshNotificacoes]);

  // Atualiza ao mudar de aba / retornar ao foco
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshChatNaoLidas();
        refreshNotificacoes();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refreshChatNaoLidas, refreshNotificacoes]);

  // Atualiza ao navegar entre páginas
  useEffect(() => {
    refreshChatNaoLidas();
    refreshNotificacoes();
  }, [activePage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escuta pedidos de abertura de chat de outras páginas (ex: StudentsPage)
  useEffect(() => {
    return chatBus.listen((alunoId) => {
      setChatTargetAlunoId(alunoId);
      setChatOpen(true);
      setNotifOpen(false);
      setProfileOpen(false);
    });
  }, []);

  // Ao abrir painel de notificações, marca todas como lidas
  const handleOpenNotif = async () => {
    setNotifOpen(v => !v);
    setProfileOpen(false);
    setChatOpen(false);
    if (!notifOpen && dest) {
      try {
        await notificacaoService.marcarTodasLidas(dest);
        setNotifNaoLidas(0);
        setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
      } catch { /* silencia */ }
    }
  };

  const PAGE_LABELS: Record<Page, string> = {
    dashboard:    t('pages.dashboard'),
    agenda:       t('pages.agenda'),
    students:     t('pages.students'),
    rooms:        t('pages.rooms'),
    rescheduling: t('pages.rescheduling'),
    video:        t('pages.video'),
    lessonAlerts: t('pages.lessonAlerts'),
    settings:     t('pages.settings'),
    profile:      t('pages.profile'),
    credits:      'Créditos',
  };

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.trim().toUpperCase() || user.email.slice(0, 2).toUpperCase();
  const studentAvatarBg = 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))';

  return (
    <header className="app-surface h-16 flex items-center gap-4 px-6 border-b border-(--border) shrink-0 relative z-50">
      {/* Page title */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-(--heading)">{PAGE_LABELS[activePage]}</h1>
          <span className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full bg-(--accent-icon-bg) text-(--accent-icon-fg)">
            <Music size={13} />
          </span>
        </div>
      </div>

      {/* Language toggle */}
      <div className="flex items-center bg-(--surface-soft) border border-(--border) rounded-xl p-0.5">
        {(['pt', 'en'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            title={l === 'pt' ? 'Português' : 'English'}
            className={cn(
              'relative px-2 h-7 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5',
              lang === l ? 'text-(--heading)' : 'text-(--muted) hover:text-(--text)',
            )}
          >
            {/* Sliding active pill */}
            {lang === l && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 rounded-lg bg-(--surface) shadow-sm"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <span className="overflow-hidden" style={{ display: 'inline-block', width: '1.25rem', textAlign: 'center' }}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={l}
                    initial={{ opacity: 0, y: -8, rotateX: 90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: 8, rotateX: -90 }}
                    transition={{ duration: 0.2, type: 'spring', bounce: 0.35 }}
                    className="leading-none block"
                    style={{ transformOrigin: 'center', display: 'block' }}
                  >
                    <img
                      src={l === 'pt' ? 'https://flagcdn.com/24x18/br.png' : 'https://flagcdn.com/24x18/us.png'}
                      width={20}
                      height={15}
                      alt={l === 'pt' ? 'Português' : 'English'}
                      className="rounded-sm object-cover"
                      style={{ display: 'inline-block' }}
                    />
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="hidden sm:inline">{l === 'pt' ? 'PT' : 'EN'}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Chat */}
      <div className="relative">
        <button
          aria-label={t('topbar.chat')}
          aria-expanded={chatOpen}
          onClick={() => { setChatOpen(v => !v); setNotifOpen(false); setProfileOpen(false); }}
          className="relative w-10 h-10 flex items-center justify-center rounded-xl text-[var(--muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--accent-600)] transition-colors cursor-pointer"
        >
          <MessageSquare size={18} />
          {chatNaoLidas > 0 && (
            <span
              className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[9px] font-bold text-white px-0.5 ring-2 ring-(--surface)"
              style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
            >
              {chatNaoLidas > 99 ? '99+' : chatNaoLidas}
            </span>
          )}
        </button>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          aria-label={t('topbar.notif')}
          aria-expanded={notifOpen}
          onClick={handleOpenNotif}
          className="relative w-10 h-10 flex items-center justify-center rounded-xl text-[var(--muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--accent-600)] transition-colors cursor-pointer"
        >
          <Bell size={18} />
          {notifNaoLidas > 0 && (
            <span
              className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[9px] font-bold text-white px-0.5 ring-2 ring-(--surface)"
              style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
            >
              {notifNaoLidas > 99 ? '99+' : notifNaoLidas}
            </span>
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-80 z-50 bg-(--dropdown-bg) rounded-2xl shadow-2xl border border-(--dropdown-border) overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-(--border) flex items-center justify-between bg-(--surface-soft)">
                <span className="text-sm font-bold text-(--heading)">{t('topbar.notif')}</span>
                {notifNaoLidas > 0 && (
                  <span
                    className="text-xs text-white font-medium px-2.5 py-0.5 rounded-full"
                    style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                  >
                    {t('topbar.newNotif').replace('{n}', String(notifNaoLidas))}
                  </span>
                )}
              </div>
              <div className="divide-y divide-(--border) max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs" style={{ color: 'var(--muted)' }}>
                    {lang === 'pt' ? 'Nenhuma notificação ainda.' : 'No notifications yet.'}
                  </div>
                ) : (
                  notifications.slice(0, 20).map(n => (
                    <div key={n.id} className={cn('px-4 py-3 hover:bg-(--hover-bg) cursor-pointer transition-colors', !n.lida && 'bg-(--accent-50)/30')}>
                      <div className="flex items-start gap-3">
                        {!n.lida ? (
                          <div
                            className="w-2 h-2 mt-1.5 shrink-0 rounded-full"
                            style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                          />
                        ) : (
                          <div className="w-2 h-2 mt-1.5 shrink-0 rounded-full bg-transparent" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-(--heading) truncate">{n.titulo}</p>
                          <p className="text-xs text-(--muted) mt-0.5 leading-relaxed">{n.mensagem}</p>
                          <p className="text-xs text-(--muted) mt-1 opacity-70">
                            {new Date(n.criadaEm).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          aria-label={t('topbar.profile')}
          aria-expanded={profileOpen}
          onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); setChatOpen(false); }}
          className="flex items-center gap-2 h-10 px-2 rounded-xl hover:bg-(--hover-bg) transition-colors"
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
            <p className="text-sm font-semibold text-(--heading) leading-tight">{user.name || 'Usuario'}</p>
            <p className="text-xs text-(--muted) leading-tight">{user.role === 'teacher' ? t('topbar.professor') : t('topbar.student')}</p>
          </div>
          <ChevronDown size={14} className={cn('text-(--muted) transition-transform', profileOpen && 'rotate-180')} />
        </button>

        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-56 z-60 bg-(--dropdown-bg) rounded-2xl shadow-2xl border border-(--dropdown-border) overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-(--border) bg-(--surface-soft)">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-(--heading)">{user.name || 'Usuario'}</p>
                  <Music size={12} className="text-(--accent-600)" />
                </div>
                <p className="text-xs text-(--muted)">{user.email}</p>
              </div>
              {[
                { icon: <User size={14} />, label: t('topbar.myProfile'), color: 'text-(--accent-600)', roles: ['teacher', 'student'] as AuthUser['role'][], action: () => { sessionStorage.setItem('marcos-music:settings:section', 'profile'); onNavigate('settings'); } },
                { icon: <Settings size={14} />, label: t('topbar.settings'), color: 'text-(--muted)', roles: ['teacher'] as AuthUser['role'][], action: () => onNavigate('settings') },
              ].filter(item => item.roles.includes(user.role)).map(item => (
                <button key={item.label} onClick={() => { setProfileOpen(false); item.action(); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-(--text) hover:bg-(--hover-bg) transition-colors group">
                  <span className={cn('transition-colors', item.color)}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <div className="border-t border-(--border)">
                <button
                  onClick={() => { setProfileOpen(false); onLogout(); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors font-medium"
                >
                  <LogOut size={14} />
                  {t('topbar.logout')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Backdrop for dropdowns */}
      {(notifOpen || profileOpen) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => { setNotifOpen(false); setProfileOpen(false); }}
        />
      )}

      {/* Chat panel (fora do header, mas abaixo dos modais) */}
      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        currentUser={user}
        onUnreadChange={refreshChatNaoLidas}
        defaultChatAlunoId={chatTargetAlunoId}
        onDefaultChatHandled={() => setChatTargetAlunoId(undefined)}
      />
    </header>
  );
}
