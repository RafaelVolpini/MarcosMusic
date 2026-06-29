import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Film, Plus, AlertCircle, Loader2,
  Upload, X, CheckCircle2, Trash2, PlayCircle,
  BookOpen, Pencil, MoreHorizontal,
} from 'lucide-react';
import { VideoPreviewModal } from '../modals/VideoPreviewModal';
import {
  listarModulos, uploadVideo, criarModulo, editarModulo,
  deletarVideo, deletarModulo,
  type ModuloDTO, type UploadModuloDTO
} from '../../services/moduloService';
import type { AuthUser } from '../../lib/auth';

// ─── Mapeamento de instrumentos ───────────────────────────────────────────────

const INSTRUMENT_ICONS: Array<{ keywords: string[]; emoji: string }> = [
  { keywords: ['violão', 'violao', 'guitarra', 'baixo', 'ukulele', 'ukulelê', 'cavaquinho'], emoji: '🎸' },
  { keywords: ['piano', 'teclado', 'keyboard'], emoji: '🎹' },
  { keywords: ['bateria', 'percussão', 'percussao', 'bongô', 'bongo', 'cajón', 'cajon', 'pandeiro', 'tambor'], emoji: '🥁' },
  { keywords: ['flauta', 'clarinete', 'oboé', 'oboe', 'fagote'], emoji: '🪈' },
  { keywords: ['violino', 'viola', 'cello', 'violoncelo', 'contrabaixo'], emoji: '🎻' },
  { keywords: ['saxofone', 'saxofon', 'sax'], emoji: '🎷' },
  { keywords: ['trompete', 'trombone', 'tuba', 'flugelhorn', 'corneta', 'instrumento de sopro'], emoji: '🎺' },
  { keywords: ['canto', 'voz', 'vocal', 'coros', 'coral'], emoji: '🎤' },
  { keywords: ['teoria', 'solfejo', 'harmonia', 'composição', 'composicao', 'musicalização', 'musicalizacao'], emoji: '🎼' },
  { keywords: ['acordeon', 'acordeão', 'sanfona', 'gaita'], emoji: '🪗' },
];

function getInstrumentEmoji(nome: string): string {
  const lower = nome.toLowerCase();
  for (const { keywords, emoji } of INSTRUMENT_ICONS) {
    if (keywords.some(k => lower.includes(k))) return emoji;
  }
  return '🎵';
}

