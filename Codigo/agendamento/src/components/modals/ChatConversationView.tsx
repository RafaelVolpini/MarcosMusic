import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { chatService, type ChatDTO, type ChatMensagemDTO } from '../../services/chatService';
import type { AuthUser } from '../../lib/auth';
import { useLanguage } from '../../context/LanguageContext';

interface ChatConversationViewProps {
  chat: ChatDTO;
  currentUser: AuthUser;
  onUnreadChange?: () => void;
  professorPhoto?: string;
}

function formatHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDia(iso: string): string {
  const d = new Date(iso);
  const hoje = new Date();
  if (d.toDateString() === hoje.toDateString()) return 'Hoje';
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);
  if (d.toDateString() === ontem.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function ChatConversationView({ chat, currentUser, onUnreadChange, professorPhoto }: ChatConversationViewProps) {
  const { t } = useLanguage();
  const [mensagens, setMensagens] = useState<ChatMensagemDTO[]>([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const remetente: 'professor' | 'aluno' = currentUser.role === 'teacher' ? 'professor' : 'aluno';

  const carregarMensagens = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) setLoading(true);
      const msgs = await chatService.getMensagens(chat.id);
      setMensagens(prev => {
        // Só atualiza se houver mensagens novas (evita re-render desnecessário)
        if (msgs.length === prev.length && msgs.every((m, i) => m.id === prev[i]?.id && m.lida === prev[i]?.lida)) {
          return prev;
        }
        return msgs;
      });
    } catch {
      // silencia erros de polling
    } finally {
      if (!silencioso) setLoading(false);
    }
  }, [chat.id]);

  // Marca como lidas ao abrir (uma única vez por chat)
  useEffect(() => {
    chatService.marcarLidas(chat.id, remetente).catch(() => {});
    onUnreadChange?.();
  }, [chat.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Carrega ao montar e polling a cada 4s
  useEffect(() => {
    carregarMensagens();
    const id = setInterval(() => carregarMensagens(true), 4000);
    return () => clearInterval(id);
  }, [carregarMensagens]);

  // Scroll para o final ao receber novas mensagens
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens.length]);

  // Foca no input ao abrir
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [chat.id]);

  const enviar = async () => {
    const txt = texto.trim();
    if (!txt || enviando) return;
    setTexto('');
    setEnviando(true);
    try {
      const nova = await chatService.enviarMensagem(chat.id, {
        remetenteId: currentUser.id!.toString(),
        remetente,
        conteudo: txt,
        tipo: 'text',
      });
      setMensagens(prev => [...prev, nova]);
      onUnreadChange?.();
    } catch {
      setTexto(txt); // restaura se falhou
    } finally {
      setEnviando(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  // Agrupa mensagens por dia para exibir separador
  const groups: { day: string; msgs: ChatMensagemDTO[] }[] = [];
  for (const m of mensagens) {
    const dia = formatDia(m.criadaEm);
    if (!groups.length || groups[groups.length - 1].day !== dia) {
      groups.push({ day: dia, msgs: [m] });
    } else {
      groups[groups.length - 1].msgs.push(m);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scroll-smooth">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={20} className="animate-spin" style={{ color: 'var(--muted)' }} />
          </div>
        ) : mensagens.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs italic" style={{ color: 'var(--muted)' }}>
              {t('chat.empty')}
            </p>
          </div>
        ) : (
          groups.map(group => (
            <div key={group.day}>
              {/* Separador de dia */}
              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                <span className="text-[10px] font-semibold px-2 rounded-full"
                  style={{ color: 'var(--muted)', backgroundColor: 'var(--surface-soft)' }}>
                  {group.day}
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
              </div>
              {group.msgs.map((m, i) => {
                const isMe = m.remetente === remetente;
                const prev = i > 0 ? group.msgs[i - 1] : null;
                const showAvatar = !prev || prev.remetente !== m.remetente;
                return (
                  <motion.div
                    key={m.id}
                    layout="position"
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.15 }}
                    className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-2' : 'mt-0.5'}`}
                  >
                      {/* Avatar (outro lado) */}
                      {!isMe && (
                        professorPhoto && m.remetente === 'professor' ? (
                          <img
                            src={professorPhoto}
                            alt="Professor"
                            className={`w-6 h-6 rounded-full object-cover shrink-0 ${showAvatar ? 'visible' : 'invisible'}`}
                          />
                        ) : (
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 ${showAvatar ? 'visible' : 'invisible'}`}
                            style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                          >
                            {(m.remetente === 'professor' ? 'P' : (chat.alunoNome?.[0] ?? 'A'))}
                          </div>
                        )
                      )}

                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                        {/* Bubble with tail */}
                        <div className="relative">
                          <div
                            className="px-3 py-2 text-xs leading-relaxed wrap-break-word"
                            style={isMe ? {
                              background: 'var(--accent-600)',
                              color: '#fff',
                              borderRadius: '16px 16px 4px 16px',
                            } : {
                              backgroundColor: 'var(--surface-soft)',
                              color: 'var(--text)',
                              border: '1px solid var(--border)',
                              borderRadius: '16px 16px 16px 4px',
                            }}
                          >
                            {m.conteudo}
                          </div>
                          {/* Cauda do balão */}
                          {showAvatar && (
                            <div style={isMe ? {
                              position: 'absolute', bottom: 0, right: -6,
                              width: 0, height: 0,
                              borderTop: '9px solid var(--accent-600)',
                              borderLeft: '7px solid transparent',
                            } : {
                              position: 'absolute', bottom: 0, left: -6,
                              width: 0, height: 0,
                              borderTop: '9px solid var(--surface-soft)',
                              borderRight: '7px solid transparent',
                            }} />
                          )}
                        </div>
                        <span className="text-[9px] mt-0.5 px-1" style={{ color: 'var(--muted)' }}>
                          {formatHora(m.criadaEm)}
                          {isMe && (
                            <span className="ml-1">{m.lida ? '✓✓' : '✓'}</span>
                          )}
                        </span>
                      </div>

                      {/* Avatar (meu lado) */}
                      {isMe && (
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 ${showAvatar ? 'visible' : 'invisible'}`}
                          style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                        >
                          {currentUser.name?.[0]?.toUpperCase() ?? 'E'}
                        </div>
                      )}
                    </motion.div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-3 py-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('chat.placeholder')}
            maxLength={4000}
            className="flex-1 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--input-bg, var(--surface-soft))',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          />
          <button
            onClick={enviar}
            disabled={!texto.trim() || enviando}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 disabled:opacity-40 cursor-pointer"
            style={{ backgroundColor: 'var(--accent-600)', color: '#fff' }}
          >
            {enviando
              ? <Loader2 size={13} className="animate-spin" />
              : <Send size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
}
