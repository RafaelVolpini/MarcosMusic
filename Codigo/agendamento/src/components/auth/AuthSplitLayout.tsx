import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { MarcosLogoMark } from '../ui/MarcosLogo';
import { InteractivePiano } from '../ui/InteractivePiano';

interface AuthSplitLayoutProps {
  children: ReactNode;
}

/**
 * Layout compartilhado das telas de autenticação (login, esqueci senha, redefinir senha).
 * Painel esquerdo com identidade visual da escola; painel direito com o formulário.
 */
export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-(--bg)">
      {/* Painel esquerdo — identidade musical, tom de madeira que acompanha o tema */}
      <section
        className="relative hidden w-[44%] shrink-0 flex-col justify-between overflow-hidden border-r border-(--border) px-10 py-12 lg:flex xl:w-[40%]"
        style={{
          background: 'linear-gradient(160deg, color-mix(in srgb, #a9764a 20%, var(--surface)) 0%, color-mix(in srgb, #8a5a34 24%, var(--surface)) 100%)',
        }}
      >
        {/* Veios de madeira sutis */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply"
          style={{
            backgroundImage: 'repeating-linear-gradient(98deg, #3a2412 0px, transparent 2px, transparent 18px, #3a2412 20px)',
          }}
        />

        <div className="relative flex items-center gap-2.5">
          <MarcosLogoMark size={34} />
          <div className="leading-none">
            <p className="text-sm font-bold text-(--heading)">Marcos Music</p>
            <p className="text-[11px] font-medium uppercase tracking-widest text-(--muted)">Escola de Música</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-sm"
        >
          <h1 className="text-3xl font-bold leading-tight text-(--heading)">
            Onde a rotina de aulas encontra a música.
          </h1>
          <p className="mt-3 text-sm text-(--muted)">
            Agende aulas, acompanhe reposições e mantenha contato com seus alunos em um único lugar.
          </p>
        </motion.div>

        <div>
          <p className="mb-3 text-xs font-medium text-(--muted)">
            Toque com o mouse ou o teclado (A S D F G H J...)
          </p>
          <InteractivePiano />
        </div>
      </section>

      {/* Painel direito — formulário */}
      <section className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">{children}</div>
      </section>
    </div>
  );
}
