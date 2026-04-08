import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Palette, Shield, Globe, Check, RotateCcw } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../utils';
import { useThemeSettings, type ThemePreset } from '../../context/ThemeContext';

const SECTIONS = [
  { id: 'general', label: 'Geral', icon: <Settings size={15} /> },
  { id: 'notifications', label: 'Notificações', icon: <Bell size={15} /> },
  { id: 'appearance', label: 'Aparência', icon: <Palette size={15} /> },
  { id: 'security', label: 'Segurança', icon: <Shield size={15} /> },
  { id: 'integrations', label: 'Integrações', icon: <Globe size={15} /> },
];

const ACCENT_COLORS = [
  { name: 'Indigo', value: 'indigo', swatch: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)' },
  { name: 'Teal', value: 'teal', swatch: 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)' },
  { name: 'Sunset', value: 'sunset', swatch: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)' },
  { name: 'Ocean', value: 'ocean', swatch: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)' },
  { name: 'Forest', value: 'forest', swatch: 'linear-gradient(135deg, #10b981 0%, #16a34a 100%)' },
];

export function SettingsPage() {
  const { settings, setSettings, resetSettings } = useThemeSettings();
  const [activeSection, setActiveSection] = useState('general');
  const [schoolName, setSchoolName] = useState('Musga - Escola de Música');
  const [notifLessons, setNotifLessons] = useState(true);
  const [notifPayments, setNotifPayments] = useState(true);
  const [notifMessages, setNotifMessages] = useState(false);

  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--accent-100)]';
  const labelCls = 'text-xs font-medium text-slate-500 mb-1.5 block';

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
                    : 'text-slate-600 hover:bg-slate-50',
                )}
              >
                <span className={activeSection === s.id ? 'text-[var(--accent-600)]' : 'text-slate-400'}>{s.icon}</span>
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
                <h2 className="text-sm font-semibold text-slate-900">Configurações Gerais</h2>
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
                <div className="flex items-center gap-2">
                  <Button>Salvar alterações</Button>
                  <Button variant="secondary" onClick={resetSettings}>
                    <RotateCcw size={14} /> Restaurar padrão visual
                  </Button>
                </div>
              </Card>
            )}

            {activeSection === 'notifications' && (
              <Card className="p-6 app-surface">
                <h2 className="text-sm font-semibold text-slate-900 mb-5">Notificações</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Aulas agendadas', desc: 'Receber alertas sobre aulas', value: notifLessons, set: setNotifLessons },
                    { label: 'Pagamentos', desc: 'Cobranças vencendo e em atraso', value: notifPayments, set: setNotifPayments },
                    { label: 'Mensagens', desc: 'Mensagens de alunos e professores', value: notifMessages, set: setNotifMessages },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                      <Toggle value={item.value} onChange={item.set} />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeSection === 'appearance' && (
              <Card className="p-6 app-surface">
                <h2 className="text-sm font-semibold text-slate-900 mb-5">Aparência</h2>
                <div>
                  <label className={labelCls}>Paleta principal</label>
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {ACCENT_COLORS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setSettings({ preset: c.value as ThemePreset })}
                        title={c.name}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                        style={{ background: c.swatch }}
                      >
                        {settings.preset === c.value && <Check size={14} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-5 space-y-5">
                  <label className={labelCls}>Tema</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[
                      { id: 'light', label: 'Claro' },
                      { id: 'dark', label: 'Escuro' },
                      { id: 'system', label: 'Sistema' },
                    ].map(t => (
                      <button key={t.id} className={cn(
                        'py-2 text-xs font-medium rounded-xl border transition-all',
                        settings.mode === t.id
                          ? 'text-white border-transparent bg-[var(--accent-600)]'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
                      )}
                      onClick={() => setSettings({ mode: t.id as 'light' | 'dark' | 'system' })}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className={labelCls}>Densidade da interface</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        { id: 'compact', label: 'Compacta' },
                        { id: 'comfortable', label: 'Confortável' },
                      ].map(d => (
                        <button
                          key={d.id}
                          onClick={() => setSettings({ density: d.id as 'compact' | 'comfortable' })}
                          className={cn(
                            'py-2 text-xs font-medium rounded-xl border transition-all',
                            settings.density === d.id
                              ? 'text-white border-transparent bg-[var(--accent-600)]'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
                          )}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Estilo de superfície</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {[
                        { id: 'solid', label: 'Sólido' },
                        { id: 'soft', label: 'Suave' },
                        { id: 'glass', label: 'Glass' },
                      ].map(s => (
                        <button
                          key={s.id}
                          onClick={() => setSettings({ surface: s.id as 'solid' | 'soft' | 'glass' })}
                          className={cn(
                            'py-2 text-xs font-medium rounded-xl border transition-all',
                            settings.surface === s.id
                              ? 'text-white border-transparent bg-[var(--accent-600)]'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Bordas</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {[
                        { id: 'md', label: 'Médio' },
                        { id: 'lg', label: 'Grande' },
                        { id: 'xl', label: 'Extra' },
                      ].map(r => (
                        <button
                          key={r.id}
                          onClick={() => setSettings({ radius: r.id as 'md' | 'lg' | 'xl' })}
                          className={cn(
                            'py-2 text-xs font-medium rounded-xl border transition-all',
                            settings.radius === r.id
                              ? 'text-white border-transparent bg-[var(--accent-600)]'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
                          )}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Preview rápido</p>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 h-8 text-xs font-semibold rounded-lg text-white"
                        style={{ backgroundColor: 'var(--accent-600)' }}
                      >
                        Primário
                      </button>
                      <button className="px-3 h-8 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700">
                        Secundário
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeSection === 'security' && (
              <Card className="p-6 space-y-5 app-surface">
                <h2 className="text-sm font-semibold text-slate-900">Segurança</h2>
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
                <h2 className="text-sm font-semibold text-slate-900 mb-5">Integrações</h2>
                <div className="space-y-3">
                  {[
                    { name: 'Google Meet', desc: 'Gerar links de videoconferência', connected: true, color: '#4285F4' },
                    { name: 'Google Calendar', desc: 'Sincronizar agenda', connected: false, color: '#0F9D58' },
                    { name: 'WhatsApp', desc: 'Notificações por mensagem', connected: false, color: '#25D366' },
                    { name: 'Stripe', desc: 'Pagamentos online', connected: false, color: '#635BFF' },
                  ].map(integration => (
                    <div key={integration.name} className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: integration.color }}>
                        {integration.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{integration.name}</p>
                        <p className="text-xs text-slate-400">{integration.desc}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={integration.connected ? 'secondary' : 'primary'}
                      >
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

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        'relative w-10 h-6 rounded-full transition-colors',
        value ? 'bg-[var(--accent-600)]' : 'bg-slate-200',
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
