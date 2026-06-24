import { motion } from 'framer-motion';
import { Gamepad2, Trophy, Headphones, Swords, Star, Music2 } from 'lucide-react';
import marcosPhoto from '../../assets/image.png';

const SKILLS = [
  { label: 'Didatica', level: 95, color: '#22d3ee' },
  { label: 'Improvisacao', level: 88, color: '#a78bfa' },
  { label: 'Teoria Musical', level: 92, color: '#34d399' },
  { label: 'Mentoria', level: 90, color: '#f472b6' },
];

const GAME_LOADOUT = [
  'Ritmo de treino diario estilo speedrun',
  'Feedback por fase: fundamentos, tecnica e performance',
  'Aulas com missoes semanais e checkpoints',
  'Preparacao para palco como modo campanha',
];

export function AboutMePage() {
  return (
    <div className="page-padding">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="app-surface relative overflow-hidden rounded-3xl border p-6 shadow-xl"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
          style={{ backgroundColor: 'color-mix(in srgb, var(--accent-100) 80%, transparent)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-8 h-52 w-52 rounded-full blur-3xl"
          style={{ backgroundColor: 'color-mix(in srgb, var(--accent-50) 75%, transparent)' }}
        />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: 'var(--accent-50)', color: 'var(--accent-700)' }}>
              <Gamepad2 size={14} />
              Modo Sobre Mim
            </div>
            <h2 className="mt-4 text-3xl font-black" style={{ color: 'var(--text)' }}>
              Marcos Mello
            </h2>
            <p className="mt-1 text-sm font-medium" style={{ color: 'var(--muted)' }}>
              Professor de musica, gamer de estrategia e fan de progresso por fases.
            </p>

            <p className="mt-5 text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
              Minha metodologia combina foco tecnico com energia de gameplay: cada aluno evolui por niveis,
              desbloqueia objetivos e celebra conquistas reais na musica.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <StatBadge icon={<Trophy size={14} />} label="15+ anos" subLabel="de ensino" />
              <StatBadge icon={<Music2 size={14} />} label="1200+" subLabel="aulas no ano" />
              <StatBadge icon={<Star size={14} />} label="4.9" subLabel="avaliacao media" />
            </div>
          </div>

          <div className="app-soft rounded-2xl border p-4" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-2xl border-2" style={{ borderColor: 'var(--accent-100)' }}>
                <img src={marcosPhoto} alt="Marcos Mello" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Player Card</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Classe: Mentor Musical</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Especialidade: Piano, Violao, Producao</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {SKILLS.map((skill) => (
                <div key={skill.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--text)' }}>{skill.label}</span>
                    <span style={{ color: 'var(--muted)' }}>{skill.level}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--surface-soft)]">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${skill.level}%`, background: `linear-gradient(90deg, ${skill.color}, var(--accent-600))` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="mt-6 grid gap-4 md:grid-cols-2"
      >
        <div className="app-surface rounded-2xl border p-5" style={{ borderColor: 'var(--border)' }}>
          <div className="mb-3 flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--text)' }}>
            <Swords size={16} className="text-(--accent-600)" />
            Missao do Professor
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
            Tornar o estudo musical divertido, consistente e com resultado real, sem perder personalidade e criatividade.
          </p>
        </div>

        <div className="app-surface rounded-2xl border p-5" style={{ borderColor: 'var(--border)' }}>
          <div className="mb-3 flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--text)' }}>
            <Headphones size={16} className="text-(--accent-600)" />
            Loadout de Aula
          </div>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--muted)' }}>
            {GAME_LOADOUT.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-(--accent-600)" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.section>
    </div>
  );
}

function StatBadge({ icon, label, subLabel }: { icon: React.ReactNode; label: string; subLabel: string }) {
  return (
    <div className="rounded-xl border px-3 py-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-soft)' }}>
      <div className="mb-1 inline-flex items-center gap-1 text-(--accent-600)">{icon}</div>
      <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{label}</p>
      <p className="text-xs" style={{ color: 'var(--muted)' }}>{subLabel}</p>
    </div>
  );
}
