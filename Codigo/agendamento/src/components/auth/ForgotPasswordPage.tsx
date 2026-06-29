import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { forgotPassword, resetPassword } from '../../lib/auth';
import { MarcosLogoMark } from '../ui/MarcosLogo';
import { useLanguage } from '../../context/LanguageContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

type Step = 'email' | 'code' | 'newPassword' | 'success';

interface Props {
  onBack: () => void;
}

export function ForgotPasswordPage({ onBack }: Props) {
  const { t } = useLanguage();

  const [step, setStep]           = useState<Step>('email');
  const [email, setEmail]         = useState('');
  const [code, setCode]           = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [touched, setTouched]     = useState({ email: false, code: false, password: false, confirm: false });

  const emailTrimmed = email.trim().toLowerCase();
  const emailValid   = EMAIL_RE.test(emailTrimmed);
  const emailError   = touched.email && !emailTrimmed
    ? t('auth.errEmailRequired')
    : touched.email && emailTrimmed && !emailValid
      ? t('auth.errEmailInvalid')
      : '';

  const codeError    = touched.code && !code.trim() ? t('auth.errCodeRequired') : '';
  const passwordError = touched.password && newPassword.length < 8 ? t('auth.errPasswordMin') : '';
  const confirmError  = touched.confirm && newPassword !== confirmPassword ? t('auth.errPasswordMatch') : '';

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setTouched(p => ({ ...p, email: true }));
    setError('');
    if (!emailValid) return;
    setLoading(true);
    try {
      await forgotPassword(emailTrimmed);
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar código');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setTouched(p => ({ ...p, code: true }));
    setError('');
    if (!code.trim()) return;
    setStep('newPassword');
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setTouched(p => ({ ...p, password: true, confirm: true }));
    setError('');
    if (newPassword.length < 8 || newPassword !== confirmPassword) return;
    setLoading(true);
    try {
      await resetPassword(emailTrimmed, code.trim(), newPassword);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.errCodeInvalid'));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setLoading(true);
    try {
      await forgotPassword(emailTrimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reenviar código');
    } finally {
      setLoading(false);
    }
  }

  const stepContent = () => {
    if (step === 'success') {
      return (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-center"
        >
          <div className="mb-4 flex justify-center">
            <div className="rounded-full p-4" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-100) 60%, transparent)' }}>
              <CheckCircle2 size={36} style={{ color: 'var(--accent-500)' }} />
            </div>
          </div>
          <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text)' }}>
            Senha redefinida!
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
            {t('auth.resetSuccess')}
          </p>
          <Button type="button" className="w-full justify-center" onClick={onBack}>
            {t('auth.backToLogin')}
          </Button>
        </motion.div>
      );
    }

    if (step === 'email') {
      return (
        <motion.div key="email" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <h2 className="text-2xl font-black mb-1" style={{ color: 'var(--text)' }}>{t('auth.forgotTitle')}</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>{t('auth.forgotDesc')}</p>

          <form onSubmit={handleSendCode} noValidate className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                {t('auth.emailLabel')}
              </label>
              <div className="relative">
                <Mail size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: emailError ? '#f87171' : emailValid && touched.email ? 'var(--accent-500)' : 'var(--muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  onBlur={() => setTouched(p => ({ ...p, email: true }))}
                  placeholder={t('auth.emailPH')}
                  className={inputCls(!!emailError, emailValid && touched.email)}
                  style={inputStyle}
                  autoComplete="email"
                  autoFocus
                />
                <AnimatePresence>
                  {emailValid && touched.email && !emailError && (
                    <motion.span key="ok" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    </motion.span>
                  )}
                  {emailError && (
                    <motion.span key="err" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      <AlertCircle size={14} className="text-rose-400" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {emailError && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 6 }} exit={{ opacity: 0, height: 0 }} className="text-xs text-rose-500 overflow-hidden">
                    {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <ErrorBox error={error} />

            <Button type="submit" className="w-full justify-center" disabled={loading}>
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> {t('auth.forgotSending')}</>
                : t('auth.forgotSend')
              }
            </Button>
          </form>
        </motion.div>
      );
    }

    if (step === 'code') {
      return (
        <motion.div key="code" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <div className="mb-4 flex justify-center">
            <div className="rounded-full p-3" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-100) 60%, transparent)' }}>
              <KeyRound size={24} style={{ color: 'var(--accent-500)' }} />
            </div>
          </div>
          <h2 className="text-2xl font-black mb-1 text-center" style={{ color: 'var(--text)' }}>{t('auth.codeTitle')}</h2>
          <p className="text-sm mb-8 text-center" style={{ color: 'var(--muted)' }}>
            {t('auth.codeDesc').replace('{email}', emailTrimmed)}
          </p>

          <form onSubmit={handleVerifyCode} noValidate className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                {t('auth.codeLabel')}
              </label>
              <div className="relative">
                <KeyRound size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: codeError ? '#f87171' : 'var(--muted)' }} />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                  onBlur={() => setTouched(p => ({ ...p, code: true }))}
                  placeholder="000000"
                  className={`${inputCls(!!codeError, code.length === 6)} tracking-[0.4em] text-center font-mono text-lg`}
                  style={inputStyle}
                  autoFocus
                />
              </div>
              <AnimatePresence>
                {codeError && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 6 }} exit={{ opacity: 0, height: 0 }} className="text-xs text-rose-500 overflow-hidden">
                    {codeError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <ErrorBox error={error} />

            <Button type="submit" className="w-full justify-center" disabled={loading || code.length < 6}>
              {t('auth.codeVerify')}
            </Button>

            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="w-full text-center text-xs transition-colors disabled:opacity-50"
              style={{ color: 'var(--accent-500)' }}
            >
              {loading ? '...' : t('auth.codeResend')}
            </button>
          </form>
        </motion.div>
      );
    }

    // step === 'newPassword'
    return (
      <motion.div key="newPassword" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <h2 className="text-2xl font-black mb-1" style={{ color: 'var(--text)' }}>{t('auth.newPasswordTitle')}</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>{t('auth.newPasswordDesc')}</p>

        <form onSubmit={handleResetPassword} noValidate className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              {t('auth.newPasswordLabel')}
            </label>
            <div className="relative">
              <Lock size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: passwordError ? '#f87171' : 'var(--muted)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError(''); }}
                onBlur={() => setTouched(p => ({ ...p, password: true }))}
                placeholder="••••••••"
                className={inputCls(!!passwordError, newPassword.length >= 8 && touched.password)}
                style={inputStyle}
                autoComplete="new-password"
                autoFocus
              />
              <button type="button" tabIndex={-1} onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <AnimatePresence>
              {passwordError && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 6 }} exit={{ opacity: 0, height: 0 }} className="text-xs text-rose-500 overflow-hidden">
                  {passwordError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              {t('auth.confirmPasswordLabel')}
            </label>
            <div className="relative">
              <Lock size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: confirmError ? '#f87171' : 'var(--muted)' }} />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                onBlur={() => setTouched(p => ({ ...p, confirm: true }))}
                placeholder="••••••••"
                className={inputCls(!!confirmError, confirmPassword.length >= 8 && newPassword === confirmPassword && touched.confirm)}
                style={inputStyle}
                autoComplete="new-password"
              />
              <button type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }}>
                {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <AnimatePresence>
              {confirmError && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 6 }} exit={{ opacity: 0, height: 0 }} className="text-xs text-rose-500 overflow-hidden">
                  {confirmError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <ErrorBox error={error} />

          <Button type="submit" className="w-full justify-center" disabled={loading}>
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> {t('auth.resetting')}</>
              : t('auth.resetBtn')
            }
          </Button>
        </form>
      </motion.div>
    );
  };

  return (
    <div className="app-shell relative min-h-screen w-full overflow-y-auto p-4 sm:p-8">
      <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full blur-3xl" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-100) 80%, transparent)' }} />
      <div className="pointer-events-none absolute bottom-10 right-8 h-52 w-52 rounded-full blur-3xl" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-50) 85%, transparent)' }} />

      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-md items-center justify-center">
        <div className="app-surface w-full overflow-hidden rounded-3xl border shadow-2xl p-6 sm:p-10" style={{ borderColor: 'var(--border)' }}>
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MarcosLogoMark size={32} />
              <div className="leading-none">
                <span className="text-xs font-black block" style={{ color: 'var(--text)' }}>Marcos Music</span>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent-600)' }}>Agenda</span>
              </div>
            </div>
            {step !== 'success' && (
              <button
                type="button"
                onClick={step === 'email' ? onBack : () => { setStep(step === 'newPassword' ? 'code' : 'email'); setError(''); }}
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: 'var(--muted)' }}
              >
                <ArrowLeft size={13} />
                {t('auth.backToLogin')}
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {stepContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ error }: { error: string }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.18 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-900/40 px-3 py-2.5">
            <AlertCircle size={14} className="text-rose-500 shrink-0" />
            <span className="text-xs text-rose-600 dark:text-rose-400">{error}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
