import { motion } from 'framer-motion';
import {
  Music2,
  Trophy,
  Star,
  Calendar,
  Users,
  RefreshCw,
  Video,
  Bell,
  Guitar,
  Piano,
  Headphones,
  MonitorSmartphone,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import marcosPhoto from '../../assets/image.png';

interface LandingPageProps {
  onEnterLogin: () => void;
}

/* ─── Fade-up reutilizável ──────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.3, delay },
});

/* ─── Dados estáticos ───────────────────────────────────────── */
const TEACHER_STATS = [
  { icon: <Trophy size={14} />, label: '15+ anos', sub: 'de ensino' },
  { icon: <Star size={14} />, label: '4.9', sub: 'avaliação média' },
  { icon: <Users size={14} />, label: '120+', sub: 'alunos formados' },
];

const SCHOOL_OFFERINGS = [
  {
    icon: <Piano size={20} />,
    title: 'Piano & Teclado',
    desc: 'Do clássico ao popular — fundamentos sólidos para qualquer estilo.',
  },
  {
    icon: <Guitar size={20} />,
    title: 'Violão & Guitarra',
    desc: 'Ritmo, harmonia e técnica na palma da sua mão.',
  },
  {
    icon: <Headphones size={20} />,
    title: 'Produção Musical',
    desc: 'Criação, mixagem e exportação de faixas autorais.',
  },
  {
    icon: <MonitorSmartphone size={20} />,
    title: 'Aulas Online',
    desc: 'Mesma qualidade, de onde você estiver, com link de acesso direto.',
  },
];

const SOFTWARE_FEATURES = [
  {
    icon: <Calendar size={20} />,
    title: 'Agendamento Flexível',
    desc: 'Calendário interativo para você escolher ou visualizar os melhores horários para suas aulas.',
  },
  {
    icon: <RefreshCw size={20} />,
    title: 'Reagendamento Fácil',
    desc: 'Imprevistos acontecem. Solicite remarcações online em poucos cliques.',
  },
  {
    icon: <CheckCircle2 size={20} />,
    title: 'Histórico de Presença',
    desc: 'Acompanhe suas aulas e o seu desenvolvimento diretamente pela plataforma.',
  },
  {
    icon: <Video size={20} />,
    title: 'Material de Apoio',
    desc: 'Biblioteca de conteúdo gravado para você revisar as aulas a qualquer hora.',
  },
  {
    icon: <Bell size={20} />,
    title: 'Lembretes Automáticos',
    desc: 'Receba notificações configuráveis para nunca perder uma aula.',
  },
  {
    icon: <Users size={20} />,
    title: 'Portal do Aluno',
    desc: 'Uma área particular onde você acessa seu próprio calendário e evolução.',
  },
];

/* ────────────────────────────────────────────────────────────── */

export function LandingPage({ onEnterLogin }: LandingPageProps) {
  const handleContact = () => {
    window.open('mailto:marcos@musga.com', '_blank');
  };

  return (
    <div
      className="app-shell min-h-screen w-full overflow-y-auto"
      style={{ overflowX: 'hidden' }}
    >
      {/* ── Blobs de fundo ───────────────────────────── */}
      <div
        className="pointer-events-none fixed -left-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-40"
        style={{ backgroundColor: 'var(--accent-100)' }}
      />
      <div
        className="pointer-events-none fixed right-0 top-1/3 h-64 w-64 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: 'color-mix(in srgb, var(--accent-500) 20%, transparent)' }}
      />

      {/* ══════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-sm"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'color-mix(in srgb, var(--surface) 85%, transparent)',
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'var(--accent-100)', color: 'var(--accent-600)' }}
            >
              <Music2 size={16} />
            </div>
            <span className="text-sm font-black tracking-tight" style={{ color: 'var(--text)' }}>
              Escola de Música do Musga
            </span>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={handleContact}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-80"
              style={{ color: 'var(--muted)' }}
            >
              Contato
            </button>
            <button
              id="navbar-login-btn"
              onClick={onEnterLogin}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))',
              }}
            >
              Entrar <ArrowRight size={14} />
            </button>
          </nav>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 text-center">
        <motion.div {...fadeUp(0)}>
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--accent-50)',
              color: 'var(--accent-700)',
            }}
          >
            <Music2 size={12} /> Escola de Música do Musga
          </div>
        </motion.div>

        <motion.h1
          {...fadeUp(0.05)}
          className="mx-auto mt-4 max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl"
          style={{ color: 'var(--heading)' }}
        >
          Aprenda música de um{' '}
          <span
            className="bg-clip-text"
            style={{
              backgroundImage: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            jeito diferente
          </span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.1)}
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed"
          style={{ color: 'var(--muted)' }}
        >
          Metodologia gamificada, agenda online e acompanhamento real — tudo em um lugar só.
          Do iniciante ao avançado, presencial ou online.
        </motion.p>

        <motion.div
          {...fadeUp(0.15)}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            id="hero-contact-btn"
            onClick={handleContact}
            className="flex items-center gap-2 rounded-2xl border px-6 py-3 text-sm font-semibold transition hover:opacity-80"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text)',
              backgroundColor: 'var(--surface)',
            }}
          >
            <Mail size={15} /> Entrar em Contato
          </button>
          <button
            id="hero-login-btn"
            onClick={onEnterLogin}
            className="flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))',
            }}
          >
            Acessar a plataforma <ArrowRight size={15} />
          </button>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          SOBRE O PROFESSOR
      ══════════════════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <motion.div {...fadeUp(0)} className="mb-8 text-center">
          <SectionLabel>O Professor</SectionLabel>
          <h2 className="mt-3 text-3xl font-black" style={{ color: 'var(--heading)' }}>
            Marcos Mello
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            Professor de música, mentor e fã de progresso por fases.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp(0.05)}
          className="app-surface overflow-hidden rounded-3xl border shadow-xl"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="relative grid lg:grid-cols-[auto_1fr]">
            {/* Faixa de gradiente lateral */}
            <div
              className="relative hidden lg:block"
              style={{
                background: 'linear-gradient(180deg, var(--accent-gradient-from), var(--accent-gradient-to))',
                minWidth: '280px',
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className="h-32 w-32 overflow-hidden rounded-3xl border-4 border-white/30 shadow-2xl">
                  <img src={marcosPhoto} alt="Marcos Mello" className="h-full w-full object-cover" />
                </div>
                <p className="mt-4 text-center text-lg font-black text-white">Marcos Mello</p>
                <p className="mt-1 text-center text-xs text-indigo-200">Mentor Musical · Classe Sênior</p>
              </div>
              <div className="absolute -right-4 top-0 h-full w-8 blur-lg" style={{ backgroundColor: 'var(--surface)' }} />
            </div>

            {/* Conteúdo */}
            <div className="p-8">
              {/* Mobile: foto */}
              <div className="mb-6 flex items-center gap-4 lg:hidden">
                <div className="h-16 w-16 overflow-hidden rounded-2xl border-2" style={{ borderColor: 'var(--border)' }}>
                  <img src={marcosPhoto} alt="Marcos Mello" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="font-black" style={{ color: 'var(--text)' }}>Marcos Mello</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Mentor Musical</p>
                </div>
              </div>

              <div
                className="mb-2 inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-widest"
                style={{ backgroundColor: 'var(--accent-50)', color: 'var(--accent-700)' }}
              >
                Especialidades: Piano · Violão · Produção
              </div>

              <p className="mt-4 max-w-xl text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                Com mais de 15 anos de experiência, Marcos combina técnica rigorosa com
                uma metodologia gamificada única: cada aluno evolui por fases, desbloqueia
                objetivos e celebra conquistas reais. O resultado é um aprendizado consistente
                e genuinamente divertido.
              </p>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-sm">
                {TEACHER_STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border px-3 py-3 text-center"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-soft)' }}
                  >
                    <div
                      className="mb-1.5 inline-flex items-center justify-center rounded-lg p-1.5"
                      style={{ backgroundColor: 'var(--accent-icon-bg)', color: 'var(--accent-icon-fg)' }}
                    >
                      {stat.icon}
                    </div>
                    <p className="text-sm font-black" style={{ color: 'var(--text)' }}>{stat.label}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{stat.sub}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleContact}
                className="mt-6 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))',
                }}
              >
                <Phone size={14} /> Falar com o Marcos
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          SOBRE A ESCOLA
      ══════════════════════════════════════════════ */}
      <section
        className="border-y py-16"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-soft)' }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...fadeUp(0)} className="mb-10 text-center">
            <SectionLabel>A Escola</SectionLabel>
            <h2 className="mt-3 text-3xl font-black" style={{ color: 'var(--heading)' }}>
              O que é a Musga?
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                title: 'Ambiente Acolhedor',
                desc: 'Espaço pensado para que alunos de todas as idades se sintam confortáveis e motivados a aprender.',
                delay: 0,
              },
              {
                title: 'Metodologia por Fases',
                desc: 'Cada aluno avança no próprio ritmo, com metas claras por nível — do iniciante ao performer.',
                delay: 0.05,
              },
              {
                title: 'Presencial e Online',
                desc: 'Atendemos em estúdio e à distância com a mesma qualidade técnica e acompanhamento próximo.',
                delay: 0.1,
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                {...fadeUp(card.delay)}
                className="app-surface rounded-2xl border p-6"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="mb-3 h-1 w-10 rounded-full"
                  style={{ background: 'linear-gradient(90deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                />
                <h3 className="font-black" style={{ color: 'var(--text)' }}>{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          O QUE A ESCOLA OFERECE
      ══════════════════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <motion.div {...fadeUp(0)} className="mb-10 text-center">
          <SectionLabel>Modalidades</SectionLabel>
          <h2 className="mt-3 text-3xl font-black" style={{ color: 'var(--heading)' }}>
            O que a escola oferece
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: 'var(--muted)' }}>
            Instrumentos e formatos que se encaixam na sua rotina e objetivo musical.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SCHOOL_OFFERINGS.map((item, i) => (
            <motion.div
              key={item.title}
              {...fadeUp(i * 0.05)}
              className="app-surface group relative overflow-hidden rounded-2xl border p-5 transition hover:shadow-lg"
              style={{ borderColor: 'var(--border)' }}
            >
              <div
                className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
                style={{ backgroundColor: 'var(--accent-100)' }}
              />
              <div
                className="mb-4 inline-flex items-center justify-center rounded-xl p-2.5"
                style={{ backgroundColor: 'var(--accent-icon-bg)', color: 'var(--accent-icon-fg)' }}
              >
                {item.icon}
              </div>
              <h3 className="font-black" style={{ color: 'var(--text)' }}>{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BENEFÍCIOS DA TECNOLOGIA PARA O ALUNO
      ══════════════════════════════════════════════ */}
      <section
        className="border-y py-16"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-soft)' }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...fadeUp(0)} className="mb-10 text-center">
            <SectionLabel>Área do Aluno</SectionLabel>
            <h2 className="mt-3 text-3xl font-black" style={{ color: 'var(--heading)' }}>
              Tecnologia a favor do seu ensino
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: 'var(--muted)' }}>
              Ao se tornar um aluno da nossa escola, você ganha acesso exclusivo a um painel digital prático para acompanhar e gerenciar 100% da sua jornada musical.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SOFTWARE_FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                {...fadeUp(i * 0.05)}
                className="app-surface flex gap-4 rounded-2xl border p-5"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'var(--accent-icon-bg)', color: 'var(--accent-icon-fg)' }}
                >
                  {feat.icon}
                </div>
                <div>
                  <h3 className="font-black" style={{ color: 'var(--text)' }}>{feat.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <motion.div {...fadeUp(0)}>
          <h2 className="text-3xl font-black sm:text-4xl" style={{ color: 'var(--heading)' }}>
            Pronto para começar?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: 'var(--muted)' }}>
            Entre em contato e agende uma aula experimental gratuita, ou acesse
            a plataforma se já for aluno.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              id="cta-contact-btn"
              onClick={handleContact}
              className="flex items-center gap-2 rounded-2xl border px-6 py-3 text-sm font-semibold transition hover:opacity-80"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text)',
                backgroundColor: 'var(--surface)',
              }}
            >
              <Mail size={15} /> Entrar em Contato
            </button>
            <button
              id="cta-login-btn"
              onClick={onEnterLogin}
              className="flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))',
              }}
            >
              Acessar a plataforma <ArrowRight size={15} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer
        className="border-t"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'var(--accent-100)', color: 'var(--accent-600)' }}
            >
              <Music2 size={13} />
            </div>
            <span className="text-sm font-black" style={{ color: 'var(--text)' }}>Escola de Música do Musga</span>
          </div>

          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--muted)' }}>
            <a href="mailto:marcos@musga.com" className="flex items-center gap-1 hover:opacity-70 transition">
              <Mail size={12} /> marcos@musga.com
            </a>
          </div>

          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            © {new Date().getFullYear()} Musga. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ─── Sub-componente de label de seção ─────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--accent-50)',
        color: 'var(--accent-700)',
      }}
    >
      {children}
    </span>
  );
}
