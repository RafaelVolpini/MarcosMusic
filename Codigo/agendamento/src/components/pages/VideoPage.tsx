import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Film, Plus, AlertCircle, Loader2,
  Upload, X, CheckCircle2, Trash2, ChevronRight,
  PlayCircle
} from 'lucide-react';

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
  { keywords: ['harpa', 'harp'], emoji: '🎵' },
];

function getInstrumentEmoji(nome: string): string {
  const lower = nome.toLowerCase();
  for (const { keywords, emoji } of INSTRUMENT_ICONS) {
    if (keywords.some(k => lower.includes(k))) return emoji;
  }
  return '🎵';
}
import { VideoPreviewModal } from '../modals/VideoPreviewModal';
import {
  listarModulos, uploadVideo, criarModulo,
  deletarVideo, deletarModulo,
  type ModuloDTO, type UploadModuloDTO
} from '../../services/moduloService';
import type { AuthUser } from '../../lib/auth';

interface VideoPageProps {
  user?: AuthUser;
}

const MODULE_COLORS = [
  { bg: 'from-violet-600 to-indigo-600', light: 'bg-violet-50 dark:bg-violet-950/30', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800' },
  { bg: 'from-blue-600 to-cyan-600',     light: 'bg-blue-50 dark:bg-blue-950/30',   badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',   border: 'border-blue-200 dark:border-blue-800' },
  { bg: 'from-emerald-600 to-teal-600',  light: 'bg-emerald-50 dark:bg-emerald-950/30', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  { bg: 'from-orange-500 to-rose-500',   light: 'bg-orange-50 dark:bg-orange-950/30', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  { bg: 'from-pink-600 to-fuchsia-600',  light: 'bg-pink-50 dark:bg-pink-950/30',  badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',  border: 'border-pink-200 dark:border-pink-800' },
];

export function VideoPage({ user }: VideoPageProps) {
  const isTeacher = user?.role === 'teacher';

  const [modulos, setModulos] = useState<ModuloDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeVideo, setActiveVideo] = useState<UploadModuloDTO | null>(null);
  const [expandedModulo, setExpandedModulo] = useState<number | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadedName, setUploadedName] = useState('');
  const [uploadForm, setUploadForm] = useState({ nome: '', descricao: '', moduloId: '' });

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNovoModuloModal, setShowNovoModuloModal] = useState(false);
  const [novoModuloNome, setNovoModuloNome] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { carregarModulos(); }, []);

  const carregarModulos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarModulos();
      setModulos(data);
      if (data.length > 0 && expandedModulo === null) setExpandedModulo(data[0].id);
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

  const handleDeletarVideo = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Deletar este vídeo?')) return;
    try {
      await deletarVideo(id);
      await carregarModulos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar vídeo');
    }
  };

  const handleDeletarModulo = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Deletar este módulo e todos seus vídeos?')) return;
    try {
      await deletarModulo(id);
      await carregarModulos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar módulo');
    }
  };

  const totalVideos = modulos.reduce((acc, m) => acc + m.uploads.length, 0);

  return (
    <div className="page-padding space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-end justify-between gap-4 pt-2 pb-1 border-b border-(--border)">
        <div>
          <p className="text-xs font-medium text-(--muted) uppercase tracking-widest mb-1">Biblioteca de aulas</p>
          <h1 className="text-2xl font-bold text-(--heading) leading-tight">
            Aulas Online
          </h1>
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--border) text-sm text-(--heading) hover:bg-(--surface-soft) transition-colors"
            >
              <Plus size={14} />
              Módulo
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-(--accent-600) text-white text-sm font-medium hover:opacity-90 transition-opacity"
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
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800"
          >
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={28} className="animate-spin text-(--accent-600)" />
          <p className="text-sm text-(--muted)">Carregando módulos...</p>
        </div>
      ) : modulos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-(--surface-soft) flex items-center justify-center">
            <Film size={28} className="text-(--muted)" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-(--heading)">Nenhum módulo ainda</p>
            <p className="text-sm text-(--muted) mt-1">
              {isTeacher ? 'Crie o primeiro módulo para começar a adicionar vídeos.' : 'Nenhum conteúdo disponível no momento.'}
            </p>
          </div>
          {isTeacher && (
            <button
              onClick={() => setShowNovoModuloModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-(--accent-600) text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={15} />
              Criar primeiro módulo
            </button>
          )}
        </motion.div>
      ) : (
        /* Layout Principal: Sidebar + Conteúdo */
        <div className="flex gap-5 flex-col lg:flex-row">

          {/* Sidebar: Lista de Módulos */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="sticky top-4 space-y-2">
              <p className="text-xs font-semibold text-(--muted) uppercase tracking-wider mb-3 px-1">Módulos</p>
              {modulos.map((modulo, idx) => {
                const color = MODULE_COLORS[idx % MODULE_COLORS.length];
                const isActive = expandedModulo === modulo.id;
                return (
                  <motion.button
                    key={modulo.id}
                    onClick={() => setExpandedModulo(isActive ? null : modulo.id)}
                    whileHover={{ x: 2 }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isActive
                        ? `${color.light} ${color.border} shadow-sm`
                        : 'bg-(--surface) border-(--border) hover:border-(--accent-600)/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color.bg} flex items-center justify-center flex-shrink-0 text-base`}>
                        {getInstrumentEmoji(modulo.nome)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-(--heading) truncate">{modulo.nome}</p>
                        <p className="text-xs text-(--muted)">{modulo.uploads.length} vídeo{modulo.uploads.length !== 1 ? 's' : ''}</p>
                      </div>
                      <ChevronRight
                        size={15}
                        className={`text-(--muted) transition-transform flex-shrink-0 ${isActive ? 'rotate-90' : ''}`}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Conteúdo: Vídeos do módulo selecionado */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {modulos.map((modulo, idx) => {
                if (expandedModulo !== modulo.id) return null;
                const color = MODULE_COLORS[idx % MODULE_COLORS.length];
                return (
                  <motion.div
                    key={modulo.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Header do módulo */}
                    <div className={`rounded-xl p-4 border ${color.light} ${color.border} flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color.bg} flex items-center justify-center text-xl`}>
                          {getInstrumentEmoji(modulo.nome)}
                        </div>
                        <div>
                          <h2 className="font-semibold text-(--heading)">{modulo.nome}</h2>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color.badge}`}>
                            {modulo.uploads.length} {modulo.uploads.length === 1 ? 'aula' : 'aulas'}
                          </span>
                        </div>
                      </div>
                      {isTeacher && (
                        <button
                          onClick={(e) => handleDeletarModulo(e, modulo.id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    {/* Vídeos como lista de aulas */}
                    {modulo.uploads.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3 rounded-xl border border-dashed border-(--border)">
                        <PlayCircle size={28} className="text-(--muted)" />
                        <p className="text-sm text-(--muted)">Nenhuma aula neste módulo ainda</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {modulo.uploads.map((video, vIdx) => (
                          <motion.div
                            key={video.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: vIdx * 0.04 }}
                            onClick={() => setActiveVideo(video)}
                            className="group flex items-center gap-4 p-4 rounded-xl bg-(--surface) border border-(--border) hover:border-(--accent-600)/50 hover:shadow-sm cursor-pointer transition-all"
                          >
                            {/* Número da aula */}
                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                              <span className="text-white text-xs font-bold">{vIdx + 1}</span>
                            </div>

                            {/* Thumbnail play button */}
                            <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <Play size={12} className="text-white ml-0.5" />
                              </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-(--heading) truncate">{video.nome}</p>
                              {video.descricao && (
                                <p className="text-xs text-(--muted) truncate mt-0.5">{video.descricao}</p>
                              )}
                            </div>

                            {/* Ações */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-(--accent-600) text-white text-xs font-medium">
                                <Play size={11} />
                                Assistir
                              </div>
                              {isTeacher && (
                                <button
                                  onClick={(e) => handleDeletarVideo(e, video.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
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
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Modal: Novo Módulo */}
      <AnimatePresence>
        {showNovoModuloModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowNovoModuloModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-(--app-surface) rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-(--border)"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xl">
                  {novoModuloNome ? getInstrumentEmoji(novoModuloNome) : '🎵'}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-(--heading)">Novo Módulo</h2>
                  <p className="text-xs text-(--muted)">Ex: Bateria, Violão, Piano...</p>
                </div>
              </div>

              <input
                type="text"
                placeholder="Nome do módulo"
                value={novoModuloNome}
                onChange={(e) => setNovoModuloNome(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCriarModulo()}
                autoFocus
                className="w-full border border-(--input-border) bg-(--input-bg) rounded-xl px-3 py-2.5 text-sm text-(--input-text) focus:outline-none focus:ring-2 focus:ring-(--accent-100) mb-4"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => { setShowNovoModuloModal(false); setNovoModuloNome(''); }}
                  className="flex-1 py-2.5 rounded-xl border border-(--border) text-sm text-(--heading) hover:bg-(--surface-soft) transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCriarModulo}
                  disabled={saving || !novoModuloNome.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? 'Criando...' : 'Criar Módulo'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Upload de Vídeo */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !uploading && setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-(--app-surface) rounded-2xl p-6 w-full max-w-md shadow-2xl border border-(--border)"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                    <Upload size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-(--heading)">Upload de Vídeo</h2>
                    <p className="text-xs text-(--muted)">Adicione uma aula ao módulo</p>
                  </div>
                </div>
                {!uploading && (
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="p-1.5 rounded-lg hover:bg-(--surface-soft) text-(--muted) transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Seleção de arquivo */}
                <div>
                  <label className="text-xs font-medium text-(--muted) block mb-1.5">Arquivo de vídeo *</label>
                  <input ref={fileRef} type="file" accept="video/*" onChange={handleUploadFile} className="hidden" />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full border-2 border-dashed border-(--border) hover:border-(--accent-600) rounded-xl p-5 text-center transition-colors group disabled:opacity-50"
                  >
                    <Film size={22} className="mx-auto text-(--muted) group-hover:text-(--accent-600) mb-2 transition-colors" />
                    <p className="text-sm font-medium text-(--heading) truncate">
                      {uploadedName || 'Clique para selecionar'}
                    </p>
                    <p className="text-xs text-(--muted) mt-0.5">MP4, MOV, AVI, etc.</p>
                  </button>
                </div>

                {/* Módulo */}
                <div>
                  <label className="text-xs font-medium text-(--muted) block mb-1.5">Módulo *</label>
                  <select
                    value={uploadForm.moduloId}
                    onChange={(e) => setUploadForm(p => ({ ...p, moduloId: e.target.value }))}
                    disabled={uploading}
                    className="w-full border border-(--input-border) bg-(--input-bg) text-(--input-text) rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--accent-100) disabled:opacity-50"
                  >
                    <option value="">Selecione um módulo...</option>
                    {modulos.map(m => (
                      <option key={m.id} value={m.id}>{m.nome}</option>
                    ))}
                  </select>
                </div>

                {/* Título */}
                <div>
                  <label className="text-xs font-medium text-(--muted) block mb-1.5">Título da aula *</label>
                  <input
                    type="text"
                    placeholder="Ex: Introdução ao instrumento"
                    value={uploadForm.nome}
                    onChange={(e) => setUploadForm(p => ({ ...p, nome: e.target.value }))}
                    disabled={uploading}
                    className="w-full border border-(--input-border) bg-(--input-bg) text-(--input-text) rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--accent-100) disabled:opacity-50"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="text-xs font-medium text-(--muted) block mb-1.5">Descrição</label>
                  <textarea
                    placeholder="O que o aluno vai aprender nesta aula?"
                    value={uploadForm.descricao}
                    onChange={(e) => setUploadForm(p => ({ ...p, descricao: e.target.value }))}
                    disabled={uploading}
                    rows={2}
                    className="w-full border border-(--input-border) bg-(--input-bg) text-(--input-text) rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--accent-100) resize-none disabled:opacity-50"
                  />
                </div>

                {/* Progresso */}
                <AnimatePresence>
                  {uploading && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-xl bg-(--surface-soft) border border-(--border)">
                        <div className="flex items-center justify-between mb-2">
                          {uploadSuccess ? (
                            <div className="flex items-center gap-1.5 text-emerald-600">
                              <CheckCircle2 size={15} />
                              <span className="text-sm font-medium">Upload concluído!</span>
                            </div>
                          ) : uploadProgress === 100 ? (
                            <div className="flex items-center gap-1.5 text-(--muted)">
                              <Loader2 size={13} className="animate-spin" />
                              <span className="text-sm font-medium text-(--muted)">Processando no servidor...</span>
                            </div>
                          ) : (
                            <span className="text-sm font-medium text-(--heading)">Enviando vídeo...</span>
                          )}
                          {uploadProgress < 100 && (
                            <span className="text-sm font-bold text-(--accent-600)">{uploadProgress}%</span>
                          )}
                        </div>
                        <div className="h-2 rounded-full bg-(--border) overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${uploadSuccess ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botões */}
                {!uploading && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        setShowUploadModal(false);
                        setUploadFile(null);
                        setUploadedName('');
                        setUploadForm({ nome: '', descricao: '', moduloId: '' });
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-(--border) text-sm text-(--heading) hover:bg-(--surface-soft) transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmitUpload}
                      disabled={!uploadFile || !uploadForm.moduloId || !uploadForm.nome}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                      Fazer Upload
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Preview */}
      {activeVideo && (
        <VideoPreviewModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  );
}
