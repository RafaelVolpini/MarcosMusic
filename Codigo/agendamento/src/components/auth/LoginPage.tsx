import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music2, Lock, Mail, User, Phone } from 'lucide-react';
import { Button } from '../ui/Button';
import type { AuthUser } from '../../lib/auth';
import { login, registerUser } from '../../lib/auth';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === 'login') {
      if (!loginEmail.trim() || !loginPassword.trim()) {
        setError('Preencha e-mail e senha para continuar.');
        return;
      }

      const user = login(loginEmail, loginPassword);
      if (!user) {
        setError('E-mail ou senha invalidos.');
        return;
      }

      setError('');
      setSuccess('');
      onLoginSuccess(user);
      return;
    }

    if (!firstName.trim() || !lastName.trim() || !registerEmail.trim() || !phone.trim() || !registerPassword.trim()) {
      setError('Preencha nome, sobrenome, e-mail, telefone e senha para cadastrar.');
      return;
    }

    try {
      registerUser({
        firstName,
        lastName,
        email: registerEmail,
        phone,
        password: registerPassword,
      });

      setMode('login');
      setLoginEmail(registerEmail.trim().toLowerCase());
      setLoginPassword('');
      setRegisterPassword('');
      setError('');
      setSuccess('Cadastro realizado com sucesso. Agora faca login para entrar.');
    } catch (registrationError) {
      const message = registrationError instanceof Error
        ? registrationError.message
        : 'Nao foi possivel concluir o cadastro.';
      setError(message);
      setSuccess('');
    }

  };

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setError('');
    setSuccess('');
  };

  const inputCls = 'w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-(--accent-100)';

  return (
    <div className="app-shell relative min-h-screen w-full overflow-y-auto p-4 sm:p-8">
      <div
        className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: 'color-mix(in srgb, var(--accent-100) 80%, transparent)' }}
      />
      <div
        className="pointer-events-none absolute bottom-10 right-8 h-52 w-52 rounded-full blur-3xl"
        style={{ backgroundColor: 'color-mix(in srgb, var(--accent-50) 85%, transparent)' }}
      />
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-5xl items-center justify-center">
        <div className="app-surface grid w-full overflow-hidden rounded-3xl border shadow-2xl lg:grid-cols-[1.1fr_1fr]" style={{ borderColor: 'var(--border)' }}>
          <section className="relative hidden overflow-hidden p-10 text-white lg:block" style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}>
            <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-white/15 blur-xl" />
            <div className="absolute bottom-8 right-6 h-36 w-36 rounded-full bg-cyan-200/20 blur-xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold backdrop-blur-sm">
                <Music2 size={16} />
                Musga Agenda
              </div>
              <h1 className="mt-8 max-w-sm text-4xl font-black leading-tight">
                Seu estudio organizado, aula por aula.
              </h1>
              <p className="mt-4 max-w-sm text-sm text-indigo-100">
                Controle agenda, alunos e confirmacoes em um fluxo simples e seguro para o dia a dia da escola.
              </p>
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mx-auto w-full max-w-md"
            >
              <div className="mb-6 flex items-center gap-2 lg:hidden">
                <div className="rounded-xl p-2" style={{ backgroundColor: 'var(--accent-100)', color: 'var(--accent-600)' }}>
                  <Music2 size={16} />
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Musga Agenda</span>
              </div>

              <h2 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Entrar</h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                {mode === 'login' ? 'Acesse para continuar para a plataforma.' : 'Crie sua conta para iniciar o primeiro acesso.'}
              </p>

              <div className="mt-4 grid grid-cols-2 rounded-xl p-1" style={{ backgroundColor: 'var(--surface-soft)' }}>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    mode === 'login' ? 'bg-white shadow-sm' : ''
                  }`}
                  style={{ color: mode === 'login' ? 'var(--text)' : 'var(--muted)' }}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    mode === 'register' ? 'bg-white shadow-sm' : ''
                  }`}
                  style={{ color: mode === 'register' ? 'var(--text)' : 'var(--muted)' }}
                >
                  Cadastrar-se
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {mode === 'register' && (
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Nome</label>
                        <div className="relative">
                          <User size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            className={`${inputCls} pl-9`}
                            style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--surface)' }}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Seu nome"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Sobrenome</label>
                        <div className="relative">
                          <User size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            className={`${inputCls} pl-9`}
                            style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--surface)' }}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Seu sobrenome"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Telefone</label>
                      <div className="relative">
                        <Phone size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          className={`${inputCls} pl-9`}
                          style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--surface)' }}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>E-mail</label>
                  <div className="relative">
                    <Mail size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className={`${inputCls} pl-9`}
                      style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--surface)' }}
                      type="email"
                      value={mode === 'login' ? loginEmail : registerEmail}
                      onChange={(e) => mode === 'login' ? setLoginEmail(e.target.value) : setRegisterEmail(e.target.value)}
                      placeholder="voce@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Senha</label>
                  <div className="relative">
                    <Lock size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className={`${inputCls} pl-9`}
                      style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--surface)' }}
                      type="password"
                      value={mode === 'login' ? loginPassword : registerPassword}
                      onChange={(e) => mode === 'login' ? setLoginPassword(e.target.value) : setRegisterPassword(e.target.value)}
                      placeholder="********"
                    />
                  </div>
                </div>

                {error && (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
                )}

                {success && (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{success}</p>
                )}

                <Button type="submit" className="mt-2 w-full justify-center">
                  {mode === 'login' ? 'Entrar e continuar' : 'Cadastrar e continuar'}
                </Button>
              </form>
            </motion.div>
          </section>
        </div>
      </div>
    </div>
  );
}
