import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Star, Calendar, Users, RefreshCw, Video,
  Bell, Guitar, Piano, Headphones, MonitorSmartphone,
  Mail, Phone, ArrowRight, CheckCircle2, Disc3, Play,
  Zap, Shield, Clock, Music, Globe,
} from 'lucide-react';
import marcosPhoto from '../../assets/image.png';
import { MarcosLogoMark } from '../ui/MarcosLogo';

interface LandingPageProps {
  onEnterLogin: () => void;
}

/* ─── Animated background blobs ────────────────────────────── */
const BLOBS = [
  { size: 520, x: [-8, 12, -4, 8, -8],   y: [-8, 6, 14, -2, -8],  dur: 18, delay: 0, color: 'var(--accent-gradient-from)', opacity: 0.13 },
  { size: 420, x: [70, 58, 72, 62, 70],  y: [20, 32, 18, 28, 20], dur: 22, delay: 4, color: 'var(--accent-gradient-to)',   opacity: 0.10 },
  { size: 360, x: [40, 52, 36, 48, 40],  y: [55, 44, 60, 48, 55], dur: 26, delay: 8, color: 'var(--accent-300)',           opacity: 0.09 },
  { size: 300, x: [15, 24, 10, 20, 15],  y: [70, 62, 76, 68, 70], dur: 20, delay: 2, color: 'var(--accent-gradient-from)', opacity: 0.07 },
];

function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          aria-hidden
          className="absolute rounded-full blur-3xl"
          style={{
            width: b.size, height: b.size,
            backgroundColor: b.color, opacity: b.opacity,
            left: `${b.x[0]}%`, top: `${b.y[0]}%`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            left: b.x.map(v => `${v}%`),
            top:  b.y.map(v => `${v}%`),
            scale: [1, 1.12, 0.94, 1.08, 1],
          }}
          transition={{ duration: b.dur, repeat: Infinity, delay: b.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ─── Animation helpers ─────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
});

