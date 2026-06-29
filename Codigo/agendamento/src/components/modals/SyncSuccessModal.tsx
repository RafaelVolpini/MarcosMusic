import { motion, AnimatePresence } from 'framer-motion';
import { Check, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface SyncSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
}

export function SyncSuccessModal({ isOpen, onClose, count }: SyncSuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm overflow-hidden bg-(--surface) rounded-[2rem] shadow-2xl border border-(--border)"
          >
            {/* Top Decoration */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent pointer-events-none" />

            <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
              {/* Animated Icon Container */}
              <motion.div
                initial={{ rotate: -20, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                className="relative mb-6"
              >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Check className="text-white" size={40} strokeWidth={3} />
                </div>
                
                {/* Floaties */}
                <motion.div
                  animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="absolute -top-2 -right-2 text-emerald-500"
                >
                  <Calendar size={16} fill="currentColor" className="opacity-20" />
                </motion.div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-(--heading) mb-2"
              >
                Tudo Pronto!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-(--muted) text-sm leading-relaxed mb-8 px-4"
              >
                {count > 0 
                  ? `${count} aulas foram sincronizadas com sucesso no seu Google Calendar.`
                  : 'Sua agenda já está sincronizada com o Google Calendar.'
                }
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full"
              >
                <Button
                  onClick={onClose}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 border-0 text-white font-bold text-base shadow-xl shadow-emerald-900/10 group"
                >
                  <span className="flex items-center gap-2">
                    Voltar para o Início
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </motion.div>
            </div>

            {/* Bottom Decoration */}
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-emerald-500/5 to-transparent pointer-events-none rounded-tl-[3rem]" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
