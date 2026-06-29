import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import type { AuthUser } from '../../lib/auth';
import { login } from '../../lib/auth';
import { MarcosLogoMark } from '../ui/MarcosLogo';
import { useLanguage } from '../../context/LanguageContext';

// ─── Regex ───────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ─── Estilos compartilhados ───────────────────────────────────────────────────

const inputStyle = {
  borderColor: 'var(--border)',
  color: 'var(--text)',
  backgroundColor: 'var(--surface)',
};

function inputCls(hasError: boolean, hasSuccess: boolean) {
  const base = 'w-full rounded-xl border px-3 py-2.5 pl-9 pr-9 text-sm outline-none transition';
  if (hasError)   return `${base} border-rose-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/25`;
  if (hasSuccess) return `${base} border-emerald-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/25`;
  return `${base} focus:border-transparent focus:ring-2 focus:ring-(--accent-500)/20`;
}

// ─── Componente de campo com indicadores visuais ──────────────────────────────

function FieldInput({
  label,
  icon: Icon,
  error,
  valid,
  children,
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  valid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide"
        style={{ color: 'var(--muted)' }}
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
          style={{ color: valid ? 'var(--accent-500)' : error ? '#f87171' : 'var(--muted)' }}
        />
        {children}
        <AnimatePresence>
          {valid && !error && (
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
          {error && (
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
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 6 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-rose-500 overflow-hidden"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Página de login ──────────────────────────────────────────────────────────

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  onForgotPassword?: () => void;
}

export function LoginPage({ onLoginSuccess, onForgotPassword }: LoginPageProps) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched]   = useState({ email: false, password: false });
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const { t } = useLanguage();

  // Validação em tempo real
  const emailTrimmed  = email.trim().toLowerCase();
  const emailValid    = EMAIL_RE.test(emailTrimmed);
  const emailError    = touched.email && !emailTrimmed
    ? t('auth.errEmailRequired')
    : touched.email && emailTrimmed && !emailValid
      ? t('auth.errEmailInvalid')
      : '';
  const passwordError = touched.password && !password.trim() ? t('auth.errPasswordRequired') : '';

  function clearApiError() { if (apiError) setApiError(''); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setApiError('');
    if (!emailTrimmed || !password.trim() || !emailValid) return;

    setLoading(true);
    try {
      const user = await login(emailTrimmed, password.trim(), rememberMe);
      if (!user) throw new Error(t('auth.errInvalid'));
      onLoginSuccess(user);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setApiError(msg || t('auth.errInvalid'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell relative min-h-screen w-full overflow-y-auto p-4 sm:p-8">
      {/* Blobs decorativos */}
      <div
        className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: 'color-mix(in srgb, var(--accent-100) 80%, transparent)' }}
      />
      <div
        className="pointer-events-none absolute bottom-10 right-8 h-52 w-52 rounded-full blur-3xl"
        style={{ backgroundColor: 'color-mix(in srgb, var(--accent-50) 85%, transparent)' }}
      />

      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-5xl items-center justify-center">
        <div
          className="app-surface grid w-full overflow-hidden rounded-3xl border shadow-2xl lg:grid-cols-[1.1fr_1fr]"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* ── Painel Hero (desktop) ──────────────────────────────────── */}
          <section
            className="relative hidden overflow-hidden p-10 text-white lg:block"
            style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
          >
            <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-white/15 blur-xl" />
            <div className="absolute bottom-8 right-6 h-36 w-36 rounded-full bg-white/10 blur-xl" />
            {/* Orbital ring decoration */}
            <motion.div
              aria-hidden
              className="absolute rounded-full border border-white/10 pointer-events-none"
              style={{ width: 320, height: 320, bottom: -80, right: -80 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <MarcosLogoMark size={42} />
                <div className="leading-none">
                  <p className="text-base font-black">Marcos Music</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/70">Agenda</p>
                </div>
              </div>
              <h1 className="mt-8 max-w-sm text-4xl font-black leading-tight">
                {t('auth.subtitle')}
              </h1>
              <p className="mt-4 max-w-sm text-sm text-white/75">
                {t('auth.desc')}
              </p>
              <div className="mt-10 flex flex-col gap-3">
                {[t('auth.feat1'), t('auth.feat2'), t('auth.feat3')].map(txt => (
                  <div key={txt} className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle2 size={14} className="text-white/60 shrink-0" />
                    {txt}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Formulário de login ────────────────────────────────────── */}
          <section className="p-6 sm:p-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mx-auto w-full max-w-md"
            >
              {/* Logo mobile */}
              <div className="mb-6 flex items-center gap-2.5 lg:hidden">
                <MarcosLogoMark size={32} />
                <div className="leading-none">
                  <span className="text-xs font-black block" style={{ color: 'var(--text)' }}>Marcos Music</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent-600)' }}>Agenda</span>
                </div>
              </div>

              <h2 className="text-2xl font-black" style={{ color: 'var(--text)' }}>{t('auth.welcome')}</h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                {t('auth.accessHint')}
              </p>

              <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">

                {/* E-mail */}
                <FieldInput
                  label={t('auth.emailLabel')}
                  icon={Mail}
                  error={emailError}
                  valid={!!emailTrimmed && emailValid && touched.email}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); clearApiError(); }}
                    onBlur={() => setTouched(p => ({ ...p, email: true }))}
                    placeholder={t('auth.emailPH')}
                    className={inputCls(!!emailError, !!emailTrimmed && emailValid && touched.email)}
                    style={inputStyle}
                    autoComplete="email"
                    autoFocus
                  />
                </FieldInput>

                {/* Senha */}
                <FieldInput
                  label={t('auth.passwordLabel')}
                  icon={Lock}
                  error={passwordError}
                >
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearApiError(); }}
                    onBlur={() => setTouched(p => ({ ...p, password: true }))}
                    placeholder="••••••••"
                    className={inputCls(!!passwordError, false)}
                    style={inputStyle}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--muted)' }}
                    aria-label={showPass ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </FieldInput>

                {/* Lembrar sessão + Esqueci senha */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="sr-only"
                      id="remember-me"
                    />
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                        rememberMe
                          ? 'border-(--accent-500) bg-(--accent-500)'
                          : 'border-(--border) bg-(--surface)'
                      }`}
                    >
                      {rememberMe && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{t('auth.remember')}</span>
                  </label>
                  {onForgotPassword && (
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      className="text-xs transition-colors hover:underline"
                      style={{ color: 'var(--accent-500)' }}
                    >
                      {t('auth.forgotPassword')}
                    </button>
                  )}
                </div>

                {/* Erro da API */}
                <AnimatePresence>
                  {apiError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-900/40 px-3 py-2.5">
                        <AlertCircle size={14} className="text-rose-500 shrink-0" />
                        <span className="text-xs text-rose-600 dark:text-rose-400">{apiError}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button type="submit" className="mt-2 w-full justify-center" disabled={loading}>
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> {t('auth.logging')}</>
                    : t('auth.login')
                  }
                </Button>
              </form>
            </motion.div>
          </section>
        </div>
      </div>
    </div>
  );
}
