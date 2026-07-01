import { motion } from 'framer-motion';
import { ArrowRight, Calendar, MonitorSmartphone, Play, Users } from 'lucide-react';
import marcosPhoto from '../../assets/image.png';
import { MarcosLogoMark } from '../ui/MarcosLogo';

interface LandingPageProps {
  onEnterLogin: () => void;
}

const features = [
  {
    title: 'Gestão Inteligente',
    description: 'Agendamentos, reagendamentos e reposições automatizadas. Sua agenda sempre sincronizada e sem conflitos de horários.',
    icon: Calendar,
  },
  {
    title: 'Foco no Aluno',
    description: 'Perfis detalhados dos alunos, acompanhamento de progresso, envio de materiais e links para aulas online integrados.',
    icon: Users,
  },
  {
    title: 'Organização Total',
    description: 'Calendário visual intuitivo com disponibilidade flexível e notificações automáticas para professor e aluno.',
    icon: MonitorSmartphone,
  },
];

const testimonials = [
  {
    name: 'Juliana Silva',
    role: 'Professora de Piano',
    quote: 'A gestão de reposições era um pesadelo antes do Marcos Music Agenda. Agora os próprios alunos solicitam e o sistema organiza. Ganhei horas na minha semana.',
  },
  {
    name: 'Carlos Eduardo',
    role: 'Professor de Violão',
    quote: 'O calendário visual é perfeito. Consigo ver minha disponibilidade, aulas online e presenciais em uma única tela limpa e elegante.',
  },
  {
    name: 'Roberto Mendes',
    role: 'Diretor, Escola Sonora',
    quote: 'A funcionalidade de links para aulas online salvou nossa escola durante a transição para o modelo híbrido. Os alunos não se perdem mais.',
  },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const themeStyles = {
  page: { backgroundColor: 'var(--bg)', color: 'var(--text)' },
  surface: { backgroundColor: 'var(--surface)' },
  surfaceSoft: { backgroundColor: 'var(--surface-soft)' },
  surfaceContainerLow: { backgroundColor: 'var(--surface-soft)' },
  text: { color: 'var(--text)' },
  muted: { color: 'var(--muted)' },
  accent50: { backgroundColor: 'var(--accent-50)' },
  accent700: { color: 'var(--accent-700)' },
  accent700Bg: { backgroundColor: 'var(--accent-700)' },
  accentGradient: { background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' },
  accentGradientSoft: { background: 'linear-gradient(135deg, rgba(99,102,241,0.10), rgba(147,51,234,0.10))' },
  border: { borderColor: 'var(--border)' },
};

export function LandingPage({ onEnterLogin }: LandingPageProps) {
  const handleContact = () => window.open('mailto:marcoslima91@hotmail.com', '_blank');
  const handleWhatsApp = () => window.open('https://wa.me/5531999999999?text=Ol%C3%A1!%20Quero%20saber%20mais%20sobre%20o%20Marcos%20Music%20Agenda.', '_blank');

  return (
    <div className="app-shell min-h-screen w-full overflow-hidden" style={themeStyles.page}>
      <header className="sticky top-0 z-50 border-b backdrop-blur-md" style={{ ...themeStyles.surface, ...themeStyles.border }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <MarcosLogoMark size={32} />
            <div className="text-sm font-bold tracking-tight" style={themeStyles.text}>Marcos Music</div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm" style={themeStyles.muted}>
            <a href="#features" className="transition hover:text-accent">Features</a>
            <a href="#testimonials" className="transition hover:text-accent">Depoimentos</a>
            <a href="#contact" className="transition hover:text-accent">Contato</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={onEnterLogin} className="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:opacity-80" style={{ ...themeStyles.text, ...themeStyles.border }}>
              Login
            </button>
            <button onClick={handleContact} className="rounded-2xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-95" style={themeStyles.accentGradient}>
              Entre em contato
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-6 py-16 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <motion.div {...fadeUp(0)} className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ ...themeStyles.border, ...themeStyles.accent50, ...themeStyles.accent700 }}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--accent-500)' }} />
                A ferramenta nº 1 para professores de música
              </span>
              <div className="max-w-2xl space-y-6">
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl" style={themeStyles.text}>
                  Sua agenda musical em <span className="text-cyan-400">harmonia</span>
                </h1>
                <p className="max-w-xl text-lg leading-8" style={themeStyles.muted}>
                  A ferramenta completa para professores e escolas de música gerenciarem alunos, aulas e pagamentos. Diga adeus às planilhas confusas e olá para mais tempo ensinando.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <motion.button onClick={handleContact} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center justify-center rounded-2xl px-7 py-3.5 text-sm font-bold text-white shadow-lg transition" style={themeStyles.accentGradient}>
                  Entre em contato <ArrowRight size={16} className="ml-2" />
                </motion.button>
                <a href="#features" className="inline-flex items-center justify-center rounded-2xl border px-7 py-3.5 text-sm font-semibold transition hover:bg-surface-soft" style={{ ...themeStyles.text, ...themeStyles.border }}>
                  Ver demonstração
                </a>
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="relative overflow-hidden rounded-[32px] border p-4 shadow-xl" style={{ ...themeStyles.surface, ...themeStyles.border }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, rgba(145,77,0,0.16), transparent 35%)' }} />
              <img src={marcosPhoto} alt="Interface Marcos Music Agenda" className="h-full w-full rounded-[28px] object-cover" />
            </motion.div>
          </div>
        </section>

        <section id="features" className="border-t py-20 px-6" style={{ ...themeStyles.surfaceSoft, ...themeStyles.border }}>
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.24em]" style={themeStyles.accent700}>Tudo que você precisa em um só lugar</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl" style={themeStyles.text}>Componha sua rotina com ferramentas projetadas especificamente para a educação musical.</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div {...fadeUp(0.05)} whileHover={{ y: -4 }} key={feature.title} className="group overflow-hidden rounded-3xl border p-8 shadow-sm transition-shadow hover:shadow-md" style={{ ...themeStyles.surface, ...themeStyles.border }}>
                    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm" style={{ ...themeStyles.accent50, ...themeStyles.accent700 }}>
                      <Icon size={20} />
                    </div>
                    <h3 className="text-xl font-black" style={themeStyles.text}>{feature.title}</h3>
                    <p className="mt-3 text-sm leading-7" style={themeStyles.muted}>{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20 px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl" style={themeStyles.text}>O que dizem os maestros do ensino</h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <motion.div {...fadeUp(0.08)} whileHover={{ y: -4 }} key={testimonial.name} className="rounded-3xl border p-8 shadow-sm" style={{ ...themeStyles.surfaceContainerLow, ...themeStyles.border }}>
                  <div className="mb-4 flex items-center gap-1" style={themeStyles.accent700}>
                    <Play size={16} className="rotate-180" />
                    <Play size={16} className="rotate-180" />
                    <Play size={16} className="rotate-180" />
                    <Play size={16} className="rotate-180" />
                    <Play size={16} className="rotate-180" />
                  </div>
                  <p className="mb-6" style={themeStyles.muted}>“{testimonial.quote}”</p>
                  <div>
                    <p className="font-bold" style={themeStyles.text}>{testimonial.name}</p>
                    <p className="text-sm" style={themeStyles.muted}>{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="relative overflow-hidden rounded-[32px] border px-6 py-16" style={{ ...themeStyles.border, ...themeStyles.accentGradientSoft }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at top left, rgba(145,77,0,0.12), transparent 30%)' }} />
          <div className="mx-auto relative z-10 flex max-w-6xl flex-col items-center gap-6 text-center">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em]" style={themeStyles.accent700}>Pronto para orquestrar suas aulas?</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl" style={themeStyles.text}>Junte-se a professores que já otimizaram sua rotina com o Marcos Music Agenda.</h2>
              <p className="mt-4 text-base leading-7" style={themeStyles.muted}>Entre em contato para agendar uma demonstração e conhecer o sistema que já ajuda escolas e professores a organizar alunos, aulas e pagamentos.</p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <motion.button onClick={handleContact} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center justify-center rounded-2xl px-8 py-3.5 text-sm font-bold text-white shadow-lg transition" style={themeStyles.accentGradient}>
                Entre em contato
              </motion.button>
              <motion.button onClick={handleWhatsApp} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center justify-center rounded-2xl border px-8 py-3.5 text-sm font-semibold transition" style={{ ...themeStyles.surface, ...themeStyles.text, ...themeStyles.border }}>
                Contato via WhatsApp
              </motion.button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8" style={{ ...themeStyles.surface, ...themeStyles.border }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <MarcosLogoMark size={28} />
            <div>
              <p className="font-bold" style={themeStyles.text}>Marcos Music</p>
              <p className="text-sm" style={themeStyles.muted}>Agenda</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm" style={themeStyles.muted}>
            <a href="mailto:marcoslima91@hotmail.com" className="transition hover:text-accent">marcoslima91@hotmail.com</a>
            <a href="https://wa.me/5531999999999?text=Ol%C3%A1!%20Gostaria%20de%20mais%20informações" target="_blank" rel="noopener noreferrer" className="transition hover:text-accent">WhatsApp</a>
            <a href="https://www.youtube.com/@marcoscomposer" target="_blank" rel="noopener noreferrer" className="transition hover:text-accent">YouTube</a>
          </div>
          <p className="text-sm" style={themeStyles.muted}>© {new Date().getFullYear()} Marcos Music Agenda. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
