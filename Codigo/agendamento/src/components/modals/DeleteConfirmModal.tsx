import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, AlertTriangle } from 'lucide-react';
import type { Aluno } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export interface DeleteConfirmModalProps {
  aluno: Aluno | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export function DeleteConfirmModal({ aluno, onConfirm, onCancel, loading }: DeleteConfirmModalProps) {
  const { t } = useLanguage();
  return (
    <AnimatePresence>
      {aluno && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-998"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-999 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          >
            <div
              className="w-full max-w-sm bg-(--surface) rounded-2xl shadow-2xl border border-(--border) overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Ícone animado */}
              <div className="flex flex-col items-center pt-8 pb-4 px-6">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center mb-4"
                  initial={{ rotate: -8, scale: 0.8 }}
                  animate={{ rotate: [-8, 8, -5, 5, 0], scale: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ delay: 0.3, duration: 0.4, ease: 'easeInOut' }}
                  >
                    <Trash2 size={28} className="text-red-500" />
                  </motion.div>
                </motion.div>

                <h2 className="text-base font-bold text-(--heading) text-center">
                  {t('modals.deleteStudent.title')}
                </h2>
                <p className="text-sm text-(--muted) text-center mt-1.5 leading-relaxed">
                  <span className="font-semibold text-(--text)">{aluno.nome}</span>
                  {' '}{t('modals.deleteStudent.permanent')}
                </p>

                <div className="flex items-center gap-1.5 mt-3 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                  <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                  <span className="text-[11px] text-amber-700 dark:text-amber-400">
                    {t('modals.deleteStudent.loginData')}
                  </span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 px-6 py-4 border-t border-(--border)">
                <button
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1 h-10 rounded-xl text-sm font-medium text-(--muted) hover:text-(--text) hover:bg-(--hover-bg) transition-colors disabled:opacity-50"
                >
                  {t('modals.deleteStudent.cancel')}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 h-10 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <Trash2 size={14} />
                  }
                  {loading ? t('modals.deleteStudent.deleting') : t('modals.deleteStudent.delete')}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
