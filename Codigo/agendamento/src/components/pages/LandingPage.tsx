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
  Disc3,
} from 'lucide-react';
import marcosPhoto from '../../assets/image.png';

interface LandingPageProps {
  onEnterLogin: () => void;
}

/* ─── Animation helpers ─────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
});

/* ─── Waveform decorativa ───────────────────────────────────── */
const WAVE_HEIGHTS = [32, 56, 44, 72, 50, 80, 42, 64, 36, 68, 54, 76, 46, 60, 34, 58, 70];
const WAVE_DURATIONS = [1.3, 1.6, 1.9, 1.2, 1.7, 1.1, 1.8, 1.4, 1.6, 1.3, 1.5, 1.2, 1.8, 1.5, 1.4, 1.7, 1.2];

function WaveformBars() {
  return (
    <div className="flex items-end gap-[3px] h-20" aria-hidden>
      {WAVE_HEIGHTS.map((h, i) => (
        <motion.div
          key={i}
          className="w-2 rounded-full"
          style={{
            height: h,
            background: 'linear-gradient(180deg, var(--accent-gradient-from), var(--accent-gradient-to))',
            opacity: 0.35,
          }}
          animate={{ scaleY: [1, 0.35, 0.75, 0.4, 1] }}
          transition={{ duration: WAVE_DURATIONS[i], repeat: Infinity, delay: i * 0.09, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ─── Nota musical flutuante ────────────────────────────────── */
function FloatingNote({ note, left, delay }: { note: string; left: string; delay: number }) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none select-none absolute bottom-4 text-3xl font-black"
      style={{ left, color: 'var(--accent-500)' }}
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: [0, -160], opacity: [0, 0.55, 0] }}
      transition={{ duration: 4 + delay * 0.6, delay, repeat: Infinity, ease: 'easeOut' }}
    >
      {note}
    </motion.span>
  );
}

/* ─── Marquee ──────────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  '♩ Piano', '♪ Violão', '♫ Guitarra', '♬ Produção Musical',
  '♩ Aulas Online', '♪ Presencial', '♫ Iniciantes', '♬ Avançados',
  '♩ Metodologia por Fases', '♪ Marcos Music',
];

function Marquee() {
  return (
    <div
      className="overflow-hidden border-y py-3.5"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-soft)' }}
    >
      <motion.div
        className="flex gap-10 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      >
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="text-sm font-black" style={{ color: 'var(--accent-600)' }}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Dados estáticos ───────────────────────────────────────── */
const TEACHER_STATS = [
  { icon: <Trophy size={20} />, label: '15+', sub: 'Anos de Ensino' },
  { icon: <Star size={20} />, label: '4.9★', sub: 'Avaliação Média' },
  { icon: <Users size={20} />, label: '120+', sub: 'Alunos Formados' },
];

const SCHOOL_PILLARS = [
  {
    emoji: '🎶',
    title: 'Ambiente Acolhedor',
    desc: 'Espaço pensado para que alunos de todas as idades se sintam confortáveis e motivados.',
  },
  {
    emoji: '🏆',
    title: 'Metodologia por Fases',
    desc: 'Cada aluno avança no próprio ritmo, com metas claras por nível — do iniciante ao performer.',
  },
  {
    emoji: '🌐',
    title: 'Presencial e Online',
    desc: 'Atendemos em estúdio e à distância com a mesma qualidade técnica e acompanhamento próximo.',
  },
];

const SCHOOL_OFFERINGS = [
  { icon: <Piano size={24} />, title: 'Piano & Teclado', desc: 'Do clássico ao popular — fundamentos sólidos para qualquer estilo.' },
  { icon: <Guitar size={24} />, title: 'Violão & Guitarra', desc: 'Ritmo, harmonia e técnica na palma da sua mão.' },
  { icon: <Headphones size={24} />, title: 'Produção Musical', desc: 'Criação, mixagem e exportação de faixas autorais.' },
  { icon: <MonitorSmartphone size={24} />, title: 'Aulas Online', desc: 'Mesma qualidade, de onde você estiver, com link de acesso direto.' },
];

const SOFTWARE_FEATURES = [
  { icon: <Calendar size={20} />, title: 'Agendamento Inteligente', desc: 'Calendário visual interativo com arrastar e soltar para organizar as aulas.' },
  { icon: <RefreshCw size={20} />, title: 'Reagendamento Fácil', desc: 'Solicite e confirme remarcações em poucos cliques, sem idas e vindas.' },
  { icon: <CheckCircle2 size={20} />, title: 'Controle de Presença', desc: 'Confirme presença diretamente pela plataforma, com histórico completo.' },
  { icon: <Video size={20} />, title: 'Vídeo-aulas', desc: 'Biblioteca de conteúdo gravado para revisar a qualquer hora.' },
  { icon: <Bell size={20} />, title: 'Lembretes Automáticos', desc: 'Notificações configuráveis para nunca perder uma aula.' },
  { icon: <Users size={20} />, title: 'Portal do Aluno', desc: 'Cada aluno acessa apenas seu próprio calendário e conteúdo.' },
];

/* ────────────────────────────────────────────────────────────── */

export function LandingPage({ onEnterLogin }: LandingPageProps) {
  const handleContact = () => {
    window.open('mailto:marcos@marcosmusic.com.br', '_blank');
  };

  return (
    <div className="app-shell min-h-screen w-full overflow-y-auto" style={{ overflowX: 'hidden' }}>

      {/* ── Blobs de fundo ───────────────────────────── */}
      <div className="pointer-events-none fixed -left-32 -top-32 h-96 w-96 rounded-full blur-3xl opacity-25"
        style={{ backgroundColor: 'var(--accent-100)' }} />
      <div className="pointer-events-none fixed right-0 top-1/3 h-80 w-80 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: 'color-mix(in srgb, var(--accent-500) 22%, transparent)' }} />
      <div className="pointer-events-none fixed left-1/3 bottom-1/4 h-64 w-64 rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: 'var(--accent-300)' }} />

      {/* ══════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'color-mix(in srgb, var(--surface) 88%, transparent)',
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.55 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl shadow-md"
              style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))', color: 'white' }}
            >
              <Music2 size={17} />
            </motion.div>
            <span className="text-sm font-black tracking-tight" style={{ color: 'var(--text)' }}>
              Marcos Music
            </span>
            <span className="text-sm font-black tracking-tight" style={{ color: 'var(--accent-600)' }}>
              Agenda
            </span>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={handleContact}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-70"
              style={{ color: 'var(--muted)' }}
            >
              Contato
            </button>
            <motion.button
              id="navbar-login-btn"
              onClick={onEnterLogin}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
            >
              Entrar <ArrowRight size={14} />
            </motion.button>
          </nav>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-6xl overflow-hidden px-6 pb-16 pt-24 text-center">

        {/* Notas flutuantes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <FloatingNote note="♩" left="6%"  delay={0} />
          <FloatingNote note="♪" left="18%" delay={1.2} />
          <FloatingNote note="♫" left="32%" delay={2.6} />
          <FloatingNote note="♬" left="54%" delay={0.6} />
          <FloatingNote note="♩" left="68%" delay={1.9} />
          <FloatingNote note="♪" left="80%" delay={0.3} />
          <FloatingNote note="♫" left="91%" delay={2.1} />
        </div>

        <motion.div {...fadeUp(0)}>
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--accent-50)', color: 'var(--accent-700)' }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: 'var(--accent-500)' }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--accent-600)' }} />
            </span>
            🎵 Escola de Música — Marcos Music
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.07)}
          className="mx-auto mt-5 max-w-4xl text-5xl font-black leading-tight tracking-tight sm:text-7xl"
          style={{ color: 'var(--heading)' }}
        >
          Sua música{' '}
          <span
            style={{
              backgroundImage: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            começa aqui.
          </span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.12)}
          className="mx-auto mt-6 max-w-lg text-lg leading-relaxed"
          style={{ color: 'var(--muted)' }}
        >
          Metodologia gamificada, agenda online e acompanhamento real.
          Do iniciante ao avançado — presencial ou online.
        </motion.p>

        <motion.div {...fadeUp(0.16)} className="mt-7 flex justify-center">
          <WaveformBars />
        </motion.div>

        <motion.div
          {...fadeUp(0.20)}
          className="mt-7 flex flex-wrap items-center justify-center gap-3"
        >
          <motion.button
            id="hero-contact-btn"
            onClick={handleContact}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-2xl border px-7 py-3.5 text-sm font-bold"
            style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--surface)' }}
          >
            <Mail size={15} /> Entrar em Contato
          </motion.button>
          <motion.button
            id="hero-login-btn"
            onClick={onEnterLogin}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-bold text-white shadow-2xl"
            style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
          >
            Acessar a Plataforma <ArrowRight size={15} />
          </motion.button>
        </motion.div>
      </section>

      {/* ── Marquee ─────────────────────────────────── */}
      <Marquee />

      {/* ══════════════════════════════════════════════
          BIG STATS
      ══════════════════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-3 gap-5">
          {TEACHER_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              {...fadeUp(i * 0.08)}
              whileHover={{ y: -5 }}
              className="app-surface relative overflow-hidden rounded-3xl border p-7 text-center cursor-default"
              style={{ borderColor: 'var(--border)' }}
            >
              <div
                className="pointer-events-none absolute -right-5 -top-5 h-24 w-24 rounded-full blur-2xl opacity-50"
                style={{ backgroundColor: 'var(--accent-100)' }}
              />
              <div
                className="mb-3 inline-flex items-center justify-center rounded-2xl p-3"
                style={{ backgroundColor: 'var(--accent-icon-bg)', color: 'var(--accent-icon-fg)' }}
              >
                {stat.icon}
              </div>
              <p className="text-4xl font-black" style={{ color: 'var(--heading)' }}>{stat.label}</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{stat.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          A ESCOLA
      ══════════════════════════════════════════════ */}
      <section
        className="border-y py-16"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-soft)' }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...fadeUp(0)} className="mb-10 text-center">
            <SectionLabel icon="🎸">A Escola</SectionLabel>
            <h2 className="mt-3 text-4xl font-black" style={{ color: 'var(--heading)' }}>
              O que é a Marcos Music?
            </h2>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-3">
            {SCHOOL_PILLARS.map((card, i) => (
              <motion.div
                key={card.title}
                {...fadeUp(i * 0.07)}
                whileHover={{ y: -4, scale: 1.01 }}
                className="app-surface rounded-3xl border p-7 cursor-default"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="mb-4 h-1.5 w-12 rounded-full"
                  style={{ background: 'linear-gradient(90deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                />
                <div className="mb-3 text-3xl">{card.emoji}</div>
                <h3 className="text-base font-black" style={{ color: 'var(--text)' }}>{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SOBRE O PROFESSOR
      ══════════════════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <motion.div {...fadeUp(0)} className="mb-10 text-center">
          <SectionLabel icon="🎹">O Professor</SectionLabel>
          <h2 className="mt-3 text-4xl font-black" style={{ color: 'var(--heading)' }}>Marcos Mello</h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            Mentor musical · 15+ anos transformando vidas através da música
          </p>
        </motion.div>

        <motion.div
          {...fadeUp(0.05)}
          className="relative overflow-hidden rounded-3xl border shadow-2xl"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Subtle gradient overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-gradient-from) 10%, transparent) 0%, transparent 55%)' }}
          />

          <div className="grid lg:grid-cols-[290px_1fr]">
            {/* Coluna da foto */}
            <div
              className="relative hidden lg:flex flex-col items-center justify-center gap-5 p-10"
              style={{ background: 'linear-gradient(160deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
            >
              <motion.div
                whileHover={{ scale: 1.04 }}
                className="h-36 w-36 overflow-hidden rounded-3xl border-4 border-white/30 shadow-2xl"
              >
                <img src={marcosPhoto} alt="Marcos Mello" className="h-full w-full object-cover" />
              </motion.div>
              <div className="text-center">
                <p className="text-xl font-black text-white">Marcos Mello</p>
                <p className="mt-1 text-sm text-indigo-200">Piano · Violão · Produção</p>
              </div>
              {/* Disco decorativo girando */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full border-4 border-white/10 opacity-15"
                style={{
                  background: 'conic-gradient(from 0deg, #000 0deg 30deg, transparent 30deg 60deg, #000 60deg 90deg, transparent 90deg 360deg)',
                }}
              />
            </div>

            {/* Conteúdo */}
            <div className="p-8 app-surface">
              {/* Mobile foto */}
              <div className="mb-6 flex items-center gap-4 lg:hidden">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2" style={{ borderColor: 'var(--border)' }}>
                  <img src={marcosPhoto} alt="Marcos Mello" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="font-black" style={{ color: 'var(--text)' }}>Marcos Mello</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Mentor Musical</p>
                </div>
              </div>

              <div
                className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-widest"
                style={{ backgroundColor: 'var(--accent-50)', color: 'var(--accent-700)' }}
              >
                🎹 Especialidades: Piano · Violão · Produção
              </div>

              <p className="mt-5 max-w-xl text-base leading-relaxed" style={{ color: 'var(--text)' }}>
                Com mais de <strong>15 anos de experiência</strong>, Marcos combina técnica rigorosa com
                uma metodologia gamificada única: cada aluno evolui por fases, desbloqueia
                objetivos e celebra conquistas reais. O resultado é um aprendizado consistente
                e genuinamente divertido.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {['Piano', 'Violão', 'Guitarra', 'Produção', 'Teoria Musical', 'Leitura de Partitura'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border px-3 py-1 text-xs font-semibold"
                    style={{ borderColor: 'var(--border)', color: 'var(--accent-700)', backgroundColor: 'var(--accent-50)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleContact}
                className="mt-7 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
              >
                <Phone size={14} /> Falar com o Marcos
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          O QUE A ESCOLA OFERECE
      ══════════════════════════════════════════════ */}
      <section
        className="border-y py-16"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-soft)' }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...fadeUp(0)} className="mb-10 text-center">
            <SectionLabel icon="🎵">Modalidades</SectionLabel>
            <h2 className="mt-3 text-4xl font-black" style={{ color: 'var(--heading)' }}>
              O que a escola oferece
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: 'var(--muted)' }}>
              Instrumentos e formatos que se encaixam na sua rotina e objetivo musical.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SCHOOL_OFFERINGS.map((item, i) => (
              <motion.div
                key={item.title}
                {...fadeUp(i * 0.07)}
                whileHover={{ y: -6, scale: 1.02 }}
                className="app-surface group relative overflow-hidden rounded-3xl border p-6 cursor-default"
                style={{ borderColor: 'var(--border)' }}
              >
                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
                  style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-gradient-from) 10%, transparent), transparent)' }}
                />
                <div
                  className="mb-4 h-1.5 w-10 rounded-full"
                  style={{ background: 'linear-gradient(90deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                />
                <div
                  className="mb-4 inline-flex items-center justify-center rounded-2xl p-3"
                  style={{ backgroundColor: 'var(--accent-icon-bg)', color: 'var(--accent-icon-fg)' }}
                >
                  {item.icon}
                </div>
                <h3 className="text-base font-black" style={{ color: 'var(--text)' }}>{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PLATAFORMA
      ══════════════════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <motion.div {...fadeUp(0)} className="mb-10 text-center">
          <SectionLabel icon="💻">Plataforma</SectionLabel>
          <h2 className="mt-3 text-4xl font-black" style={{ color: 'var(--heading)' }}>
            Tudo que você precisa, num só lugar
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: 'var(--muted)' }}>
            A Marcos Music Agenda foi construída para tornar a gestão das aulas
            simples e transparente para professor e alunos.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SOFTWARE_FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              {...fadeUp(i * 0.06)}
              whileHover={{ scale: 1.02, y: -2 }}
              className="app-surface flex gap-4 rounded-2xl border p-5"
              style={{ borderColor: 'var(--border)' }}
            >
              <div
                className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm"
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
      </section>

      {/* ══════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════ */}
      <section
        className="border-t py-6"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-soft)' }}
      >
        <div className="mx-auto max-w-6xl px-6 py-14">
          <motion.div
            {...fadeUp(0)}
            className="relative overflow-hidden rounded-3xl border p-12 text-center shadow-2xl"
            style={{
              borderColor: 'var(--border)',
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-gradient-from) 14%, var(--surface)), color-mix(in srgb, var(--accent-gradient-to) 9%, var(--surface)))',
            }}
          >
            {/* Decorative notes */}
            <span aria-hidden className="pointer-events-none select-none absolute left-6 top-5 text-5xl opacity-10">♬</span>
            <span aria-hidden className="pointer-events-none select-none absolute right-6 bottom-5 text-6xl opacity-10">♩</span>
            <span aria-hidden className="pointer-events-none select-none absolute right-14 top-1/2 -translate-y-1/2 text-4xl opacity-10">♪</span>
            <span aria-hidden className="pointer-events-none select-none absolute left-1/4 bottom-4 text-3xl opacity-10">♫</span>

            <motion.div
              className="mb-5 inline-flex items-center justify-center rounded-2xl p-4"
              style={{ backgroundColor: 'var(--accent-icon-bg)', color: 'var(--accent-icon-fg)' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Disc3 size={28} />
            </motion.div>

            <h2 className="text-4xl font-black sm:text-5xl" style={{ color: 'var(--heading)' }}>
              Pronto para começar?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: 'var(--muted)' }}>
              Entre em contato e agende uma aula experimental gratuita, ou acesse
              a plataforma se já for aluno.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <motion.button
                id="cta-contact-btn"
                onClick={handleContact}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-2xl border px-7 py-3.5 text-sm font-bold"
                style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--surface)' }}
              >
                <Mail size={15} /> Entrar em Contato
              </motion.button>
              <motion.button
                id="cta-login-btn"
                onClick={onEnterLogin}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-bold text-white shadow-2xl"
                style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
              >
                Acessar a Plataforma <ArrowRight size={15} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))', color: 'white' }}
            >
              <Music2 size={15} />
            </div>
            <span className="text-sm font-black" style={{ color: 'var(--text)' }}>Marcos Music</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--accent-600)' }}>Agenda</span>
          </div>

          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--muted)' }}>
            <a
              href="mailto:marcos@marcosmusic.com.br"
              className="flex items-center gap-1 hover:opacity-70 transition"
            >
              <Mail size={12} /> marcos@marcosmusic.com.br
            </a>
          </div>

          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            © {new Date().getFullYear()} Marcos Music. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ─── Sub-componente de label de seção ─────────────────────── */
function SectionLabel({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--accent-50)',
        color: 'var(--accent-700)',
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
}
