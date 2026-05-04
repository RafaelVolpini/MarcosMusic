import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Tag, Save, UserPlus, Info } from 'lucide-react';
import type { Aluno } from '../../types';
import type { AlunoFormData } from '../../services/alunoService';

// ─── tipos ────────────────────────────────────────────────────────────────────

interface AlunoModalProps {
  /** Passa um Aluno para modo edição; undefined para modo cadastro */
  aluno?: Aluno;
  open: boolean;
  onClose: () => void;
  onSave: (data: AlunoFormData, id?: string) => Promise<void> | void;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const EMPTY: AlunoFormData = {
  nome: '',
  email: '',
  telefone: '',
  apelido: '',
  ativo: true,
};

function toFormData(a: Aluno): AlunoFormData {
  return {
    nome: a.nome,
    email: a.email,
    telefone: a.telefone ?? '',
    apelido: a.apelido ?? '',
    ativo: a.ativo,
  };
}

// ─── sub-componentes ──────────────────────────────────────────────────────────

function Field({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide flex items-center gap-1.5">
        <Icon size={11} className="text-[var(--accent-500)]" />
        {label}
      </label>
      {children}
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
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hasError?: boolean;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`
        h-10 px-3 rounded-xl text-sm bg-[var(--input-bg)]
        border transition-all outline-none
        text-[var(--text)] placeholder:text-[var(--muted)]
        focus:ring-2 focus:ring-[var(--accent-500)]/30
        disabled:opacity-50 disabled:cursor-not-allowed
        ${hasError
          ? 'border-red-400 focus:border-red-400'
          : 'border-[var(--input-border)] focus:border-[var(--accent-500)]'
        }
      `}
    />
  );
}

// ─── modal principal ──────────────────────────────────────────────────────────

export function AlunoModal({ aluno, open, onClose, onSave }: AlunoModalProps) {
  const isEdit = !!aluno;

  const [form, setForm] = useState<AlunoFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof AlunoFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza form quando abre
  useEffect(() => {
    if (open) {
      setForm(aluno ? toFormData(aluno) : EMPTY);
      setErrors({});
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
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.nome.trim())        e.nome   = 'Nome é obrigatório';
    if (!form.email.trim())       e.email  = 'E-mail é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'E-mail inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave(form, aluno?.id);
      onClose();
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
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div
              className="
                w-full max-w-md bg-[var(--card)] rounded-2xl shadow-2xl
                border border-[var(--border)] overflow-hidden
              "
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--accent-500)]/10 flex items-center justify-center">
                    {isEdit
                      ? <User size={15} className="text-[var(--accent-500)]" />
                      : <UserPlus size={15} className="text-[var(--accent-500)]" />
                    }
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[var(--heading)]">
                      {isEdit ? 'Editar aluno' : 'Novo aluno'}
                    </h2>
                    {isEdit && (
                      <p className="text-xs text-[var(--muted)]">{aluno.nome}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="
                    w-7 h-7 rounded-lg flex items-center justify-center
                    text-[var(--muted)] hover:text-[var(--text)]
                    hover:bg-[var(--input-bg)] transition-colors
                  "
                >
                  <X size={15} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate>
                <div className="px-6 py-5 flex flex-col gap-4">

                  <Field label="Nome completo" icon={User} error={errors.nome}>
                    <TextInput
                      value={form.nome}
                      onChange={v => set('nome', v)}
                      placeholder="Ex: João da Silva"
                      hasError={!!errors.nome}
                    />
                  </Field>

                  <Field label="E-mail" icon={Mail} error={errors.email}>
                    <TextInput
                      type="email"
                      value={form.email}
                      onChange={v => set('email', v)}
                      placeholder="aluno@email.com"
                      hasError={!!errors.email}
                      disabled={isEdit}
                    />
                    {isEdit && (
                      <p className="text-[11px] text-[var(--muted)] -mt-0.5">
                        E-mail não pode ser alterado após o cadastro.
                      </p>
                    )}
                  </Field>

                  <Field label="Telefone" icon={Phone}>
                    <TextInput
                      type="tel"
                      value={form.telefone}
                      onChange={v => set('telefone', v)}
                      placeholder="(31) 9 9999-9999"
                    />
                  </Field>

                  <Field label="Apelido" icon={Tag}>
                    <TextInput
                      value={form.apelido ?? ''}
                      onChange={v => set('apelido', v)}
                      placeholder="Como prefere ser chamado..."
                    />
                  </Field>

                  {/* Senha padrão — somente no cadastro */}
                  {!isEdit && (
                    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-[var(--accent-500)]/8 border border-[var(--accent-500)]/20">
                      <Info size={13} className="text-[var(--accent-500)] mt-0.5 shrink-0" />
                      <p className="text-xs text-[var(--muted)] leading-relaxed">
                        A senha inicial do aluno será{' '}
                        <span className="font-bold text-[var(--text)]">123456</span>.
                        {' '}Oriente-o a alterá-la no primeiro acesso.
                      </p>
                    </div>
                  )}

                  {/* Toggle ativo */}
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-[var(--text)] font-medium">Aluno ativo</span>
                    <button
                      type="button"
                      onClick={() => set('ativo', !form.ativo)}
                      className={`
                        relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none
                        ${form.ativo ? 'bg-[var(--accent-500)]' : 'bg-[var(--input-border)]'}
                      `}
                    >
                      <span
                        className={`
                          absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm
                          transition-transform duration-200
                          ${form.ativo ? 'translate-x-5' : 'translate-x-0'}
                        `}
                      />
                    </button>
                  </div>

                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--border)] bg-[var(--input-bg)]/40">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="
                      h-9 px-4 rounded-xl text-sm font-medium
                      text-[var(--muted)] hover:text-[var(--text)]
                      hover:bg-[var(--input-bg)] transition-colors
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
                      bg-[var(--accent-500)] hover:bg-[var(--accent-600)]
                      transition-colors flex items-center gap-2
                      disabled:opacity-60 disabled:cursor-not-allowed
                    "
                  >
                    {loading
                      ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : <Save size={13} />
                    }
                    {loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Cadastrar'}
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
