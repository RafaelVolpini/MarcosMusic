import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { AuthSplitLayout } from './AuthSplitLayout';
import { forgotPassword, resetPassword } from '../../lib/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const fieldLabel = 'mb-1.5 block text-sm font-medium text-(--text)';
const inputBase =
  'w-full rounded-md border border-(--input-border) bg-(--input-bg) px-3 py-2 text-sm text-(--text) outline-none transition focus:ring-2 focus:ring-(--accent-500)/25 focus:border-(--accent-500)';

interface Props {
  resetToken?: string;
  onBack: () => void;
  onResetSuccess: () => void;
}

export function ForgotPasswordPage({ resetToken, onBack, onResetSuccess }: Props) {
  // ── Fluxo "esqueci minha senha" ──────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);

  const emailValid = EMAIL_RE.test(email.trim());
  const emailError = emailTouched && !email.trim()
    ? 'E-mail obrigatório'
    : emailTouched && !emailValid
      ? 'E-mail inválido'
      : '';

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    if (!emailValid) return;
    setForgotLoading(true);
    try {
      await forgotPassword(email.trim());
      setForgotDone(true);
    } finally {
      setForgotLoading(false);
    }
  };

  // ── Fluxo "definir nova senha" ────────────────────────────────────────────────
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [resetError, setResetError] = useState('');
  const [senhasTouched, setSenhasTouched] = useState(false);

  const senhaForte = novaSenha.length >= 6;
  const senhasCoincidem = novaSenha === confirmarSenha;
  const senhaError = senhasTouched && !senhaForte ? 'Mínimo de 6 caracteres' : '';
  const confirmarError = senhasTouched && !senhasCoincidem ? 'As senhas não coincidem' : '';

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSenhasTouched(true);
    if (!senhaForte || !senhasCoincidem) return;
    setResetLoading(true);
    setResetError('');
    try {
      await resetPassword(resetToken!, novaSenha);
      setResetDone(true);
      setTimeout(onResetSuccess, 2000);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Token inválido ou expirado');
    } finally {
      setResetLoading(false);
    }
  };

  const view: 'forgot' | 'reset' | 'forgotDone' | 'resetDone' =
    resetToken
      ? resetDone ? 'resetDone' : 'reset'
      : forgotDone ? 'forgotDone' : 'forgot';

  return (
    <AuthSplitLayout>
      <AnimatePresence mode="wait">
        {/* ── Esqueci minha senha ── */}
        {view === 'forgot' && (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <h2 className="text-2xl font-semibold text-(--heading)">Esqueci minha senha</h2>
            <p className="mt-1 text-sm text-(--muted)">Informe seu e-mail para receber o link de redefinição.</p>

            <form onSubmit={handleForgot} noValidate className="mt-8 space-y-4">
              <div>
                <label className={fieldLabel} htmlFor="forgot-email">E-mail</label>
                <div className="relative">
                  <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="seu@email.com"
                    autoFocus
                    className={`${inputBase} pl-9 ${emailError ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-300/25' : ''}`}
                  />
                </div>
                <AnimatePresence>
                  {emailError && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mt-1.5 overflow-hidden text-xs text-rose-500">{emailError}</motion.p>
                  )}
                </AnimatePresence>
              </div>

              <Button type="submit" disabled={forgotLoading} className="w-full justify-center" style={{ background: 'var(--accent-600)' }}>
                {forgotLoading ? <><Loader2 size={14} className="animate-spin" /> Enviando...</> : 'Enviar link de recuperação'}
              </Button>

              <Button type="button" variant="secondary" onClick={onBack} className="w-full justify-center">
                <ArrowLeft size={13} /> Voltar ao login
              </Button>
            </form>
          </motion.div>
        )}

        {/* ── E-mail enviado ── */}
        {view === 'forgotDone' && (
          <motion.div
            key="forgotDone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col items-center py-6 text-center"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-(--accent-icon-bg)">
              <Mail size={28} className="text-(--accent-600)" />
            </div>
            <h2 className="text-2xl font-semibold text-(--heading)">Verifique seu e-mail</h2>
            <p className="mt-2 text-sm text-(--muted)">
              Se <span className="font-medium text-(--text)">{email}</span> estiver cadastrado, você receberá o link em instantes.
            </p>
            <p className="mt-1 text-xs text-(--muted)">
              O link é válido por <strong>30 minutos</strong>. Verifique também sua caixa de spam.
            </p>
            <Button variant="secondary" onClick={onBack} className="mt-8">
              <ArrowLeft size={13} /> Voltar ao login
            </Button>
          </motion.div>
        )}

        {/* ── Nova senha ── */}
        {view === 'reset' && (
          <motion.div
            key="reset"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <h2 className="text-2xl font-semibold text-(--heading)">Nova senha</h2>
            <p className="mt-1 text-sm text-(--muted)">Escolha uma senha segura para sua conta.</p>

            <AnimatePresence>
              {resetError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden">
                  <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2.5 dark:border-rose-900/40 dark:bg-rose-950/40">
                    <AlertCircle size={14} className="shrink-0 text-rose-500" />
                    <span className="text-xs text-rose-600 dark:text-rose-400">{resetError}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleReset} noValidate className="mt-6 space-y-4">
              <div>
                <label className={fieldLabel} htmlFor="reset-senha">Nova senha</label>
                <div className="relative">
                  <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)" />
                  <input
                    id="reset-senha"
                    type={showPass ? 'text' : 'password'}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    autoFocus
                    className={`${inputBase} pl-9 pr-9 ${senhaError ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-300/25' : ''}`}
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted) hover:text-(--text)">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <AnimatePresence>
                  {senhaError && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mt-1.5 overflow-hidden text-xs text-rose-500">{senhaError}</motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className={fieldLabel} htmlFor="reset-confirmar">Confirmar senha</label>
                <div className="relative">
                  <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)" />
                  <input
                    id="reset-confirmar"
                    type={showPass ? 'text' : 'password'}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Repita a senha"
                    className={`${inputBase} pl-9 ${confirmarError ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-300/25' : ''}`}
                  />
                </div>
                <AnimatePresence>
                  {confirmarError && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mt-1.5 overflow-hidden text-xs text-rose-500">{confirmarError}</motion.p>
                  )}
                </AnimatePresence>
              </div>

              <Button type="submit" disabled={resetLoading} className="w-full justify-center" style={{ background: 'var(--accent-600)' }}>
                {resetLoading ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : 'Redefinir senha'}
              </Button>
            </form>
          </motion.div>
        )}

        {/* ── Senha redefinida ── */}
        {view === 'resetDone' && (
          <motion.div
            key="resetDone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col items-center py-6 text-center"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-semibold text-(--heading)">Senha redefinida!</h2>
            <p className="mt-2 text-sm text-(--muted)">Sua nova senha foi salva. Redirecionando para o login...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthSplitLayout>
  );
}