/* ─── Waveform ──────────────────────────────────────────────── */
const WAVE_HEIGHTS = [32, 56, 44, 72, 50, 80, 42, 64, 36, 68, 54, 76, 46, 60, 34, 58, 70];
const WAVE_DURATIONS = [1.3, 1.6, 1.9, 1.2, 1.7, 1.1, 1.8, 1.4, 1.6, 1.3, 1.5, 1.2, 1.8, 1.5, 1.4, 1.7, 1.2];
function WaveformBars() {
  return (
    <div className="flex items-end gap-[3px] h-20" aria-hidden>
      {WAVE_HEIGHTS.map((h, i) => (
        <motion.div key={i} className="w-2 rounded-full"
          style={{ height: h, background: 'linear-gradient(180deg, var(--accent-gradient-from), var(--accent-gradient-to))', opacity: 0.4 }}
          animate={{ scaleY: [1, 0.3, 0.7, 0.4, 1] }}
          transition={{ duration: WAVE_DURATIONS[i], repeat: Infinity, delay: i * 0.09, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ─── Floating notes ────────────────────────────────────────── */
function FloatingNote({ note, left, delay }: { note: string; left: string; delay: number }) {
  return (
    <motion.span aria-hidden className="pointer-events-none select-none absolute bottom-4 text-3xl font-black"
      style={{ left, color: 'var(--accent-400)', opacity: 0 }}
      animate={{ y: [0, -160], opacity: [0, 0.45, 0] }}
      transition={{ duration: 4 + delay * 0.6, delay, repeat: Infinity, ease: 'easeOut' }}
    >
      {note}
    </motion.span>
  );
}

/* ─── Marquee ──────────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  'Piano', 'Violao', 'Guitarra', 'Producao Musical',
  'Aulas Online', 'Presencial', 'Iniciantes', 'Avancados',
  'Metodologia por Fases', 'Marcos Music Agenda',
];
function Marquee() {
  return (
    <div className="overflow-hidden border-y py-3.5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-soft)' }}>
      <motion.div className="flex gap-12 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent-600)' }}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Section label ─────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--accent-50)', color: 'var(--accent-700)' }}
    >
      {children}
    </span>
  );
}

/* ─── Static data ───────────────────────────────────────────── */
const TEACHER_STATS = [
  { icon: <Trophy size={20} />, label: '15+', sub: 'Anos de Ensino' },
  { icon: <Star size={20} />, label: '4.9', sub: 'Avaliacao Media' },
  { icon: <Users size={20} />, label: '120+', sub: 'Alunos Formados' },
];

const SCHOOL_PILLARS = [
  { icon: <Music size={22} />,  title: 'Ambiente Acolhedor',    desc: 'Espaco pensado para que alunos de todas as idades se sintam confortaveis e motivados.' },
  { icon: <Trophy size={22} />, title: 'Metodologia por Fases', desc: 'Cada aluno avanca no proprio ritmo, com metas claras por nivel do iniciante ao performer.' },
  { icon: <Globe size={22} />,  title: 'Presencial e Online',   desc: 'Atendemos em estudio e a distancia com a mesma qualidade tecnica e acompanhamento proximo.' },
];

const SCHOOL_OFFERINGS = [
  { icon: <Piano size={24} />,          title: 'Piano e Teclado',    desc: 'Do classico ao popular  fundamentos solidos para qualquer estilo.' },
  { icon: <Guitar size={24} />,         title: 'Violao e Guitarra',  desc: 'Ritmo, harmonia e tecnica na palma da sua mao.' },
  { icon: <Headphones size={24} />,     title: 'Producao Musical',   desc: 'Criacao, mixagem e exportacao de faixas autorais.' },
  { icon: <MonitorSmartphone size={24} />, title: 'Aulas Online',    desc: 'Mesma qualidade, de onde voce estiver, com link de acesso direto.' },
];

const SOFTWARE_FEATURES = [
  { icon: <Calendar size={20} />,    title: 'Agendamento Inteligente', desc: 'Calendario visual interativo com arrastar e soltar para organizar as aulas.' },
  { icon: <RefreshCw size={20} />,   title: 'Reagendamento Facil',     desc: 'Solicite e confirme remarcacoes em poucos cliques, sem idas e vindas.' },
  { icon: <CheckCircle2 size={20} />, title: 'Controle de Presenca',   desc: 'Confirme presenca diretamente pela plataforma, com historico completo.' },
  { icon: <Video size={20} />,       title: 'Video-aulas',             desc: 'Biblioteca de conteudo gravado para revisar a qualquer hora.' },
  { icon: <Bell size={20} />,        title: 'Lembretes Automaticos',   desc: 'Notificacoes configuravelspara nunca perder uma aula.' },
  { icon: <Users size={20} />,       title: 'Portal do Aluno',         desc: 'Cada aluno acessa apenas seu proprio calendario e conteudo.' },
];

const PLANS = [
  {
    id: 'essencial',
    name: 'Essencial',
    badge: null,
    freq: '1 aula por semana',
    highlight: false,
    perks: [
      'Acesso a plataforma Marcos Music Agenda',
      'Confirmacao e reagendamento online',
      'Lembretes automaticos por notificacao',
      'Historico completo de aulas',
      'Suporte por WhatsApp',
    ],
    cta: 'Quero este plano',
    icon: <Clock size={22} />,
  },
  {
    id: 'intensivo',
    name: 'Intensivo',
    badge: 'Mais popular',
    freq: '2 aulas por semana',
    highlight: true,
    perks: [
      'Tudo do plano Essencial',
      'Evolucao duas vezes mais rapida',
      'Acesso prioritario a reposicoes',
      'Aulas gravadas para revisao',
      'Acompanhamento personalizado',
      'Relatorio mensal de progresso',
    ],
    cta: 'Quero evoluir mais rapido',
    icon: <Zap size={22} />,
  },
];

/* ─── YouTube Player ────────────────────────────────────────── */
function YoutubeEmbed({ videoId, title, subtitle }: { videoId: string; title: string; subtitle: string }) {
  const [playing, setPlaying] = useState(false);
  const thumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  return (
    <motion.div {...fadeUp(0.04)}
      className="app-surface overflow-hidden rounded-3xl border shadow-xl"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="p-3">
        <div className="relative w-full overflow-hidden rounded-2xl bg-black" style={{ aspectRatio: '16/9' }}>
          {playing ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <>
              <img src={thumb} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <motion.button
                onClick={() => setPlaying(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Reproduzir: ${title}`}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div
                  animate={{ boxShadow: ['0 0 0 0 color-mix(in srgb, var(--accent-500) 35%, transparent)', '0 0 0 20px transparent'] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="flex items-center justify-center rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))',
                    width: 68, height: 68,
                  }}
                >
                  <Play size={26} fill="white" className="text-white ml-1" />
                </motion.div>
              </motion.button>
            </>
          )}
        </div>
      </div>
      <div className="px-5 pb-5 pt-2">
        <p className="font-black text-base" style={{ color: 'var(--text)' }}>{title}</p>
        <p className="mt-0.5 text-sm" style={{ color: 'var(--muted)' }}>{subtitle}</p>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export function LandingPage({ onEnterLogin }: LandingPageProps) {
  const handleContact = () => window.open('mailto:marcoslima91@hotmail.com', '_blank');
  const handleWhatsApp = () => window.open('https://wa.me/5531999999999?text=Ola!%20Gostaria%20de%20mais%20informacoes%20sobre%20as%20aulas.', '_blank');

  return (
    <div className="app-shell min-h-screen w-full overflow-y-auto" style={{ overflowX: 'hidden' }}>

      <AnimatedBackground />

      {/* ══════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{ borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--surface) 88%, transparent)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
              <MarcosLogoMark size={36} />
            </motion.div>
            <div className="flex flex-col leading-none">
              <span className="text-xs font-black tracking-tight" style={{ color: 'var(--text)' }}>Marcos Music</span>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent-600)' }}>Agenda</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            {[['#escola', 'A Escola'], ['#professor', 'Professor'], ['#videos', 'Videos'], ['#planos', 'Planos']].map(([href, label]) => (
              <a key={href} href={href} className="font-semibold transition hover:opacity-70" style={{ color: 'var(--muted)' }}>
                {label}
              </a>
            ))}
          </nav>

          <motion.button
            onClick={onEnterLogin}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
          >
            Entrar <ArrowRight size={14} />
          </motion.button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-6xl overflow-hidden px-6 pb-16 pt-24 text-center">
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
          <span className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--accent-50)', color: 'var(--accent-700)' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--accent-500)' }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--accent-600)' }} />
            </span>
            Marcos Music Agenda  Escola de Musica
          </span>
        </motion.div>

        <motion.h1 {...fadeUp(0.07)}
          className="mx-auto mt-5 max-w-4xl text-5xl font-black leading-tight tracking-tight sm:text-7xl"
          style={{ color: 'var(--heading)' }}
        >
          Sua musica{' '}
          <span style={{
            backgroundImage: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            comeca aqui.
          </span>
        </motion.h1>

        <motion.p {...fadeUp(0.12)}
          className="mx-auto mt-6 max-w-lg text-lg leading-relaxed"
          style={{ color: 'var(--muted)' }}
        >
          Metodologia estruturada, agenda online e acompanhamento real.
          Do iniciante ao avancado  presencial ou online.
        </motion.p>

        <motion.div {...fadeUp(0.16)} className="mt-7 flex justify-center">
          <WaveformBars />
        </motion.div>

        <motion.div {...fadeUp(0.20)} className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <motion.button onClick={handleContact}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-2xl border px-7 py-3.5 text-sm font-bold"
            style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--surface)' }}
          >
            <Mail size={15} /> Entrar em Contato
          </motion.button>
          <motion.button
            onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-bold text-white shadow-2xl"
            style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
          >
            Ver Planos <ArrowRight size={15} />
          </motion.button>
        </motion.div>
      </section>

      <Marquee />

      {/* ══════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-3 gap-5">
          {TEACHER_STATS.map((stat, i) => (
            <motion.div key={stat.label} {...fadeUp(i * 0.08)} whileHover={{ y: -5 }}
              className="app-surface relative overflow-hidden rounded-3xl border p-7 text-center cursor-default"
              style={{ borderColor: 'var(--border)' }}
            >
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-3xl opacity-0"
                whileHover={{ opacity: 1 }}
                style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-gradient-from) 8%, transparent), transparent)' }}
              />
              <div className="mb-3 inline-flex items-center justify-center rounded-2xl p-3"
                style={{ backgroundColor: 'var(--accent-icon-bg)', color: 'var(--accent-icon-fg)' }}>
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
      <section id="escola" className="border-y py-16"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-soft)' }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...fadeUp(0)} className="mb-10 text-center">
            <SectionLabel>A Escola</SectionLabel>
            <h2 className="mt-3 text-4xl font-black" style={{ color: 'var(--heading)' }}>O que e a Marcos Music?</h2>
          </motion.div>
          <div className="grid gap-5 sm:grid-cols-3">
            {SCHOOL_PILLARS.map((card, i) => (
              <motion.div key={card.title} {...fadeUp(i * 0.07)} whileHover={{ y: -4, scale: 1.01 }}
                className="app-surface rounded-3xl border p-7 cursor-default"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="mb-4 h-1.5 w-12 rounded-full"
                  style={{ background: 'linear-gradient(90deg, var(--accent-gradient-from), var(--accent-gradient-to))' }} />
                <div className="mb-4 inline-flex items-center justify-center rounded-2xl p-3"
                  style={{ backgroundColor: 'var(--accent-icon-bg)', color: 'var(--accent-icon-fg)' }}>
                  {card.icon}
                </div>
                <h3 className="text-base font-black" style={{ color: 'var(--text)' }}>{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          O PROFESSOR
      ══════════════════════════════════════════════ */}
      <section id="professor" className="mx-auto max-w-6xl px-6 py-16">
        <motion.div {...fadeUp(0)} className="mb-10 text-center">
          <SectionLabel>O Professor</SectionLabel>
          <h2 className="mt-3 text-4xl font-black" style={{ color: 'var(--heading)' }}>Marcos Mello</h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            Doutor em Musica pela UFMG  15 anos de experiencia em ensino e composicao
          </p>
        </motion.div>

        <motion.div {...fadeUp(0.05)} className="relative overflow-hidden rounded-3xl border shadow-2xl"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-gradient-from) 10%, transparent) 0%, transparent 55%)' }} />
          <div className="grid lg:grid-cols-[290px_1fr]">
            <div className="relative hidden lg:flex flex-col items-center justify-center gap-5 p-10"
              style={{ background: 'linear-gradient(160deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
            >
              <motion.div whileHover={{ scale: 1.04 }}
                className="h-36 w-36 overflow-hidden rounded-3xl border-4 border-white/30 shadow-2xl">
                <img src={marcosPhoto} alt="Marcos Mello" className="h-full w-full object-cover" />
              </motion.div>
              <div className="text-center">
                <p className="text-xl font-black text-white">Marcos Mello</p>
                <p className="mt-1 text-sm text-white/70">Piano · Violao · Composicao</p>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full border-4 border-white/10 opacity-15"
                style={{ background: 'conic-gradient(from 0deg, #000 0deg 30deg, transparent 30deg 60deg, #000 60deg 90deg, transparent 90deg 360deg)' }}
              />
            </div>
            <div className="p-8 app-surface">
              <div className="mb-6 flex items-center gap-4 lg:hidden">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2" style={{ borderColor: 'var(--border)' }}>
                  <img src={marcosPhoto} alt="Marcos Mello" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="font-black" style={{ color: 'var(--text)' }}>Marcos Mello</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Mentor Musical</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-widest"
                style={{ backgroundColor: 'var(--accent-50)', color: 'var(--accent-700)' }}>
                Piano · Violao · Composicao · Producao
              </div>
              <p className="mt-5 max-w-xl text-base leading-relaxed" style={{ color: 'var(--text)' }}>
                Doutor em Processos Analiticos e Criativos pela <strong>UFMG</strong> com enfase em trilha sonora para jogos
                digitais. Bacharel em Composicao, com formacao tecnica em violao classico e piano pelo Conservatorio EMMEL.
                Compositor da orquestra <strong>Multiplayer</strong>, com 2 discos lancados para orquestra, coro lirico e banda.
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                Com mais de <strong>15 anos de experiencia</strong>, Marcos combina tecnica rigorosa com uma metodologia
                estruturada por fases: cada aluno evolui com metas claras e acompanhamento proximo.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Piano', 'Violao', 'Guitarra', 'Composicao', 'Producao', 'Teoria Musical', 'Partitura', 'Trilha Sonora'].map(tag => (
                  <span key={tag} className="rounded-full border px-3 py-1 text-xs font-semibold"
                    style={{ borderColor: 'var(--border)', color: 'var(--accent-700)', backgroundColor: 'var(--accent-50)' }}>
                    {tag}
                  </span>
                ))}
              </div>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={handleContact}
                className="mt-7 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}>
                <Phone size={14} /> Falar com o Marcos
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          MODALIDADES
      ══════════════════════════════════════════════ */}
      <section className="border-y py-16"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-soft)' }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...fadeUp(0)} className="mb-10 text-center">
            <SectionLabel>Modalidades</SectionLabel>
            <h2 className="mt-3 text-4xl font-black" style={{ color: 'var(--heading)' }}>O que a escola oferece</h2>
          </motion.div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SCHOOL_OFFERINGS.map((item, i) => (
              <motion.div key={item.title} {...fadeUp(i * 0.07)} whileHover={{ y: -6, scale: 1.02 }}
                className="app-surface group relative overflow-hidden rounded-3xl border p-6 cursor-default"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
                  style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-gradient-from) 10%, transparent), transparent)' }} />
                <div className="mb-4 h-1.5 w-10 rounded-full"
                  style={{ background: 'linear-gradient(90deg, var(--accent-gradient-from), var(--accent-gradient-to))' }} />
                <div className="mb-4 inline-flex items-center justify-center rounded-2xl p-3"
                  style={{ backgroundColor: 'var(--accent-icon-bg)', color: 'var(--accent-icon-fg)' }}>
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
          VIDEOS
      ══════════════════════════════════════════════ */}
      <section id="videos" className="mx-auto max-w-6xl px-6 py-16">
        <motion.div {...fadeUp(0)} className="mb-10 text-center">
          <SectionLabel>Videos</SectionLabel>
          <h2 className="mt-3 text-4xl font-black" style={{ color: 'var(--heading)' }}>Marcos em performance</h2>
          <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: 'var(--muted)' }}>
            Performances e composicoes originais diretamente do canal oficial no YouTube.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          <YoutubeEmbed
            videoId="GCuXrIWRw6s"
            title="Apresentacao ao Vivo"
            subtitle="Performance original  assista na integra."
          />
          <YoutubeEmbed
            videoId="GCuXrIWRw6s"
            title="Canal Marcos Composer"
            subtitle="Composicoes, trilhas sonoras e bastidores do processo criativo."
          />
        </div>

        <motion.div {...fadeUp(0.1)} className="mt-6 text-center">
          <a
            href="https://www.youtube.com/@marcoscomposer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border px-6 py-3 text-sm font-bold transition hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--surface)' }}
          >
            <Play size={14} style={{ color: 'var(--accent-500)' }} />
            Ver todos os videos no canal
          </a>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          PLATAFORMA
      ══════════════════════════════════════════════ */}
      <section className="border-y py-16"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-soft)' }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...fadeUp(0)} className="mb-10 text-center">
            <SectionLabel>Plataforma</SectionLabel>
            <h2 className="mt-3 text-4xl font-black" style={{ color: 'var(--heading)' }}>Tudo que voce precisa, num so lugar</h2>
            <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: 'var(--muted)' }}>
              A Marcos Music Agenda foi construida para tornar a gestao das aulas simples e transparente para professor e alunos.
            </p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SOFTWARE_FEATURES.map((feat, i) => (
              <motion.div key={feat.title} {...fadeUp(i * 0.06)} whileHover={{ scale: 1.02, y: -2 }}
                className="app-surface flex gap-4 rounded-2xl border p-5"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm"
                  style={{ backgroundColor: 'var(--accent-icon-bg)', color: 'var(--accent-icon-fg)' }}>
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
          PLANOS
      ══════════════════════════════════════════════ */}
      <section id="planos" className="mx-auto max-w-6xl px-6 py-16">
        <motion.div {...fadeUp(0)} className="mb-12 text-center">
          <SectionLabel>Planos</SectionLabel>
          <h2 className="mt-3 text-4xl font-black" style={{ color: 'var(--heading)' }}>Escolha o seu ritmo</h2>
          <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: 'var(--muted)' }}>
            Cada plano inclui acesso completo a plataforma. Escolha a frequencia que cabe na sua rotina.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div key={plan.id} {...fadeUp(i * 0.1)} whileHover={{ y: -8, scale: 1.01 }}
              className={`relative overflow-hidden rounded-3xl border flex flex-col ${plan.highlight ? 'shadow-2xl' : 'shadow-md'}`}
              style={{
                borderColor: plan.highlight ? 'var(--accent-500)' : 'var(--border)',
                backgroundColor: plan.highlight ? 'color-mix(in srgb, var(--accent-50) 60%, var(--surface))' : 'var(--surface)',
              }}
            >
              {plan.highlight && (
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-3xl"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  style={{ boxShadow: '0 0 40px color-mix(in srgb, var(--accent-400) 25%, transparent)' }}
                />
              )}
              {plan.badge && (
                <div className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-black text-white shadow-lg"
                  style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}>
                  {plan.badge}
                </div>
              )}
              <div className="p-8 flex-1">
                <div className="mb-4 inline-flex items-center justify-center rounded-2xl p-3"
                  style={{ backgroundColor: 'var(--accent-icon-bg)', color: 'var(--accent-icon-fg)' }}>
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-black" style={{ color: 'var(--heading)' }}>{plan.name}</h3>
                <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--accent-600)' }}>{plan.freq}</p>
                <div className="my-6 h-px" style={{ backgroundColor: 'var(--border)' }} />
                <ul className="space-y-3">
                  {plan.perks.map(perk => (
                    <li key={perk} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text)' }}>
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--accent-500)' }} />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 pt-0">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={handleWhatsApp}
                  className="w-full rounded-2xl py-3.5 text-sm font-bold shadow-lg"
                  style={{
                    background: plan.highlight ? 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' : 'var(--surface-soft)',
                    color: plan.highlight ? 'white' : 'var(--accent-700)',
                    border: plan.highlight ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {plan.cta}
                </motion.button>
                <p className="mt-2.5 text-center text-xs" style={{ color: 'var(--muted)' }}>
                  Consulte disponibilidade e valores pelo WhatsApp
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeUp(0.15)} className="mt-12 flex flex-wrap items-center justify-center gap-6">
          {[
            { icon: <Shield size={15} />,      text: 'Sem fidelidade' },
            { icon: <CheckCircle2 size={15} />, text: 'Aula experimental gratis' },
            { icon: <RefreshCw size={15} />,   text: 'Reagendamento flexivel' },
          ].map(badge => (
            <div key={badge.text} className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--muted)' }}>
              <span style={{ color: 'var(--accent-500)' }}>{badge.icon}</span>
              {badge.text}
            </div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════ */}
      <section className="border-t py-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-soft)' }}>
        <div className="mx-auto max-w-6xl px-6 py-14">
          <motion.div {...fadeUp(0)} className="relative overflow-hidden rounded-3xl border p-12 text-center shadow-2xl"
            style={{
              borderColor: 'var(--border)',
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-gradient-from) 14%, var(--surface)), color-mix(in srgb, var(--accent-gradient-to) 9%, var(--surface)))',
            }}
          >
            <motion.div className="mb-5 inline-flex items-center justify-center rounded-2xl p-4"
              style={{ backgroundColor: 'var(--accent-icon-bg)', color: 'var(--accent-icon-fg)' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Disc3 size={28} />
            </motion.div>

            <h2 className="text-4xl font-black sm:text-5xl" style={{ color: 'var(--heading)' }}>Pronto para comecar?</h2>
            <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: 'var(--muted)' }}>
              Agende uma aula experimental gratuita ou acesse a plataforma se ja for aluno.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <motion.button onClick={handleContact}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-2xl border px-7 py-3.5 text-sm font-bold"
                style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--surface)' }}>
                <Mail size={15} /> Entrar em Contato
              </motion.button>
              <motion.button onClick={onEnterLogin}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-bold text-white shadow-2xl"
                style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}>
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
            <MarcosLogoMark size={28} />
            <div className="leading-none">
              <span className="text-xs font-black block" style={{ color: 'var(--text)' }}>Marcos Music</span>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent-600)' }}>Agenda</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--muted)' }}>
            <a href="mailto:marcoslima91@hotmail.com" className="flex items-center gap-1 hover:opacity-70 transition">
              <Mail size={12} /> marcoslima91@hotmail.com
            </a>
            <a href="https://www.youtube.com/@marcoscomposer" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 hover:opacity-70 transition">
              <Play size={12} /> YouTube
            </a>
            <a
              href="https://wa.me/5531999999999?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20as%20aulas%20de%20m%C3%BAsica!"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all hover:scale-105 hover:opacity-90"
              style={{ backgroundColor: '#25D366', color: '#fff' }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>
          </div>
          <p className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted)' }}>
            <span className="text-sm" aria-hidden="true">©</span>
            <span>{new Date().getFullYear()} Marcos Music Agenda.</span>
            <span className="hidden sm:inline">Todos os direitos reservados.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
