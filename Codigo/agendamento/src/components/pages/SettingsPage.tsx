import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Palette, Shield, Globe, Check, RotateCcw, Sliders, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../utils';
import { startGoogleOAuth, syncGoogleCalendar } from '../../services/googleService';
import {
  useThemeSettings,
  type ThemePreset,
  type ThemeBgColor,
  type ThemeBundleDef,
  THEME_BUNDLES,
} from '../../context/ThemeContext';

const SECTIONS = [
  { id: 'general',       label: 'Geral',         icon: <Settings size={15} /> },
  { id: 'notifications', label: 'Notificações',   icon: <Bell size={15} /> },
  { id: 'appearance',    label: 'Aparência',      icon: <Palette size={15} /> },
  { id: 'security',      label: 'Segurança',      icon: <Shield size={15} /> },
  { id: 'integrations',  label: 'Integrações',    icon: <Globe size={15} /> },
];

const ACCENT_COLORS = [
  { name: 'Índigo',   value: 'indigo',  swatch: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)' },
  { name: 'Teal',     value: 'teal',    swatch: 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)' },
  { name: 'Sunset',   value: 'sunset',  swatch: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)' },
  { name: 'Oceano',   value: 'ocean',   swatch: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)' },
  { name: 'Floresta', value: 'forest',  swatch: 'linear-gradient(135deg, #10b981 0%, #16a34a 100%)' },
  { name: 'Âmbar',    value: 'amber',   swatch: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' },
  { name: 'Rosa',     value: 'rose',    swatch: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)' },
  { name: 'Roxo',     value: 'purple',  swatch: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' },
];

const BG_COLORS: { name: string; value: ThemeBgColor; light: string; dark: string }[] = [
  { name: 'Padrão',  value: 'default', light: '#f0f2f9', dark: '#020617' },
  { name: 'Quente',  value: 'warm',    light: '#f5ede2', dark: '#1c1917' },
  { name: 'Frio',    value: 'cool',    light: '#e8f4fd', dark: '#030d1a' },
  { name: 'Violeta', value: 'violet',  light: '#eeeaff', dark: '#09041a' },
  { name: 'Verde',   value: 'sage',    light: '#e5f5ec', dark: '#030f07' },
  { name: 'Rosa',    value: 'rose',    light: '#fef0f2', dark: '#1a0508' },
  { name: 'Creme',   value: 'cream',   light: '#fdf8f0', dark: '#1a1208' },
];

export function SettingsPage() {
  const { settings, setSettings, resetSettings, activeBundle, resolvedMode } = useThemeSettings();
  const [activeSection, setActiveSection] = useState('general');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [schoolName, setSchoolName] = useState('Marcos-Music-Plataform');
  const [notifLessons, setNotifLessons] = useState(true);
  const [notifPayments, setNotifPayments] = useState(true);
  const [notifMessages, setNotifMessages] = useState(false);

  // Google Calendar state
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleConnecting, setGoogleConnecting] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<number | null>(null);

  // Detecta retorno do OAuth do Google
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('google');
    if (!status) return;

    // Limpa o param da URL
    params.delete('google');
    const url = new URL(window.location.href);
    url.search = params.toString();
    window.history.replaceState({}, '', url.toString());

    if (status === 'connected') {
      setGoogleConnected(true);
      setActiveSection('integrations');
    } else {
      setGoogleError('Não foi possível conectar ao Google Calendar.');
      setActiveSection('integrations');
    }
  }, []);

  const handleConnectGoogle = async () => {
    setGoogleConnecting(true);
    setGoogleError(null);
    try {
      const returnUrl = `${window.location.origin}${window.location.pathname}`;
      await startGoogleOAuth(undefined, returnUrl);
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : 'Erro ao conectar com Google.');
      setGoogleConnecting(false);
    }
  };

  const handleSyncGoogle = async () => {
    setSyncLoading(true);
    setSyncSuccess(null);
    setGoogleError(null);
    try {
      // Sincroniza o mês atual
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const result = await syncGoogleCalendar(`${fmt(start)}T00:00:00`, `${fmt(end)}T23:59:59`);
      setSyncSuccess(result.success);
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : 'Erro ao sincronizar.');
    } finally {
      setSyncLoading(false);
    }
  };

  const inputCls = 'w-full border border-[var(--input-border)] bg-[var(--input-bg)] rounded-xl px-3 py-2 text-sm text-[var(--input-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-100)]';
  const labelCls = 'text-xs font-medium text-[var(--muted)] mb-1.5 block';

  return (
    <div className="page-padding">
      <div className="flex gap-6">
        {/* Sidebar nav */}
        <div className="w-48 shrink-0">
          <Card className="p-2 app-surface">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 h-9 rounded-xl text-sm transition-all mb-0.5',
                  activeSection === s.id
                    ? 'font-medium text-[var(--accent-700)] bg-[var(--accent-50)]'
                    : 'text-[var(--muted)] hover:bg-[var(--hover-bg)]',
                )}
              >
                <span className={activeSection === s.id ? 'text-[var(--accent-600)]' : 'text-[var(--muted)]'}>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18 }}
          >
            {activeSection === 'general' && (
              <Card className="p-6 space-y-5 app-surface">
                <h2 className="text-sm font-semibold text-[var(--heading)]">Configurações Gerais</h2>
                <div>
                  <label className={labelCls}>Nome da escola</label>
                  <input value={schoolName} onChange={e => setSchoolName(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>E-mail de contato</label>
                  <input defaultValue="contato@musga.com.br" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Telefone</label>
                  <input defaultValue="+55 11 3333-4444" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Fuso horário</label>
                  <select className={inputCls}>
                    <option>America/Sao_Paulo (UTC-3)</option>
                    <option>America/Manaus (UTC-4)</option>
                    <option>America/Belem (UTC-3)</option>
                  </select>
                </div>
                <Button>Salvar alterações</Button>
              </Card>
            )}

            {activeSection === 'notifications' && (
              <Card className="p-6 app-surface">
                <h2 className="text-sm font-semibold text-[var(--heading)] mb-5">Notificações</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Aulas agendadas', desc: 'Receber alertas sobre aulas', value: notifLessons, set: setNotifLessons },
                    { label: 'Pagamentos', desc: 'Cobranças vencendo e em atraso', value: notifPayments, set: setNotifPayments },
                    { label: 'Mensagens', desc: 'Mensagens de alunos e professores', value: notifMessages, set: setNotifMessages },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                      <div>
                        <p className="text-sm font-medium text-[var(--heading)]">{item.label}</p>
                        <p className="text-xs text-[var(--muted)]">{item.desc}</p>
                      </div>
                      <Toggle value={item.value} onChange={item.set} />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-4">
                {/* ── Temas prontos ── */}
                <Card className="p-6 app-surface">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-semibold text-[var(--heading)]">Temas</h2>
                      <p className="text-xs text-[var(--muted)] mt-0.5">Escolha um tema pronto — combina cor de destaque e fundo automaticamente</p>
                    </div>
                    <button
                      onClick={resetSettings}
                      title="Restaurar padrão"
                      className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] px-2.5 h-7 rounded-lg hover:bg-[var(--hover-bg)] transition-all"
                    >
                      <RotateCcw size={12} />
                      Restaurar
                    </button>
                  </div>

                  {/* Bundle grid */}
                  <div className="grid grid-cols-4 gap-3">
                    {THEME_BUNDLES.map(bundle => (
                      <BundleCard
                        key={bundle.id}
                        bundle={bundle}
                        active={activeBundle === bundle.id}
                        activeMode={resolvedMode}
                        onClick={() => setSettings({ preset: bundle.preset, bgColor: bundle.bgColor })}
                      />
                    ))}
                  </div>

                  {/* Mode selector */}
                  <div className="mt-5">
                    <label className={labelCls}>Modo</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'light',  label: '☀ Claro' },
                        { id: 'dark',   label: '☾ Escuro' },
                        { id: 'system', label: '⊙ Sistema' },
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setSettings({ mode: t.id as 'light' | 'dark' | 'system' })}
                          className={cn(
                            'py-2 text-xs font-medium rounded-xl border transition-all',
                            settings.mode === t.id
                              ? 'text-white border-transparent bg-[var(--accent-600)]'
                              : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:border-[var(--accent-500)]',
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* ── Personalizar ── */}
                <Card className="app-surface overflow-hidden">
                  <button
                    onClick={() => setShowAdvanced(v => !v)}
                    className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-[var(--hover-bg)] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sliders size={14} className="text-[var(--accent-600)]" />
                      <span className="text-sm font-semibold text-[var(--heading)]">Personalizar</span>
                      <span className="text-xs text-[var(--muted)]">Controles individuais</span>
                    </div>
                    <motion.span
                      animate={{ rotate: showAdvanced ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[var(--muted)] text-xs"
                    >
                      ▾
                    </motion.span>
                  </button>

                  <motion.div
                    initial={false}
                    animate={{ height: showAdvanced ? 'auto' : 0, opacity: showAdvanced ? 1 : 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="px-6 pb-6 space-y-5 border-t border-[var(--border)]">
                      {/* Accent colors */}
                      <div className="pt-5">
                        <label className={labelCls}>Cor de destaque</label>
                        <div className="flex gap-2.5 mt-2 flex-wrap">
                          {ACCENT_COLORS.map(c => (
                            <button
                              key={c.value}
                              onClick={() => setSettings({ preset: c.value as ThemePreset })}
                              title={c.name}
                              className={cn(
                                'w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110',
                                settings.preset === c.value && 'ring-2 ring-offset-2 ring-[var(--accent-600)] scale-110',
                              )}
                              style={{ background: c.swatch }}
                            >
                              {settings.preset === c.value && <Check size={13} className="text-white drop-shadow" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Background color */}
                      <div>
                        <label className={labelCls}>Cor do plano de fundo</label>
                        <div className="flex gap-3 mt-2 flex-wrap">
                          {BG_COLORS.map(bg => (
                            <button
                              key={bg.value}
                              onClick={() => setSettings({ bgColor: bg.value })}
                              title={bg.name}
                              className={cn(
                                'flex flex-col items-center gap-1.5 p-1.5 rounded-xl border-2 transition-all',
                                settings.bgColor === bg.value
                                  ? 'border-[var(--accent-600)] scale-105'
                                  : 'border-[var(--border)] hover:border-[var(--accent-500)]',
                              )}
                            >
                              <div className="w-8 h-8 rounded-lg overflow-hidden shadow-inner border border-[var(--border)]">
                                <div className="w-full h-1/2" style={{ backgroundColor: bg.light }} />
                                <div className="w-full h-1/2" style={{ backgroundColor: bg.dark }} />
                              </div>
                              <span className="text-[10px] font-medium text-[var(--muted)]">{bg.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Density */}
                      <div>
                        <label className={labelCls}>Densidade da interface</label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {[
                            { id: 'compact',     label: 'Compacta' },
                            { id: 'comfortable', label: 'Confortável' },
                          ].map(d => (
                            <button
                              key={d.id}
                              onClick={() => setSettings({ density: d.id as 'compact' | 'comfortable' })}
                              className={cn(
                                'py-2 text-xs font-medium rounded-xl border transition-all',
                                settings.density === d.id
                                  ? 'text-white border-transparent bg-[var(--accent-600)]'
                                  : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:border-[var(--accent-500)]',
                              )}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Surface style */}
                      <div>
                        <label className={labelCls}>Estilo de superfície</label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {[
                            { id: 'solid', label: 'Sólido' },
                            { id: 'soft',  label: 'Suave' },
                            { id: 'glass', label: 'Glass' },
                          ].map(s => (
                            <button
                              key={s.id}
                              onClick={() => setSettings({ surface: s.id as 'solid' | 'soft' | 'glass' })}
                              className={cn(
                                'py-2 text-xs font-medium rounded-xl border transition-all',
                                settings.surface === s.id
                                  ? 'text-white border-transparent bg-[var(--accent-600)]'
                                  : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:border-[var(--accent-500)]',
                              )}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Border radius */}
                      <div>
                        <label className={labelCls}>Bordas arredondadas</label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {[
                            { id: 'md', label: 'Médio',  preview: 'rounded-md' },
                            { id: 'lg', label: 'Grande', preview: 'rounded-xl' },
                            { id: 'xl', label: 'Extra',  preview: 'rounded-2xl' },
                          ].map(r => (
                            <button
                              key={r.id}
                              onClick={() => setSettings({ radius: r.id as 'md' | 'lg' | 'xl' })}
                              className={cn(
                                'py-2 text-xs font-medium border transition-all',
                                r.preview,
                                settings.radius === r.id
                                  ? 'text-white border-transparent bg-[var(--accent-600)]'
                                  : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:border-[var(--accent-500)]',
                              )}
                            >
                              {r.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quick preview */}
                      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]">
                        <p className="text-xs font-semibold text-[var(--heading)] mb-3">Preview</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            className="px-3 h-8 text-xs font-semibold rounded-lg text-white"
                            style={{ backgroundColor: 'var(--accent-600)' }}
                          >
                            Primário
                          </button>
                          <button className="px-3 h-8 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
                            Secundário
                          </button>
                          <span className="text-xs px-2.5 h-6 rounded-full flex items-center font-medium"
                            style={{ backgroundColor: 'var(--accent-100)', color: 'var(--accent-700)' }}>
                            Badge
                          </span>
                          <span className="text-xs text-[var(--muted)]">Texto muted</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Card>
              </div>
            )}

            {activeSection === 'security' && (
              <Card className="p-6 space-y-5 app-surface">
                <h2 className="text-sm font-semibold text-[var(--heading)]">Segurança</h2>
                <div>
                  <label className={labelCls}>Senha atual</label>
                  <input type="password" className={inputCls} placeholder="••••••••" />
                </div>
                <div>
                  <label className={labelCls}>Nova senha</label>
                  <input type="password" className={inputCls} placeholder="••••••••" />
                </div>
                <div>
                  <label className={labelCls}>Confirmar nova senha</label>
                  <input type="password" className={inputCls} placeholder="••••••••" />
                </div>
                <Button>Atualizar senha</Button>
              </Card>
            )}

            {activeSection === 'integrations' && (
              <Card className="p-6 app-surface">
                <h2 className="text-sm font-semibold text-[var(--heading)] mb-5">Integrações</h2>
                {googleError && (
                  <div className="mb-4 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600">
                    ⚠ {googleError}
                  </div>
                )}
                {syncSuccess !== null && (
                  <div className="mb-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 size={13} /> {syncSuccess} aula(s) sincronizada(s) com sucesso.
                  </div>
                )}
                <div className="space-y-3">
                  {/* Google Calendar — funcional */}
                  <div className="flex items-center gap-4 p-4 border border-[var(--border)] rounded-2xl hover:border-[var(--accent-500)] transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: '#0F9D58' }}>
                      G
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--heading)]">Google Calendar</p>
                      <p className="text-xs text-[var(--muted)]">
                        {googleConnected ? 'Conta conectada — sincronize suas aulas' : 'Sincronizar agenda com Google Calendar'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {googleConnected && (
                        <button
                          onClick={handleSyncGoogle}
                          disabled={syncLoading}
                          className="flex items-center gap-1.5 px-3 h-8 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--hover-bg)] disabled:opacity-50 transition-colors"
                        >
                          <RefreshCw size={12} className={syncLoading ? 'animate-spin' : ''} />
                          {syncLoading ? 'Sincronizando…' : 'Sincronizar'}
                        </button>
                      )}
                      <Button
                        size="sm"
                        variant={googleConnected ? 'secondary' : 'primary'}
                        onClick={googleConnected ? () => setGoogleConnected(false) : handleConnectGoogle}
                        disabled={googleConnecting}
                      >
                        {googleConnecting ? 'Aguarde…' : googleConnected ? 'Desconectar' : 'Conectar'}
                      </Button>
                    </div>
                  </div>

                  {/* Outros (estáticos) */}
                  {[
                    { name: 'Google Meet',  desc: 'Gerar links de videoconferência', connected: true,  color: '#4285F4' },
                  ].map(integration => (
                    <div
                      key={integration.name}
                      className="flex items-center gap-4 p-4 border border-[var(--border)] rounded-2xl hover:border-[var(--accent-500)] transition-colors"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: integration.color }}
                      >
                        {integration.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--heading)]">{integration.name}</p>
                        <p className="text-xs text-[var(--muted)]">{integration.desc}</p>
                      </div>
                      <Button size="sm" variant={integration.connected ? 'secondary' : 'primary'}>
                        {integration.connected ? 'Desconectar' : 'Conectar'}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── BundleCard ──────────────────────────────────────────────────────────────

interface BundleCardProps {
  bundle: ThemeBundleDef;
  active: boolean;
  activeMode: 'light' | 'dark';
  onClick: () => void;
}

function BundleCard({ bundle, active, activeMode, onClick }: BundleCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative rounded-2xl overflow-hidden border-2 transition-all text-left w-full group',
        active
          ? 'border-[var(--accent-600)] shadow-lg'
          : 'border-[var(--border)] hover:border-[var(--accent-500)] hover:shadow-md',
      )}
    >
      {/* Mini UI preview */}
      <div>
        {/* Light half */}
        <div
          className={cn('h-11 flex gap-1.5 p-1.5 transition-opacity duration-200', activeMode === 'dark' && 'opacity-40')}
          style={{ backgroundColor: bundle.lightBg }}
        >
          {/* Accent sidebar */}
          <div
            className="w-3 h-full rounded-sm shrink-0"
            style={{ background: `linear-gradient(180deg, ${bundle.accentA}, ${bundle.accentB})` }}
          />
          {/* Content cards */}
          <div className="flex-1 flex flex-col gap-0.5">
            <div className="h-1/2 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.85)' }} />
            <div className="flex gap-0.5 flex-1">
              <div className="flex-1 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.85)' }} />
              <div className="flex-1 rounded-sm" style={{ backgroundColor: `${bundle.accentA}55` }} />
            </div>
          </div>
        </div>

        {/* Separator */}
        <div
          className="h-px"
          style={{ background: `linear-gradient(90deg, ${bundle.accentA}80, ${bundle.accentB}80)` }}
        />

        {/* Dark half */}
        <div
          className={cn('h-11 flex gap-1.5 p-1.5 transition-opacity duration-200', activeMode === 'light' && 'opacity-40')}
          style={{ backgroundColor: bundle.darkBg }}
        >
          <div
            className="w-3 h-full rounded-sm shrink-0"
            style={{ background: `linear-gradient(180deg, ${bundle.accentA}, ${bundle.accentB})` }}
          />
          <div className="flex-1 flex flex-col gap-0.5">
            <div className="h-1/2 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <div className="flex gap-0.5 flex-1">
              <div className="flex-1 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <div className="flex-1 rounded-sm" style={{ backgroundColor: `${bundle.accentA}40` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Label area */}
      <div className="px-2.5 py-2 bg-[var(--surface)] border-t border-[var(--border)]">
        <p className="text-[11px] font-semibold text-[var(--heading)] leading-tight">{bundle.label}</p>
        <p className="text-[9px] text-[var(--muted)] leading-tight mt-0.5 truncate">{bundle.description}</p>
      </div>

      {/* Active checkmark */}
      {active && (
        <div
          className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center shadow"
          style={{ background: `linear-gradient(135deg, ${bundle.accentA}, ${bundle.accentB})` }}
        >
          <Check size={8} className="text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

// ─── Toggle ──────────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        'relative w-10 h-6 rounded-full transition-colors',
        value ? 'bg-[var(--accent-600)]' : 'bg-[var(--surface-soft)]',
      )}
    >
      <motion.div
        animate={{ x: value ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
      />
    </button>
  );
}
