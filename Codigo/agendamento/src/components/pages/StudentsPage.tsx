import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Plus, Phone, Mail, Tag, ChevronLeft, ChevronRight, Trash2, MessageSquare, Calendar } from 'lucide-react';
import { DeleteConfirmModal } from '../modals/DeleteConfirmModal';
import type { Aluno } from '../../types';
import type { AuthUser } from '../../lib/auth';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { AlunoModal } from '../modals/AlunoModal';
import { criarAluno, atualizarAluno, deletarAluno, type AlunoFormData } from '../../services/alunoService';
import { chatBus } from '../../lib/chatBus';
import { formatPhoneGlobal, phoneToWhatsApp } from '../../utils';
import { useLanguage } from '../../context/LanguageContext';

const PAGE_SIZE = 9;

interface StudentsPageProps {
  students: Aluno[];
  currentUser?: AuthUser;
  onReload: () => void;
}

export function StudentsPage({ students, currentUser, onReload }: StudentsPageProps) {
  const isTeacher = currentUser?.role === 'teacher';
  const { t } = useLanguage();

  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [alunoEditando, setAlunoEditando] = useState<Aluno | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [alunoParaExcluir, setAlunoParaExcluir] = useState<Aluno | null>(null);

  const filtered = students.filter(s =>
    s.nome.toLowerCase().includes(query.toLowerCase()) ||
    s.email.toLowerCase().includes(query.toLowerCase()) ||
    (s.apelido ?? '').toLowerCase().includes(query.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  function changePage(next: number) {
    setPage(Math.max(0, Math.min(next, totalPages - 1)));
  }

  function handleNovoAluno() {
    setAlunoEditando(undefined);
    setModalOpen(true);
  }

  function handleEditarAluno(aluno: Aluno) {
    if (!isTeacher) return;
    setAlunoEditando(aluno);
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setAlunoEditando(undefined);
  }

  async function handleSave(data: AlunoFormData, id?: string) {
    if (id) {
      await atualizarAluno(id, data);
    } else {
      await criarAluno(data);
    }
    onReload();
  }

  async function handleDelete(e: React.MouseEvent, aluno: Aluno) {
    e.stopPropagation();
    setAlunoParaExcluir(aluno);
  }

  async function confirmarExclusao() {
    if (!alunoParaExcluir) return;
    setDeletingId(alunoParaExcluir.id);
    try {
      await deletarAluno(alunoParaExcluir.id);
      setAlunoParaExcluir(null);
      onReload();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-6">
      <AlunoModal
        open={modalOpen}
        aluno={alunoEditando}
        onClose={handleClose}
        onSave={handleSave}
      />

      <DeleteConfirmModal
        aluno={alunoParaExcluir}
        loading={deletingId !== null}
        onConfirm={confirmarExclusao}
        onCancel={() => setAlunoParaExcluir(null)}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(0); }}
            placeholder={t('students.searchPlaceholder')}
            className="w-full h-10 pl-9 pr-4 bg-(--input-bg) border border-(--input-border) rounded-xl text-sm text-(--text) focus:outline-none focus:ring-2 focus:ring-(--accent-500)/30 placeholder:text-(--muted)"
          />
        </div>
        {isTeacher && (
          <Button size="sm" onClick={handleNovoAluno}>
            <Plus size={14} /> {t('students.new')}
          </Button>
        )}
      </div>

      {/* Grid com animação de troca de página */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={safePage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.18 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          <AnimatePresence>
          {pageItems.map((aluno, i) => (
            <motion.div
              key={aluno.id}
              layout
              initial={{ opacity: 0, y: 18, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.82, y: -10, transition: { duration: 0.18 } }}
              transition={{ delay: i * 0.045, duration: 0.22 }}
            >
              <Card
                hoverable={isTeacher}
                className={`p-5 relative group ${isTeacher ? 'cursor-pointer' : ''}`}
                onClick={() => handleEditarAluno(aluno)}
              >
                {/* Botão excluir só professor */}
                {isTeacher && (
                  <button
                    onClick={(e) => handleDelete(e, aluno)}
                    disabled={deletingId === aluno.id}
                    title={t('students.delete')}
                    className="
                      absolute top-3 right-3 w-7 h-7 rounded-lg
                      flex items-center justify-center
                      text-(--muted) hover:text-red-500
                      hover:bg-red-50 dark:hover:bg-red-950/30
                      opacity-0 group-hover:opacity-100
                      transition-all duration-150
                      disabled:opacity-50
                    "
                  >
                    {deletingId === aluno.id
                      ? <span className="w-3.5 h-3.5 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" />
                      : <Trash2 size={13} />
                    }
                  </button>
                )}
                {/* Botão de chat  professor abre conversa direto com o aluno */}
                {isTeacher && (
                  <button
                    onClick={(e) => { e.stopPropagation(); chatBus.open(aluno.id); }}
                    title="Abrir chat com aluno"
                    className="
                      absolute top-3 right-12 w-7 h-7 rounded-lg
                      flex items-center justify-center
                      text-[var(--muted)] hover:text-[var(--accent-600)]
                      hover:bg-[var(--hover-bg)]
                      opacity-0 group-hover:opacity-100
                      transition-all duration-150
                    "
                  >
                    <MessageSquare size={13} />
                  </button>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <Avatar name={aluno.nome} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-(--heading) truncate">{aluno.nome}</h3>
                    {aluno.apelido && (
                      <p className="text-xs text-(--muted) truncate flex items-center gap-1 mt-0.5">
                        <Tag size={10} className="shrink-0" />
                        {aluno.apelido}
                      </p>
                    )}
                    <Badge variant={aluno.ativo ? 'success' : 'warning'} className="mt-1.5">
                      {aluno.ativo ? t('common.active') : t('common.inactive')}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-(--muted)">
                    <Mail size={12} className="text-(--accent-500) shrink-0" />
                    <span className="truncate">{aluno.email}</span>
                  </div>
                  {aluno.telefone && (
                    <div className="flex items-center gap-2 text-xs text-(--muted)">
                      <Phone size={12} className="text-(--accent-500) shrink-0" />
                      <a
                        href={`https://api.whatsapp.com/send/?phone=${phoneToWhatsApp(aluno.telefone)}&type=phone_number&app_absent=0`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="hover:text-green-500 transition-colors"
                      >
                        {formatPhoneGlobal(aluno.telefone)}
                      </a>
                    </div>
                  )}
                  {aluno.planoAulasMes != null && (
                    <div className="flex items-center gap-2 text-xs text-(--muted)">
                      <Calendar size={12} className="text-(--accent-500) shrink-0" />
                      <span>{aluno.planoAulasMes} aulas/mês</span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-(--muted)">
          <p className="text-sm">{t('students.none')}</p>
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <span className="text-xs text-(--muted)">
            {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} {t('common.of')} {filtered.length} {t('nav.students').toLowerCase()}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => changePage(safePage - 1)}
              disabled={safePage === 0}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-(--muted) hover:bg-(--hover-bg) disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => changePage(i)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                  i === safePage
                    ? 'bg-(--accent-500) text-white'
                    : 'text-(--muted) hover:bg-(--hover-bg)'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => changePage(safePage + 1)}
              disabled={safePage === totalPages - 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-(--muted) hover:bg-(--hover-bg) disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
