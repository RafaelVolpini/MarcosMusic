import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, CheckCircle2, Music2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import type { AuthUser } from '../../lib/auth';
import { useLanguage } from '../../context/LanguageContext';

const SESSION_KEY = 'marcos-music:auth:session';

// ─── Validação e máscara de telefone ──────────────────────────────────────────



function isPhoneValid(phone: string): boolean {
  const d = phone.replace(/\D/g, '');
  return d.length >= 10 && d.length <= 11;
}

interface ProfileSetupPageProps {
  user: AuthUser;
  onComplete: (updatedUser: AuthUser) => void;
  /** Quando true, renderiza como página interna (sem tela cheia). */
  inApp?: boolean;
}

export function ProfileSetupPage({ user, onComplete, inApp = false }: ProfileSetupPageProps) {
  const [nome, setNome] = useState(user.name ?? '');
  const [telefone, setTelefone] = useState(user.phone ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const { t } = useLanguage();

  const initials = nome.trim()
    ? nome.trim().split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  const filled = [nome.trim(), telefone.trim()].filter(Boolean).length;
  const total = 2;
  const pct = Math.round((filled / total) * 100);

  const inputCls =
    'w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-(--accent-300)';
  const inputStyle = { borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--input-bg, var(--surface))' };
  const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError(t('profileSetup.errName'));
      return;
    }
    if (telefone.trim() && !isPhoneValid(telefone)) {
      setError(t('profileSetup.errPhone'));
      return;
    }
    setLoading(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch('/aluno/salvar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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

      if (inApp) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        onComplete(updatedUser);
      } else {
        onComplete(updatedUser);
      }
    } catch {
      setError(t('profileSetup.errSave'));
    } finally {
      setLoading(false);
    }
  };

  const form = (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Avatar + completion */}
      <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'var(--surface-soft)', border: '1px solid var(--border)' }}>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0 shadow-lg select-none"
          style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: 'var(--heading)' }}>
            {nome.trim() || 'Seu nome'}
          </p>
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted)' }}>{user.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="text-[11px] font-semibold shrink-0" style={{ color: 'var(--accent-600)' }}>{pct}%</span>
          </div>
        </div>
      </div>

      {/* Email (read-only) */}
      <div>
        <label className={labelCls} style={{ color: 'var(--muted)' }}>{t('profileSetup.emailLabel')}</label>
        <div className="relative">
          <Mail size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
          <input
            className={`${inputCls} pl-9 opacity-60 cursor-not-allowed`}
            style={{ ...inputStyle, borderColor: 'var(--border)' }}
            value={user.email}
            readOnly
            tabIndex={-1}
          />
          <ShieldCheck size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--accent-500)' }} />
        </div>
        <p className="mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>{t('profileSetup.emailReadonly')}</p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{t('profileSetup.personal')}</span>
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
      </div>

      {/* Nome */}
      <div>
        <label className={labelCls} style={{ color: 'var(--muted)' }}>{t('profileSetup.nameLabel')}</label>
        <div className="relative">
          <User size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
          <input
            className={`${inputCls} pl-9`}
            style={inputStyle}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder={t('profileSetup.namePH')}
            autoFocus={!inApp}
          />
        </div>
      </div>

      {/* Telefone */}
      <div>
        <label className={labelCls} style={{ color: 'var(--muted)' }}>{t('profileSetup.phoneLabel')}</label>
        <div className="relative">
          <Phone size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: telefone && isPhoneValid(telefone) ? 'var(--accent-500)' : 'var(--muted)' }}
          />
          <input
            className={`${inputCls} pl-9 pr-9`}
            style={{
              ...inputStyle,
              borderColor: telefone && !isPhoneValid(telefone)
                ? '#f87171'
                : telefone && isPhoneValid(telefone)
                  ? '#34d399'
                  : 'var(--border)',
            }}
            value={telefone}
            onChange={(e) => { setTelefone(e.target.value); if (error) setError(''); }}
            placeholder={t('profileSetup.phonePH')}
            type="tel"
            inputMode="numeric"
          />
          <AnimatePresence>
            {telefone && isPhoneValid(telefone) && (
              <motion.span
                key="ok"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              >
                <CheckCircle2 size={14} className="text-emerald-500" />
              </motion.span>
            )}
            {telefone && !isPhoneValid(telefone) && (
              <motion.span
                key="err"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              >
                <AlertCircle size={14} className="text-rose-400" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {telefone && !isPhoneValid(telefone) && (
          <p className="mt-1 text-xs text-rose-500">{t('profileSetup.phoneHint')}</p>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Success */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 rounded-xl border px-3 py-2.5"
            style={{ backgroundColor: 'var(--accent-50)', borderColor: 'var(--accent-100)', color: 'var(--accent-700)' }}
          >
            <CheckCircle2 size={14} />
            <span className="text-xs font-semibold">{t('profileSetup.saved')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Button type="submit" className="w-full justify-center" disabled={loading}>
      {loading ? t('profileSetup.saving') : (inApp ? t('profileSetup.save') : t('profileSetup.continue'))}
      </Button>
    </form>
  );

  if (inApp) {
    return (
      <div className="page-padding">
        <div className="max-w-lg">
          <div className="mb-6">
            <h1 className="text-2xl font-black" style={{ color: 'var(--heading)' }}>{t('profileSetup.title')}</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{t('profileSetup.info')}</p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="app-surface rounded-3xl border p-8 shadow-sm"
            style={{ borderColor: 'var(--border)' }}
          >
            {form}
          </motion.div>
        </div>
      </div>
    );
  }

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
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>marcos-music</span>
          </div>
          <h2 className="text-2xl font-black mb-6" style={{ color: 'var(--text)' }}>{t('profileSetup.title')}</h2>
          {form}
        </motion.div>
      </div>
    </div>
  );
}