const MODULE_COLORS = [
  { from: '#7c3aed', to: '#4f46e5', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
  { from: '#2563eb', to: '#0891b2', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { from: '#059669', to: '#0d9488', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { from: '#ea580c', to: '#e11d48', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  { from: '#db2777', to: '#c026d3', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' },
];

// ─── Componente principal ─────────────────────────────────────────────────────

interface VideoPageProps { user?: AuthUser; }

export function VideoPage({ user }: VideoPageProps) {
  const isTeacher = user?.role === 'teacher';

  const [modulos, setModulos] = useState<ModuloDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<UploadModuloDTO | null>(null);
  const [selectedModulo, setSelectedModulo] = useState<number | null>(null);

  // Upload
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadedName, setUploadedName] = useState('');
  const [uploadForm, setUploadForm] = useState({ nome: '', descricao: '', moduloId: '' });

  // Modals de criação
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNovoModuloModal, setShowNovoModuloModal] = useState(false);
  const [novoModuloNome, setNovoModuloNome] = useState('');
  const [saving, setSaving] = useState(false);

  // Modal de edição de módulo
  const [editModulo, setEditModulo] = useState<{ id: number; nome: string } | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Modais de confirmação de delete
  const [confirmDeleteModulo, setConfirmDeleteModulo] = useState<ModuloDTO | null>(null);
  const [confirmDeleteVideo, setConfirmDeleteVideo] = useState<{ id: number; nome: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Sidebar: menu de contexto aberto
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => { carregarModulos(); }, []);

  // Fecha menu ao clicar fora
  useEffect(() => {
    if (openMenuId === null) return;
    const handler = () => setOpenMenuId(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [openMenuId]);

  const carregarModulos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarModulos();
      setModulos(data);
      if (data.length > 0 && selectedModulo === null) setSelectedModulo(data[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar módulos');
    } finally {
      setLoading(false);
    }
  };

  const handleCriarModulo = async () => {
    if (!novoModuloNome.trim()) return;
    try {
      setSaving(true);
      await criarModulo(novoModuloNome.trim());
      setNovoModuloNome('');
      setShowNovoModuloModal(false);
      await carregarModulos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar módulo');
    } finally {
      setSaving(false);
    }
  };

  const abrirEdicao = (modulo: ModuloDTO) => {
    setEditModulo({ id: modulo.id, nome: modulo.nome });
    setEditNome(modulo.nome);
    setOpenMenuId(null);
  };

  const handleEditarModulo = async () => {
    if (!editModulo || !editNome.trim()) return;
    try {
      setEditSaving(true);
      await editarModulo(editModulo.id, editNome.trim());
      setEditModulo(null);
      await carregarModulos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao editar módulo');
    } finally {
      setEditSaving(false);
    }
  };

  const handleConfirmarDeleteModulo = async () => {
    if (!confirmDeleteModulo) return;
    try {
      setDeleting(true);
      await deletarModulo(confirmDeleteModulo.id);
      const remaining = modulos.filter(m => m.id !== confirmDeleteModulo.id);
      setSelectedModulo(remaining[0]?.id ?? null);
      setConfirmDeleteModulo(null);
      await carregarModulos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar módulo');
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmarDeleteVideo = async () => {
    if (!confirmDeleteVideo) return;
    try {
      setDeleting(true);
      await deletarVideo(confirmDeleteVideo.id);
      setConfirmDeleteVideo(null);
      await carregarModulos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar vídeo');
    } finally {
      setDeleting(false);
    }
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadedName(file.name);
    setUploadForm(prev => ({ ...prev, nome: file.name.replace(/\.[^.]+$/, '') }));
  };

  const handleSubmitUpload = async () => {
    if (!uploadFile || !uploadForm.moduloId || !uploadForm.nome) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadSuccess(false);
      await uploadVideo(uploadFile, uploadForm.nome, uploadForm.descricao, parseInt(uploadForm.moduloId), setUploadProgress);
      setUploadSuccess(true);
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadedName('');
        setUploadForm({ nome: '', descricao: '', moduloId: '' });
        setUploadSuccess(false);
        setUploading(false);
        carregarModulos();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
      setUploading(false);
    }
  };

  const totalVideos = modulos.reduce((acc, m) => acc + m.uploads.length, 0);
  const moduloAtivo = modulos.find(m => m.id === selectedModulo);
  const moduloAtivoIdx = modulos.findIndex(m => m.id === selectedModulo);
  const color = MODULE_COLORS[moduloAtivoIdx % MODULE_COLORS.length] ?? MODULE_COLORS[0];

  return (
    <div className="page-padding space-y-5">

      {/* Header */}
      <div className="flex items-end justify-between gap-4 pt-2 pb-1 border-b border-(--border)">
        <div>
          <p className="text-xs font-medium text-(--muted) uppercase tracking-widest mb-1">Biblioteca de aulas</p>
          <h1 className="text-2xl font-bold text-(--heading) leading-tight">Aulas Online</h1>
          {!loading && (
            <p className="text-sm text-(--muted) mt-0.5">
              {modulos.length} {modulos.length === 1 ? 'instrumento' : 'instrumentos'} · {totalVideos} {totalVideos === 1 ? 'aula' : 'aulas'}
            </p>
          )}
        </div>
        {isTeacher && (
          <div className="flex gap-2 pb-1">
            <button
              onClick={() => setShowNovoModuloModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-(--border) text-sm text-(--heading) hover:bg-(--surface-soft) transition-colors"
            >
              <Plus size={14} />
              Novo módulo
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-(--accent-600) text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Upload size={14} />
              Upload
            </button>
          </div>
        )}
      </div>

      {/* Erro */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800"
          >
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 cursor-pointer"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 size={28} className="animate-spin text-(--accent-600)" />
          <p className="text-sm text-(--muted)">Carregando biblioteca...</p>
        </div>
      ) : modulos.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-(--surface-soft) flex items-center justify-center">
            <Film size={28} className="text-(--muted)" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-(--heading)">Biblioteca vazia</p>
            <p className="text-sm text-(--muted) mt-1">
              {isTeacher ? 'Crie o primeiro módulo para começar a adicionar videoaulas.' : 'Nenhum conteúdo disponível no momento.'}
            </p>
          </div>
          {isTeacher && (
            <button onClick={() => setShowNovoModuloModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-(--accent-600) text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={15} /> Criar primeiro módulo
            </button>
          )}
        </motion.div>
      ) : (
        /* ── Layout duas colunas ── */
        <div className="flex gap-6 flex-col lg:flex-row items-start">

          {/* ── Sidebar de módulos ── */}
          <div className="lg:w-64 shrink-0 w-full sticky top-4">
            <div className="flex items-center justify-between mb-3 px-0.5">
              <p className="text-xs font-semibold text-(--muted) uppercase tracking-wider">Instrumentos</p>
              <span className="text-xs text-(--muted) font-medium">{modulos.length}</span>
            </div>

            <div className="rounded-2xl border border-(--border) bg-(--surface) overflow-visible shadow-sm divide-y divide-(--border)">
              {modulos.map((modulo, idx) => {
                const c = MODULE_COLORS[idx % MODULE_COLORS.length];
                const isActive = selectedModulo === modulo.id;
                const emoji = getInstrumentEmoji(modulo.nome);
                const menuOpen = openMenuId === modulo.id;

                return (
                  <div key={modulo.id} className="relative">
                    <motion.button
                      onClick={() => setSelectedModulo(modulo.id)}
                      whileTap={{ scale: 0.99 }}
                      className={`relative w-full text-left flex items-center gap-3 pl-4 pr-2 py-3.5 transition-colors group ${
                        isActive ? 'bg-(--surface-soft)' : 'hover:bg-(--surface-soft)'
                      } ${idx === 0 ? 'rounded-t-2xl' : ''} ${idx === modulos.length - 1 ? 'rounded-b-2xl' : ''}`}
                    >
                      {/* Barra lateral colorida */}
                      <div
                        className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full transition-all ${isActive ? 'opacity-100' : 'opacity-0'}`}
                        style={{ background: `linear-gradient(to bottom, ${c.from}, ${c.to})` }}
                      />

                      {/* Ícone com emoji */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
                      >
                        {emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isActive ? 'text-(--heading)' : 'text-(--text) group-hover:text-(--heading)'}`}>
                          {modulo.nome}
                        </p>
                        <p className="text-[11px] text-(--muted) mt-0.5">
                          {modulo.uploads.length} {modulo.uploads.length === 1 ? 'aula' : 'aulas'}
                        </p>
                      </div>

                      {/* Ações do professor — aparecem no hover */}
                      {isTeacher && (
                        <div
                          className={`flex items-center gap-0.5 shrink-0 transition-opacity ${isActive || menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => abrirEdicao(modulo)}
                            title="Renomear módulo"
                            className="cursor-pointer p-1.5 rounded-lg text-(--muted) hover:text-(--heading) hover:bg-(--border) transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(menuOpen ? null : modulo.id); }}
                            title="Mais opções"
                            className="cursor-pointer p-1.5 rounded-lg text-(--muted) hover:text-(--heading) hover:bg-(--border) transition-colors"
                          >
                            <MoreHorizontal size={13} />
                          </button>
                        </div>
                      )}
                    </motion.button>

                    {/* Dropdown de opções */}
                    <AnimatePresence>
                      {menuOpen && isTeacher && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-2 top-full mt-1 z-20 bg-(--app-surface) border border-(--border) rounded-xl shadow-lg overflow-hidden min-w-[160px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => abrirEdicao(modulo)}
                            className="cursor-pointer w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-(--text) hover:bg-(--surface-soft) transition-colors"
                          >
                            <Pencil size={13} className="text-(--muted)" />
                            Renomear
                          </button>
                          <div className="h-px bg-(--border)" />
                          <button
                            onClick={() => { setConfirmDeleteModulo(modulo); setOpenMenuId(null); }}
                            className="cursor-pointer w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          >
                            <Trash2 size={13} />
                            Excluir módulo
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="mt-3 px-4 py-3 rounded-xl border border-(--border) bg-(--surface-soft) flex items-center gap-3">
              <BookOpen size={14} className="text-(--muted) shrink-0" />
              <p className="text-xs text-(--muted)">
                <span className="font-semibold text-(--heading)">{totalVideos}</span> aula{totalVideos !== 1 ? 's' : ''} no total
              </p>
            </div>
          </div>

          {/* ── Área principal ── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {moduloAtivo && (
                <motion.div
                  key={moduloAtivo.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  {/* Cabeçalho do módulo */}
                  <div
                    className="rounded-2xl p-5 border border-(--border) relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${color.from}14, ${color.to}08)` }}
                  >
                    <div
                      className="absolute right-4 top-4 w-20 h-20 rounded-2xl opacity-10"
                      style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
                    />

                    <div className="flex items-center gap-4 relative">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md shrink-0"
                        style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
                      >
                        {getInstrumentEmoji(moduloAtivo.nome)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-(--muted) uppercase tracking-wider mb-0.5">Módulo</p>
                        <h2 className="text-xl font-bold text-(--heading) truncate">{moduloAtivo.nome}</h2>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${color.badge}`}>
                          {moduloAtivo.uploads.length} {moduloAtivo.uploads.length === 1 ? 'aula' : 'aulas'}
                        </span>
                      </div>

                      {/* Ações no header do módulo — professor apenas */}
                      {isTeacher && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => abrirEdicao(moduloAtivo)}
                            title="Renomear módulo"
                            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--border) text-xs font-medium text-(--muted) hover:text-(--heading) hover:bg-(--surface) transition-colors"
                          >
                            <Pencil size={12} /> Renomear
                          </button>
                          <button
                            onClick={() => setConfirmDeleteModulo(moduloAtivo)}
                            title="Excluir módulo"
                            className="cursor-pointer p-2 rounded-lg text-(--muted) hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lista de aulas */}
                  {moduloAtivo.uploads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border border-dashed border-(--border) bg-(--surface-soft)">
                      <div className="w-12 h-12 rounded-xl bg-(--surface) border border-(--border) flex items-center justify-center">
                        <PlayCircle size={22} className="text-(--muted)" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-(--heading)">Nenhuma aula ainda</p>
                        <p className="text-xs text-(--muted) mt-0.5">
                          {isTeacher ? 'Faça upload de um vídeo para este módulo.' : 'As aulas aparecerão aqui quando disponíveis.'}
                        </p>
                      </div>
                      {isTeacher && (
                        <button
                          onClick={() => { setUploadForm(p => ({ ...p, moduloId: String(moduloAtivo.id) })); setShowUploadModal(true); }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-(--accent-600) text-white text-sm font-medium hover:opacity-90 transition-opacity mt-1"
                        >
                          <Upload size={13} /> Upload de vídeo
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-(--border) bg-(--surface) overflow-hidden shadow-sm divide-y divide-(--border)">
                      {moduloAtivo.uploads.map((video, vIdx) => (
                        <motion.div
                          key={video.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: vIdx * 0.05 }}
                          onClick={() => setActiveVideo(video)}
                          className="group flex items-center gap-4 px-5 py-4 hover:bg-(--surface-soft) cursor-pointer transition-colors"
                        >
                          {/* Número / play */}
                          <div className="w-8 text-center shrink-0">
                            <span className="text-sm font-bold text-(--muted) group-hover:hidden select-none">{vIdx + 1}</span>
                            <div className="hidden group-hover:flex items-center justify-center">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center shadow-sm"
                                style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
                              >
                                <Play size={11} className="text-white ml-0.5" />
                              </div>
                            </div>
                          </div>

                          {/* Thumbnail */}
                          <div className="w-24 h-14 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center shrink-0 overflow-hidden relative">
                            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 group-hover:scale-110 transition-all">
                              <Play size={13} className="text-white ml-0.5" />
                            </div>
                            <div
                              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ boxShadow: `inset 0 0 0 2px ${color.from}60` }}
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-(--heading) truncate group-hover:text-(--accent-600) transition-colors">
                              {video.nome}
                            </p>
                            {video.descricao ? (
                              <p className="text-xs text-(--muted) truncate mt-0.5">{video.descricao}</p>
                            ) : (
                              <p className="text-xs text-(--muted) mt-0.5">Aula {vIdx + 1}</p>
                            )}
                          </div>

                          {/* Ações */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div
                              className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                              style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
                            >
                              <Play size={10} /> Assistir
                            </div>
                            {isTeacher && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setConfirmDeleteVideo({ id: video.id, nome: video.nome }); }}
                                className="cursor-pointer opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-(--muted) hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                                title="Excluir aula"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          Modais
      ════════════════════════════════════════════════════════════════ */}

      {/* ── Novo Módulo ── */}
      <AnimatePresence>
        {showNovoModuloModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowNovoModuloModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-(--app-surface) rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-(--border)"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                  {novoModuloNome ? getInstrumentEmoji(novoModuloNome) : '🎵'}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-(--heading)">Novo módulo</h2>
                  <p className="text-xs text-(--muted)">Ex: Bateria, Violão, Piano...</p>
                </div>
              </div>
              <input
                type="text"
                placeholder="Nome do instrumento"
                value={novoModuloNome}
                onChange={(e) => setNovoModuloNome(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCriarModulo()}
                autoFocus
                className="w-full border border-(--input-border) bg-(--input-bg) rounded-xl px-3.5 py-2.5 text-sm text-(--input-text) focus:outline-none focus:ring-2 focus:ring-(--accent-100) mb-4"
              />
              <div className="flex gap-2">
                <button onClick={() => { setShowNovoModuloModal(false); setNovoModuloNome(''); }}
                  className="flex-1 py-2.5 rounded-xl border border-(--border) text-sm text-(--heading) hover:bg-(--surface-soft) transition-colors">
                  Cancelar
                </button>
                <button onClick={handleCriarModulo} disabled={saving || !novoModuloNome.trim()}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                  {saving ? 'Criando...' : 'Criar módulo'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Editar Módulo ── */}
      <AnimatePresence>
        {editModulo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setEditModulo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-(--app-surface) rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-(--border)"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #0891b2)' }}>
                  {editNome ? getInstrumentEmoji(editNome) : '🎵'}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-(--heading)">Renomear módulo</h2>
                  <p className="text-xs text-(--muted)">Altere o nome do instrumento</p>
                </div>
              </div>
              <input
                type="text"
                placeholder="Novo nome"
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEditarModulo()}
                autoFocus
                className="w-full border border-(--input-border) bg-(--input-bg) rounded-xl px-3.5 py-2.5 text-sm text-(--input-text) focus:outline-none focus:ring-2 focus:ring-(--accent-100) mb-4"
              />
              <div className="flex gap-2">
                <button onClick={() => setEditModulo(null)}
                  className="flex-1 py-2.5 rounded-xl border border-(--border) text-sm text-(--heading) hover:bg-(--surface-soft) transition-colors">
                  Cancelar
                </button>
                <button onClick={handleEditarModulo} disabled={editSaving || !editNome.trim() || editNome.trim() === editModulo.nome}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #0891b2)' }}>
                  {editSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confirmar exclusão de módulo ── */}
      <AnimatePresence>
        {confirmDeleteModulo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !deleting && setConfirmDeleteModulo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-(--app-surface) rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-(--border)"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-rose-100 dark:bg-rose-950/50 shrink-0">
                  <Trash2 size={18} className="text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-(--heading)">Excluir módulo</h2>
                  <p className="text-xs text-(--muted) mt-1">
                    Isso irá remover <span className="font-semibold text-(--heading)">{confirmDeleteModulo.nome}</span> e todas as suas {confirmDeleteModulo.uploads.length} aula{confirmDeleteModulo.uploads.length !== 1 ? 's' : ''}. Esta ação não pode ser desfeita.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDeleteModulo(null)} disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl border border-(--border) text-sm text-(--heading) hover:bg-(--surface-soft) transition-colors disabled:opacity-50">
                  Cancelar
                </button>
                <button onClick={handleConfirmarDeleteModulo} disabled={deleting}
                  className="cursor-pointer flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {deleting ? <><Loader2 size={13} className="animate-spin" /> Excluindo...</> : 'Sim, excluir'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confirmar exclusão de vídeo ── */}
      <AnimatePresence>
        {confirmDeleteVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !deleting && setConfirmDeleteVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-(--app-surface) rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-(--border)"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-rose-100 dark:bg-rose-950/50 shrink-0">
                  <Film size={18} className="text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-(--heading)">Excluir aula</h2>
                  <p className="text-xs text-(--muted) mt-1">
                    A aula <span className="font-semibold text-(--heading)">{confirmDeleteVideo.nome}</span> será removida permanentemente.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDeleteVideo(null)} disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl border border-(--border) text-sm text-(--heading) hover:bg-(--surface-soft) transition-colors disabled:opacity-50">
                  Cancelar
                </button>
                <button onClick={handleConfirmarDeleteVideo} disabled={deleting}
                  className="cursor-pointer flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {deleting ? <><Loader2 size={13} className="animate-spin" /> Excluindo...</> : 'Sim, excluir'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Upload ── */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !uploading && setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-(--app-surface) rounded-2xl p-6 w-full max-w-md shadow-2xl border border-(--border)"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                    <Upload size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-(--heading)">Upload de videoaula</h2>
                    <p className="text-xs text-(--muted)">Adicione uma aula ao módulo</p>
                  </div>
                </div>
                {!uploading && (
                  <button onClick={() => setShowUploadModal(false)}
                    className="cursor-pointer p-1.5 rounded-lg hover:bg-(--surface-soft) text-(--muted) transition-colors">
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-(--muted) block mb-1.5 uppercase tracking-wide">Arquivo de vídeo *</label>
                  <input ref={fileRef} type="file" accept="video/*" onChange={handleUploadFile} className="hidden" />
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="cursor-pointer w-full border-2 border-dashed border-(--border) hover:border-(--accent-600) rounded-xl p-6 text-center transition-colors group disabled:opacity-50"
                  >
                    <Film size={24} className="mx-auto text-(--muted) group-hover:text-(--accent-600) mb-2 transition-colors" />
                    <p className="text-sm font-semibold text-(--heading) truncate">{uploadedName || 'Clique para selecionar'}</p>
                    <p className="text-xs text-(--muted) mt-0.5">MP4, MOV, AVI, MKV...</p>
                  </button>
                </div>

                <div>
                  <label className="text-xs font-semibold text-(--muted) block mb-1.5 uppercase tracking-wide">Módulo *</label>
                  <select value={uploadForm.moduloId}
                    onChange={(e) => setUploadForm(p => ({ ...p, moduloId: e.target.value }))}
                    disabled={uploading}
                    className="w-full border border-(--input-border) bg-(--input-bg) text-(--input-text) rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--accent-100) disabled:opacity-50"
                  >
                    <option value="">Selecione um módulo...</option>
                    {modulos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-(--muted) block mb-1.5 uppercase tracking-wide">Título da aula *</label>
                  <input type="text" placeholder="Ex: Introdução — postura e pegada"
                    value={uploadForm.nome}
                    onChange={(e) => setUploadForm(p => ({ ...p, nome: e.target.value }))}
                    disabled={uploading}
                    className="w-full border border-(--input-border) bg-(--input-bg) text-(--input-text) rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--accent-100) disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-(--muted) block mb-1.5 uppercase tracking-wide">Descrição</label>
                  <textarea placeholder="O que o aluno vai aprender nesta aula?"
                    value={uploadForm.descricao}
                    onChange={(e) => setUploadForm(p => ({ ...p, descricao: e.target.value }))}
                    disabled={uploading} rows={2}
                    className="w-full border border-(--input-border) bg-(--input-bg) text-(--input-text) rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--accent-100) resize-none disabled:opacity-50"
                  />
                </div>

                <AnimatePresence>
                  {uploading && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="p-4 rounded-xl bg-(--surface-soft) border border-(--border)">
                        <div className="flex items-center justify-between mb-2.5">
                          {uploadSuccess ? (
                            <div className="flex items-center gap-1.5 text-emerald-600">
                              <CheckCircle2 size={15} />
                              <span className="text-sm font-semibold">Upload concluído!</span>
                            </div>
                          ) : uploadProgress === 100 ? (
                            <div className="flex items-center gap-1.5 text-(--muted)">
                              <Loader2 size={13} className="animate-spin" />
                              <span className="text-sm font-medium">Processando no servidor...</span>
                            </div>
                          ) : (
                            <span className="text-sm font-semibold text-(--heading)">Enviando videoaula...</span>
                          )}
                          {uploadProgress < 100 && (
                            <span className="text-sm font-bold" style={{ color: color.from }}>{uploadProgress}%</span>
                          )}
                        </div>
                        <div className="h-1.5 rounded-full bg-(--border) overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${uploadSuccess ? 'bg-emerald-500' : ''}`}
                            style={!uploadSuccess ? { background: `linear-gradient(to right, ${color.from}, ${color.to})` } : {}}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!uploading && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => { setShowUploadModal(false); setUploadFile(null); setUploadedName(''); setUploadForm({ nome: '', descricao: '', moduloId: '' }); }}
                      className="flex-1 py-2.5 rounded-xl border border-(--border) text-sm text-(--heading) hover:bg-(--surface-soft) transition-colors">
                      Cancelar
                    </button>
                    <button onClick={handleSubmitUpload}
                      disabled={!uploadFile || !uploadForm.moduloId || !uploadForm.nome}
                      className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
                      style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}>
                      Enviar aula
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview */}
      {activeVideo && <VideoPreviewModal video={activeVideo} onClose={() => setActiveVideo(null)} />}
    </div>
  );
}
