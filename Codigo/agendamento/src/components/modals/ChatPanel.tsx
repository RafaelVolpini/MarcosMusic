import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, MessageSquare, Loader2, Plus, Search, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService, type ChatDTO } from '../../services/chatService';
import { listarAlunos } from '../../services/alunoService';
import type { Aluno } from '../../types';
import { ChatConversationView } from './ChatConversationView';
import type { AuthUser } from '../../lib/auth';
import { useLanguage } from '../../context/LanguageContext';
import professorPhoto from '../../assets/image.jpg';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
  onUnreadChange?: () => void;
  /** When set, the panel auto-opens the chat with this aluno (professor only) */
  defaultChatAlunoId?: string;
  onDefaultChatHandled?: () => void;
}

function initials(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function ChatPanel({ isOpen, onClose, currentUser, onUnreadChange, defaultChatAlunoId, onDefaultChatHandled }: ChatPanelProps) {
  const { t } = useLanguage();
  const [chats, setChats] = useState<ChatDTO[]>([]);
  const [chatAtivo, setChatAtivo] = useState<ChatDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'chats' | 'picker'>('chats');
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [pickerQuery, setPickerQuery] = useState('');
  const [pickerLoading, setPickerLoading] = useState(false);
  const [starting, setStarting] = useState<string | null>(null); // alunoId being started
  const isProfessor = currentUser.role === 'teacher';

  const carregarChats = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) setLoading(true);
      if (isProfessor) {
        const lista = await chatService.listar();
        setChats(lista);
        // Atualiza chatAtivo com os dados mais recentes sem forçar re-mount
        setChatAtivo(prev => prev ? (lista.find(c => c.id === prev.id) ?? prev) : null);
      } else if (currentUser.id) {
        // Aluno: inicia/busca o próprio chat diretamente
        const chat = await chatService.porAluno(currentUser.id);
        setChats([chat]);
        setChatAtivo(prev => prev ?? chat);
      }
    } catch {
      // silencia erros de polling
    } finally {
      if (!silencioso) setLoading(false);
    }
  }, [isProfessor, currentUser.id]);

  // Carrega ao abrir e polling a cada 5s
  useEffect(() => {
    if (!isOpen) return;
    carregarChats();
    const id = setInterval(() => carregarChats(true), 5000);
    return () => clearInterval(id);
  }, [isOpen, carregarChats]);

  // Ao fechar, reseta estado
  useEffect(() => {
    if (!isOpen) {
      if (isProfessor) setChatAtivo(null);
      setView('chats');
      setPickerQuery('');
    }
  }, [isOpen, isProfessor]);

  // Aluno: entra direto na conversa assim que tiver chat
  useEffect(() => {
    if (!isProfessor && chats.length > 0 && chatAtivo === null) {
      setChatAtivo(chats[0]);
    }
  }, [isProfessor, chats, chatAtivo]);

  // Quando o professor clica no botão de chat de um aluno específico (via chatBus)
  useEffect(() => {
    if (!defaultChatAlunoId || !isProfessor) return;
    setView('chats');
    chatService.iniciar(defaultChatAlunoId)
      .then(chat => { setChatAtivo(chat); carregarChats(true); })
      .catch(() => {})
      .finally(() => onDefaultChatHandled?.());
  }, [defaultChatAlunoId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Carrega alunos ao entrar no picker
  useEffect(() => {
    if (view !== 'picker') return;
    setPickerLoading(true);
    listarAlunos()
      .then(lista => setAlunos(lista))
      .catch(() => setAlunos([]))
      .finally(() => setPickerLoading(false));
  }, [view]);

  const handleSelectChat = (chat: ChatDTO) => setChatAtivo(chat);

  const handleBack = () => {
    if (view === 'picker') { setView('chats'); setPickerQuery(''); return; }
    if (!isProfessor) { onClose(); return; } // aluno não tem lista  volta fecha o painel
    setChatAtivo(null);
    carregarChats(true);
    onUnreadChange?.();
  };

  const handleUnreadChange = () => {
    carregarChats(true);
    onUnreadChange?.();
  };

  const handleStartChatWithAluno = async (aluno: Aluno) => {
    setStarting(aluno.id);
    try {
      const chat = await chatService.iniciar(aluno.id);
      await carregarChats(true);
      setView('chats');
      setPickerQuery('');
      setChatAtivo(chat);
    } catch { /* silencia */ } finally {
      setStarting(null);
    }
  };

  const handleAlunoIniciarChat = async () => {
    if (!currentUser.id) return;
    setLoading(true);
    try {
      const chat = await chatService.porAluno(currentUser.id);
      setChats([chat]);
      setChatAtivo(chat);
    } catch { /* silencia */ } finally {
      setLoading(false);
    }
  };

  const filteredAlunos = alunos.filter(a =>
    a.nome.toLowerCase().includes(pickerQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(pickerQuery.toLowerCase())
  );

  // Alunos que já têm chat (para indicar na lista do picker)
  const alunosComChat = new Set(chats.map(c => c.alunoId));

  // Para aluno, sempre está no subview (sem lista de chats)
  const isInSubview = chatAtivo !== null || view === 'picker' || !isProfessor;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="chat-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-150"
            onClick={onClose}
            style={{ background: 'transparent' }}
          />

          {/* Painel deslizante */}
          <motion.div
            key="chat-panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-80 z-151 flex flex-col shadow-2xl"
            style={{ backgroundColor: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2">
                {isInSubview ? (
                  <button onClick={handleBack} className="p-1 rounded-lg transition-colors hover:opacity-70 cursor-pointer" style={{ color: 'var(--muted)' }}>
                    <ChevronLeft size={18} />
                  </button>
                ) : (
                  <MessageSquare size={16} style={{ color: 'var(--accent-600)' }} />
                )}
                {!isProfessor && chatAtivo && (
                  <img
                    src={professorPhoto}
                    alt="Professor"
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                )}
                <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                  {!isProfessor
                    ? 'Professor Marcos'
                    : chatAtivo
                      ? chatAtivo.alunoNome
                      : view === 'picker'
                        ? 'Nova conversa'
                        : t('chat.title')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {/* Botão "+" para professor abrir picker */}
                {isProfessor && !isInSubview && (
                  <button
                    onClick={() => setView('picker')}
                    title="Nova conversa"
                    className="p-1.5 rounded-lg transition-colors hover:opacity-70 cursor-pointer"
                    style={{ color: 'var(--accent-600)' }}
                  >
                    <Plus size={16} />
                  </button>
                )}
                <button onClick={onClose} className="p-1 rounded-lg transition-colors hover:opacity-70 cursor-pointer" style={{ color: 'var(--muted)' }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-h-0">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={22} className="animate-spin" style={{ color: 'var(--accent-600)' }} />
                </div>
              ) : chatAtivo ? (
                /* ── Conversa aberta ── */
                <ChatConversationView
                  key={chatAtivo.id}
                  chat={chatAtivo}
                  currentUser={currentUser}
                  onUnreadChange={handleUnreadChange}
                  professorPhoto={!isProfessor ? professorPhoto : undefined}
                />
              ) : view === 'picker' ? (
                /* ── Picker de alunos (professor) ── */
                <div className="flex flex-col h-full">
                  {/* Search */}
                  <div className="px-3 py-2 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
                      <input
                        autoFocus
                        value={pickerQuery}
                        onChange={e => setPickerQuery(e.target.value)}
                        placeholder="Buscar aluno..."
                        className="w-full h-8 pl-7 pr-3 text-xs rounded-lg"
                        style={{
                          background: 'var(--input-bg)',
                          border: '1px solid var(--input-border)',
                          color: 'var(--text)',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                  {/* List */}
                  <div className="flex-1 overflow-y-auto">
                    {pickerLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent-600)' }} />
                      </div>
                    ) : filteredAlunos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full gap-2 px-6 text-center">
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>Nenhum aluno encontrado.</p>
                      </div>
                    ) : (
                      filteredAlunos.map(aluno => (
                        <button
                          key={aluno.id}
                          onClick={() => handleStartChatWithAluno(aluno)}
                          disabled={starting === aluno.id}
                          className="flex items-center gap-3 w-full px-4 py-3 text-left border-b transition-colors hover:opacity-80 disabled:opacity-60 cursor-pointer"
                          style={{ borderColor: 'var(--border)', backgroundColor: 'transparent' }}
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                            style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                          >
                            {initials(aluno.nome)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{aluno.nome}</p>
                            {alunosComChat.has(aluno.id) && (
                              <p className="text-[10px]" style={{ color: 'var(--accent-600)' }}>Conversa existente</p>
                            )}
                          </div>
                          {starting === aluno.id
                            ? <Loader2 size={14} className="animate-spin shrink-0" style={{ color: 'var(--accent-600)' }} />
                            : <ArrowRight size={14} className="shrink-0" style={{ color: 'var(--muted)' }} />
                          }
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* ── Lista de chats existentes (professor) / estado aluno ── */
                <div className="flex flex-col h-full overflow-y-auto">
                  {chats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                      <MessageSquare size={32} className="opacity-30" style={{ color: 'var(--muted)' }} />
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>
                        {isProfessor
                          ? 'Nenhuma conversa ainda. Clique em + para iniciar.'
                          : 'Você ainda não tem uma conversa com o professor.'}
                      </p>
                      {!isProfessor && (
                        <button
                          onClick={handleAlunoIniciarChat}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer"
                          style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                        >
                          <MessageSquare size={13} />
                          Falar com o professor
                        </button>
                      )}
                      {isProfessor && (
                        <button
                          onClick={() => setView('picker')}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer"
                          style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                        >
                          <Plus size={13} />
                          Nova conversa
                        </button>
                      )}
                    </div>
                  ) : (
                    chats.map(chat => (
                      <button
                        key={chat.id}
                        onClick={() => handleSelectChat(chat)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors border-b hover:opacity-80 cursor-pointer"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'transparent' }}
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                          style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                        >
                          {initials(chat.alunoNome)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                              {chat.alunoNome}
                            </span>
                            <span className="text-[10px] shrink-0" style={{ color: 'var(--muted)' }}>
                              {timeAgo(chat.ultimaMensagemEm)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-1 mt-0.5">
                            <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                              {chat.ultimaMensagem ?? t('chat.noMessages')}
                            </p>
                            {chat.naoLidas > 0 && (
                              <span
                                className="min-w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 px-1"
                                style={{ backgroundColor: 'var(--accent-600)' }}
                              >
                                {chat.naoLidas > 99 ? '99+' : chat.naoLidas}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
