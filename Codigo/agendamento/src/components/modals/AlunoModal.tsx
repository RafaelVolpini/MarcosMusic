import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Tag, Save, UserPlus, Info, Lock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import type { Aluno } from '../../types';
import type { AlunoFormData } from '../../services/alunoService';
import { formatPhoneGlobal } from '../../utils';
import { useLanguage } from '../../context/LanguageContext';

// ─── tipos ────────────────────────────────────────────────────────────────────

interface AlunoModalProps {
  /** Passa um Aluno para modo edição; undefined para modo cadastro */
  aluno?: Aluno;
  open: boolean;
  onClose: () => void;
  onSave: (data: AlunoFormData, id?: string) => Promise<void> | void;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Aceita 10-11 dígitos locais OU com DDI 55 (12-13 dígitos)
function isPhoneValid(phone: string): boolean {
  const d = phone.replace(/\D/g, '');
  const local = d.startsWith('55') && d.length >= 12 ? d.slice(2) : d;
  return local.length >= 10 && local.length <= 11;
}

/** Formata input para +55 XX XXXXX-XXXX enquanto o usuário digita */
function formatPhone(raw: string): string {
  // Extrai só dígitos
  let d = raw.replace(/\D/g, '');
  // Se o valor exibido já tem prefixo +55 (foi formatado antes), remover o código do país
  if (raw.trimStart().startsWith('+') && d.startsWith('55')) {
    d = d.slice(2);
  } else if (d.startsWith('55') && d.length > 11) {
    // Número internacional colado (ex: 5511999999999)
    d = d.slice(2);
  }
  d = d.slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2)  return `+55 ${d}`;
  if (d.length <= 6)  return `+55 ${d.slice(0, 2)} ${d.slice(2)}`;
  if (d.length <= 10) return `+55 ${d.slice(0, 2)} ${d.slice(2, 6)}-${d.slice(6)}`;
  return `+55 ${d.slice(0, 2)} ${d.slice(2, 7)}-${d.slice(7)}`;
}

const PLAN_OPTIONS = [
  { value: null, label: 'Sem plano' },
  { value: 2, label: '2 aulas/mês' },
  { value: 3, label: '3 aulas/mês' },
  { value: 4, label: '4 aulas/mês' },
];

const EMPTY: AlunoFormData = {
  nome: '',
  email: '',
  telefone: '',
  apelido: '',
  ativo: true,
  planoAulasMes: null,
};

function toFormData(a: Aluno): AlunoFormData {
  return {
    nome: a.nome,
    email: a.email,
    telefone: a.telefone ? formatPhoneGlobal(a.telefone) : '',
    apelido: a.apelido ?? '',
    ativo: a.ativo,
    planoAulasMes: a.planoAulasMes ?? null,
  };
}

// ─── sub-componentes ──────────────────────────────────────────────────────────

