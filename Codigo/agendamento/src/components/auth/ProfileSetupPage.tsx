import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music2, User, Phone } from 'lucide-react';
import { Button } from '../ui/Button';
import type { AuthUser } from '../../lib/auth';
import { getToken } from '../../lib/auth';

const SESSION_KEY = 'musga:auth:session';

interface ProfileSetupPageProps {
  user: AuthUser;
  onComplete: (updatedUser: AuthUser) => void;
}

export function ProfileSetupPage({ user, onComplete }: ProfileSetupPageProps) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputCls =
    'w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-(--accent-100)';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError('Nome é obrigatório.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const token = getToken();
      const res = await fetch('/aluno/salvar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id: user.id ?? null,
          email: user.email,
          nome: nome.trim(),
          telefone: telefone.trim(),
          status: true,
          termos: user.termos ?? false,
        }),
      });

      if (!res.ok) throw new Error('Erro ao salvar perfil');

      // Update session with new name/phone
      const parts = nome.trim().split(' ');
      const firstName = parts[0] ?? '';
      const lastName = parts.slice(1).join(' ');
      const updatedUser: AuthUser = {
        ...user,
        firstName,
        lastName,
        name: nome.trim(),
        phone: telefone.trim(),
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
      onComplete(updatedUser);
    } catch {
      setError('Não foi possível salvar o perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell relative min-h-screen w-full overflow-y-auto p-4 sm:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-md items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="app-surface w-full rounded-3xl border shadow-2xl p-8"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="mb-6 flex items-center gap-2">
            <div className="rounded-xl p-2" style={{ backgroundColor: 'var(--accent-100)', color: 'var(--accent-600)' }}>
              <Music2 size={16} />
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Musga Agenda</span>
          </div>

          <h2 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Complete seu perfil</h2>
          <p className="mt-1 text-sm mb-6" style={{ color: 'var(--muted)' }}>
            Informe seu nome e telefone para continuar.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                Nome completo *
              </label>
              <div className="relative">
                <User size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  className={`${inputCls} pl-9`}
                  style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--surface)' }}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                Telefone
              </label>
              <div className="relative">
                <Phone size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  className={`${inputCls} pl-9`}
                  style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--surface)' }}
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
            )}

            <Button type="submit" className="mt-2 w-full justify-center" disabled={loading}>
              {loading ? 'Salvando...' : 'Continuar'}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