function Field({
  label,
  icon: Icon,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-(--muted) uppercase tracking-wide flex items-center gap-1.5">
        <Icon size={11} className="text-(--accent-500)" />
        {label}
        {required && <span className="text-red-400 font-bold normal-case tracking-normal">*</span>}
      </label>
      {children}
      {hint && !error && <span className="text-[11px] text-(--muted) -mt-0.5">{hint}</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  hasError,
  isValid,
  disabled,
  iconRight,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hasError?: boolean;
  isValid?: boolean;
  disabled?: boolean;
  iconRight?: React.ReactNode;
}) {
  const borderCls = hasError
    ? 'border-red-400 focus:border-red-400 focus:ring-red-300/20'
    : isValid
      ? 'border-emerald-400 focus:border-emerald-400 focus:ring-emerald-300/20'
      : 'border-(--input-border) focus:border-(--accent-500) focus:ring-(--accent-500)/30';

  const showRightIcon = iconRight || isValid || hasError;

  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          h-10 px-3 rounded-xl text-sm bg-(--input-bg) w-full
          border transition-all outline-none
          text-(--text) placeholder:text-(--muted)
          focus:ring-2
          disabled:opacity-60 disabled:cursor-not-allowed
          ${showRightIcon ? 'pr-8' : ''}
          ${borderCls}
        `}
      />
      {/* Ícone à direita: prioridade: prop iconRight > isValid > hasError */}
      {iconRight && (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--muted) pointer-events-none">
          {iconRight}
        </span>
      )}
      {!iconRight && (
        <AnimatePresence>
          {isValid && !hasError && (
            <motion.span
              key="valid"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <CheckCircle2 size={13} className="text-emerald-500" />
            </motion.span>
          )}
          {hasError && (
            <motion.span
              key="error"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <AlertCircle size={13} className="text-red-400" />
            </motion.span>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

// ─── modal principal ──────────────────────────────────────────────────────────

export function AlunoModal({ aluno, open, onClose, onSave }: AlunoModalProps) {
  const isEdit = !!aluno;
  const { t } = useLanguage();

  const [form, setForm] = useState<AlunoFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof AlunoFormData, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza form quando abre
  useEffect(() => {
    if (open) {
      setForm(aluno ? toFormData(aluno) : EMPTY);
      setErrors({});
      setApiError(null);
      setTimeout(() => firstInputRef.current?.focus(), 80);
    }
  }, [open, aluno]);

  // Fecha com Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function set<K extends keyof AlunoFormData>(field: K, value: AlunoFormData[K]) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    if (apiError) setApiError(null);
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.nome.trim()) {
      e.nome = t('modals.student.errName');
    }
    if (!isEdit) {
      if (!form.email.trim()) {
        e.email = t('modals.student.errEmail');
      } else if (!EMAIL_RE.test(form.email.trim())) {
        e.email = t('modals.student.errEmailFmt');
      }
    }
    if (form.telefone && form.telefone.trim() && !isPhoneValid(form.telefone)) {
      e.telefone = t('modals.student.errPhone');
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      await onSave(form, aluno?.id);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar. Tente novamente.';
      // Detecta erro de email duplicado e exibe no campo
      if (msg.toLowerCase().includes('e-mail') || msg.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: msg }));
      } else {
        setApiError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-90 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div
              className="
                w-full max-w-md bg-(--surface) rounded-2xl shadow-2xl
                border border-(--border) overflow-hidden
              "
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-(--border)">
                <div className="flex items-center gap-3">
                  {isEdit ? (
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                    >
                      {aluno.nome.trim().charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-(--accent-500)/10 flex items-center justify-center shrink-0">
                      <UserPlus size={16} className="text-(--accent-500)" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-sm font-bold text-(--heading)">
                      {isEdit ? t('modals.student.editTitle') : t('modals.student.newTitle')}
                    </h2>
                    <p className="text-xs text-(--muted)">
                      {isEdit ? aluno.nome : t('modals.student.subtitle')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="
                    w-7 h-7 rounded-lg flex items-center justify-center
                    text-(--muted) hover:text-(--text)
                    hover:bg-(--input-bg) transition-colors
                  "
                >
                  <X size={15} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate>
                <div className="px-6 py-5 flex flex-col gap-4">

                  {/* Campos obrigatórios */}
                  <Field label={t('modals.student.nameLabel')} icon={User} error={errors.nome} required>
                    <TextInput
                      value={form.nome}
                      onChange={v => set('nome', v)}
                      placeholder={t('modals.student.namePH')}
                      hasError={!!errors.nome}
                      isValid={!!form.nome.trim() && !errors.nome}
                    />
                  </Field>

                  <Field
                    label={t('modals.student.emailLabel')}
                    icon={Mail}
                    error={errors.email}
                    required={!isEdit}
                    hint={isEdit ? t('modals.student.emailHint') : undefined}
                  >
                    <TextInput
                      type="email"
                      value={form.email}
                      onChange={v => set('email', v)}
                      placeholder={t('modals.student.emailPH')}
                      hasError={!!errors.email}
                      isValid={!isEdit && !!form.email.trim() && EMAIL_RE.test(form.email.trim()) && !errors.email}
                      disabled={isEdit}
                      iconRight={isEdit ? <Lock size={13} /> : undefined}
                    />
                  </Field>

                  {/* Senha padrão somente no cadastro */}
                  {!isEdit && (
                    <div
                      className="flex items-start gap-2 px-3 py-2.5 rounded-xl border"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--accent-500) 10%, var(--surface))',
                        borderColor: 'color-mix(in srgb, var(--accent-500) 30%, transparent)',
                      }}
                    >
                      <Info size={13} className="text-(--accent-500) mt-0.5 shrink-0" />
                      <p className="text-xs text-(--muted) leading-relaxed">
                        {t('modals.student.passwordHintPre')}{' '}
                        <span className="font-bold text-(--text)">123456</span>.
                        {' '}{t('modals.student.passwordHintPost')}
                      </p>
                    </div>
                  )}

                  {/* Divisor campos opcionais */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 h-px bg-(--border)" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-(--muted)">{t('common.optional')}</span>
                    <div className="flex-1 h-px bg-(--border)" />
                  </div>

                  <Field label={t('modals.student.phoneLabel')} icon={Phone} error={errors.telefone}
                    hint={!errors.telefone ? t('modals.student.phoneFormat') : undefined}
                  >
                    <TextInput
                      type="tel"
                      value={form.telefone}
                      onChange={v => set('telefone', formatPhone(v))}
                      placeholder={t('modals.student.phonePH')}
                      hasError={!!errors.telefone}
                      isValid={!!form.telefone && isPhoneValid(form.telefone) && !errors.telefone}
                    />
                  </Field>

                  <Field
                    label={t('modals.student.nicknameLabel')}
                    icon={Tag}
                    hint={t('modals.student.nicknameHint')}
                  >
                    <TextInput
                      value={form.apelido ?? ''}
                      onChange={v => set('apelido', v)}
                      placeholder={t('modals.student.nicknamePH')}
                    />
                  </Field>

                  <Field label="Plano de aulas" icon={Calendar}>
                    <div className="flex gap-2 flex-wrap">
                      {PLAN_OPTIONS.map(opt => (
                        <button
                          key={String(opt.value)}
                          type="button"
                          onClick={() => set('planoAulasMes', opt.value)}
                          className={`
                            h-9 px-3.5 rounded-xl text-sm font-medium transition-colors border
                            ${(form.planoAulasMes ?? null) === opt.value
                              ? 'bg-(--accent-500) text-white border-(--accent-500)'
                              : 'bg-(--input-bg) text-(--muted) border-(--input-border) hover:border-(--accent-500) hover:text-(--accent-500)'
                            }
                          `}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* Toggle ativo */}
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <span className="text-sm text-(--text) font-medium">{t('modals.student.statusLabel')}</span>
                      <p className="text-[11px] text-(--muted) mt-0.5">
                        {form.ativo ? t('modals.student.activeDesc') : t('modals.student.inactiveDesc')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => set('ativo', !form.ativo)}
                      className="flex items-center gap-2 shrink-0 ml-4"
                      aria-label={form.ativo ? 'Desativar aluno' : 'Ativar aluno'}
                    >
                      <span className={`text-xs font-semibold ${form.ativo ? 'text-emerald-600' : 'text-(--muted)'}`}>
                        {form.ativo ? t('modals.student.activeLabel') : t('modals.student.inactiveLabel')}
                      </span>
                      <div
                        className={`
                          relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none
                          ${form.ativo ? 'bg-emerald-500' : 'bg-(--input-border)'}
                        `}
                      >
                        <span
                          className={`
                            absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm
                            transition-transform duration-200
                            ${form.ativo ? 'translate-x-5' : 'translate-x-0'}
                          `}
                        />
                      </div>
                    </button>
                  </div>

                </div>

                {/* Erro da API */}
                {apiError && (
                  <div className="mx-6 mb-4 flex items-start gap-2 px-3 py-2.5 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/40 dark:border-red-900/50">
                    <span className="text-red-500 mt-0.5 shrink-0 text-sm font-bold">!</span>
                    <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">{apiError}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-(--border) bg-(--input-bg)/40">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="
                      h-9 px-4 rounded-xl text-sm font-medium
                      text-(--muted) hover:text-(--text)
                      hover:bg-(--input-bg) transition-colors
                      disabled:opacity-50
                    "
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      h-9 px-5 rounded-xl text-sm font-semibold text-white
                      bg-(--accent-500) hover:bg-(--accent-600)
                      transition-colors flex items-center gap-2
                      disabled:opacity-60 disabled:cursor-not-allowed
                    "
                  >
                    {loading
                      ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : <Save size={13} />
                    }
                    {loading ? t('modals.student.saving') : isEdit ? t('modals.student.save') : t('modals.student.create')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
