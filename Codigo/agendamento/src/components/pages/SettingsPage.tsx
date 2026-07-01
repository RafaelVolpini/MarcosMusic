import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Bell, Palette, Globe, Check, RotateCcw, Sliders, CheckCircle2,
  User, Phone, Mail, AlertCircle, Gift,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../utils';
import { startGoogleOAuth, setGoogleConnectedFlag, getGoogleConnectedFlag, getAutoSyncFlag, setAutoSyncFlag } from '../../services/googleService';
import {
  useThemeSettings,
  type ThemePreset,
  type ThemeBgColor,
  type ThemeBundleDef,
  THEME_BUNDLES,
} from '../../context/ThemeContext';
import { useAppSettings } from '../../context/AppSettingsContext';
import type { AuthUser } from '../../lib/auth';
import { useToast } from '../ui/Toast';
import { useLanguage } from '../../context/LanguageContext';
import { SaldoCreditosCard } from '../creditos/SaldoCreditosCard';
import { CreditsPage } from './CreditsPage';

const TIMEZONES: { label: string; value: string }[] = [
  { label: 'America/Sao_Paulo UTC-3 (Brasília, SP, RJ)', value: 'America/Sao_Paulo' },
  { label: 'America/Belem UTC-3 (Belém, PA)', value: 'America/Belem' },
  { label: 'America/Fortaleza UTC-3 (Fortaleza, CE)', value: 'America/Fortaleza' },
  { label: 'America/Recife UTC-3 (Recife, PE)', value: 'America/Recife' },
  { label: 'America/Maceio UTC-3 (Maceió, AL)', value: 'America/Maceio' },
  { label: 'America/Bahia UTC-3 (Salvador, BA)', value: 'America/Bahia' },
  { label: 'America/Manaus UTC-4 (Manaus, AM)', value: 'America/Manaus' },
  { label: 'America/Cuiaba UTC-4 (Cuiabá, MT)', value: 'America/Cuiaba' },
  { label: 'America/Porto_Velho UTC-4 (Porto Velho, RO)', value: 'America/Porto_Velho' },
  { label: 'America/Boa_Vista UTC-4 (Boa Vista, RR)', value: 'America/Boa_Vista' },
  { label: 'America/Rio_Branco UTC-5 (Rio Branco, AC)', value: 'America/Rio_Branco' },
  { label: 'America/Noronha UTC-2 (Fernando de Noronha)', value: 'America/Noronha' },
  { label: '─────────────────', value: '' },
  { label: 'America/New_York UTC-5/-4 (Nova York, EUA)', value: 'America/New_York' },
  { label: 'America/Chicago UTC-6/-5 (Chicago, EUA)', value: 'America/Chicago' },
  { label: 'America/Denver UTC-7/-6 (Denver, EUA)', value: 'America/Denver' },
  { label: 'America/Los_Angeles UTC-8/-7 (Los Angeles, EUA)', value: 'America/Los_Angeles' },
  { label: 'America/Anchorage UTC-9/-8 (Anchorage, EUA)', value: 'America/Anchorage' },
  { label: 'America/Mexico_City UTC-6/-5 (Cidade do México)', value: 'America/Mexico_City' },
  { label: 'America/Argentina/Buenos_Aires UTC-3 (Buenos Aires)', value: 'America/Argentina/Buenos_Aires' },
  { label: 'America/Lima UTC-5 (Lima, Peru)', value: 'America/Lima' },
  { label: 'America/Bogota UTC-5 (Bogotá, Colômbia)', value: 'America/Bogota' },
  { label: 'America/Santiago UTC-4/-3 (Santiago, Chile)', value: 'America/Santiago' },
  { label: 'America/Caracas UTC-4 (Caracas, Venezuela)', value: 'America/Caracas' },
  { label: '─────────────────', value: '' },
  { label: 'Europe/Lisbon UTC+0/+1 (Lisboa, Portugal)', value: 'Europe/Lisbon' },
  { label: 'Europe/London UTC+0/+1 (Londres, Reino Unido)', value: 'Europe/London' },
  { label: 'Europe/Madrid UTC+1/+2 (Madri, Espanha)', value: 'Europe/Madrid' },
  { label: 'Europe/Paris UTC+1/+2 (Paris, França)', value: 'Europe/Paris' },
  { label: 'Europe/Berlin UTC+1/+2 (Berlim, Alemanha)', value: 'Europe/Berlin' },
  { label: 'Europe/Rome UTC+1/+2 (Roma, Itália)', value: 'Europe/Rome' },
  { label: 'Europe/Moscow UTC+3 (Moscou, Rússia)', value: 'Europe/Moscow' },
  { label: '─────────────────', value: '' },
  { label: 'Africa/Luanda UTC+1 (Luanda, Angola)', value: 'Africa/Luanda' },
  { label: 'Africa/Maputo UTC+2 (Maputo, Moçambique)', value: 'Africa/Maputo' },
  { label: 'Africa/Lagos UTC+1 (Lagos, Nigéria)', value: 'Africa/Lagos' },
  { label: 'Africa/Nairobi UTC+3 (Nairóbi, Quênia)', value: 'Africa/Nairobi' },
  { label: '─────────────────', value: '' },
  { label: 'Asia/Dubai UTC+4 (Dubai, Emirados Árabes)', value: 'Asia/Dubai' },
  { label: 'Asia/Kolkata UTC+5:30 (Mumbai, Índia)', value: 'Asia/Kolkata' },
  { label: 'Asia/Singapore UTC+8 (Singapura)', value: 'Asia/Singapore' },
  { label: 'Asia/Tokyo UTC+9 (Tóquio, Japão)', value: 'Asia/Tokyo' },
  { label: 'Asia/Shanghai UTC+8 (Xangai, China)', value: 'Asia/Shanghai' },
  { label: 'Asia/Seoul UTC+9 (Seul, Coreia do Sul)', value: 'Asia/Seoul' },
  { label: '─────────────────', value: '' },
  { label: 'Australia/Sydney UTC+10/+11 (Sydney, Austrália)', value: 'Australia/Sydney' },
  { label: 'Pacific/Auckland UTC+12/+13 (Auckland, Nova Zelândia)', value: 'Pacific/Auckland' },
  { label: 'UTC UTC+0', value: 'UTC' },
];

const SECTIONS = [
  { id: 'profile',       labelKey: 'settings.sections.profile',       icon: <User size={15} />,     studentOnly: false },
  { id: 'general',       labelKey: 'settings.sections.general',       icon: <Settings size={15} />, studentOnly: false },
  { id: 'notifications', labelKey: 'settings.sections.notifications', icon: <Bell size={15} />,     studentOnly: false },
  { id: 'appearance',    labelKey: 'settings.sections.appearance',    icon: <Palette size={15} />,  studentOnly: false },
  { id: 'integrations',  labelKey: 'settings.sections.integrations',  icon: <Globe size={15} />,    studentOnly: false },
  { id: 'credits',       labelKey: 'settings.sections.credits',       icon: <Gift size={15} />,     studentOnly: true  },
];

// ─── helpers de perfil ────────────────────────────────────────────────────────

const SESSION_KEY = 'marcos-music:auth:session';

function formatPhone(raw: string): string {
  // Remove tudo que não é dígito, ignorar código do país se já digitado
  let d = raw.replace(/\D/g, '');
  // Se o usuário digitou o código 55 (Brasil) no início, removê-lo para re-adicionar formatado
  if (d.startsWith('55') && d.length > 11) d = d.slice(2);
  d = d.slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2)  return `+55 (${d}`;
  if (d.length <= 6)  return `+55 (${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `+55 (${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `+55 (${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function isPhoneValid(phone: string): boolean {
  const d = phone.replace(/\D/g, '');
  // Aceita dígitos locais (10-11) ou formatados com código do país 55 (12-13)
  if (d.startsWith('55') && d.length > 11) {
    const local = d.slice(2);
    return local.length === 10 || local.length === 11;
  }
  return d.length === 10 || d.length === 11;
}

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

interface SettingsPageProps {
  user?: AuthUser;
  onProfileUpdate?: (u: AuthUser) => void;
  initialSection?: string;
}

export function SettingsPage({ user, onProfileUpdate, initialSection }: SettingsPageProps) {
  const { settings, setSettings, resetSettings, activeBundle, resolvedMode } = useThemeSettings();
  const { appSettings, setTimezone } = useAppSettings();
  const toast = useToast();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState(() => {
    const stored = sessionStorage.getItem('marcos-music:settings:section');
    if (stored) { sessionStorage.removeItem('marcos-music:settings:section'); return stored; }
    return initialSection ?? 'profile';
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [schoolName, setSchoolName] = useState('Marcos-Music-Plataform');
  const [pendingTimezone, setPendingTimezone] = useState(appSettings.timezone);
  const [notifLessons, setNotifLessons] = useState(true);
  const [notifPayments, setNotifPayments] = useState(true);
  const [notifMessages, setNotifMessages] = useState(false);

  // ── Perfil ──
  const [profileNome, setProfileNome] = useState(user?.name ?? '');
  // Armazena apenas os dígitos locais (sem +55), para evitar bug do contador 55 na máscara
  const [profileTelefone, setProfileTelefone] = useState(() => {
    const raw = user?.phone ?? '';
    let d = raw.replace(/\D/g, '');
    if (d.startsWith('55') && d.length > 11) d = d.slice(2);
    return d.slice(0, 11);
  });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(user?.photoUrl ?? null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  const profileInitials = profileNome.trim()
    ? profileNome.trim().split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
    : (user?.email ?? '??').slice(0, 2).toUpperCase();
  const profileFilled = [profileNome.trim(), profileTelefone].filter(Boolean).length;
  const profilePct = Math.round((profileFilled / 2) * 100);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role === 'teacher' && !profileNome.trim()) { setProfileError(t('profileSetup.errName')); return; }
    if (profileTelefone.trim() && !isPhoneValid(profileTelefone)) {
      setProfileError(t('profileSetup.errPhone'));
      return;
    }
    setProfileLoading(true);
    setProfileError('');
    try {
      const res = await fetch('/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nome: user?.role === 'teacher' ? (profileNome.trim() || undefined) : undefined,
          telefone: formatPhone(profileTelefone).trim() || null,
        }),
      });
      if (!res.ok) throw new Error('Erro ao salvar perfil');
      const savedNome = user?.role === 'teacher' ? profileNome.trim() : (user?.name ?? profileNome.trim());
      const parts = savedNome.split(' ');
      const updatedUser: AuthUser = {
        ...user!,
        firstName: parts[0] ?? '',
        lastName: parts.slice(1).join(' '),
        name: savedNome,
        phone: formatPhone(profileTelefone).trim(),
      };
      // Persiste na mesma storage que o login usou (remember-me → localStorage)
      const payload = JSON.stringify(updatedUser);
      if (localStorage.getItem(SESSION_KEY)) {
        localStorage.setItem(SESSION_KEY, payload);
      } else {
        sessionStorage.setItem(SESSION_KEY, payload);
      }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
      onProfileUpdate?.(updatedUser);
      toast(t('profileSetup.saved'), 'success');
    } catch {
      setProfileError(t('profileSetup.errSave'));
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Google Calendar ──
  const [googleConnected, setGoogleConnectedState] = useState(getGoogleConnectedFlag);
  const [googleConnecting, setGoogleConnecting] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [autoSync, setAutoSyncState] = useState(getAutoSyncFlag);

  function setAutoSync(v: boolean) {
    setAutoSyncState(v);
    setAutoSyncFlag(v);
  }

  function setGoogleConnected(v: boolean) {
    setGoogleConnectedState(v);
    setGoogleConnectedFlag(v);
  }

  // Detecta retorno do OAuth do Google
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('google');
    if (!status) return;

    params.delete('google');
    const url = new URL(window.location.href);
    url.search = params.toString();
    window.history.replaceState({}, '', url.toString());

    if (status === 'connected') {
      setGoogleConnected(true);
      setActiveSection('integrations');
      toast('Google Calendar conectado com sucesso!', 'success');
    } else {
      setGoogleError('Não foi possível conectar ao Google Calendar.');
      setActiveSection('integrations');
    }
  }, []);

  // Busca foto do perfil Google quando conectado
  useEffect(() => {
    if (!googleConnected || profilePhoto) return;
    fetch('/google/me/photo', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then((data: { photoUrl?: string } | null) => {
        if (!data?.photoUrl) return;
        setProfilePhoto(data.photoUrl);
        // Persiste no mesmo storage usado pelo login
        const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
        if (raw) {
          try {
            const current = JSON.parse(raw);
            const updated = JSON.stringify({ ...current, photoUrl: data.photoUrl });
            if (localStorage.getItem(SESSION_KEY)) localStorage.setItem(SESSION_KEY, updated);
            else sessionStorage.setItem(SESSION_KEY, updated);
          } catch { /* ignore */ }
        }
      })
      .catch(() => {});
  }, [googleConnected]);

  const handleConnectGoogle = async () => {
    setGoogleConnecting(true);
    setGoogleError(null);
    try {
      const returnUrl = `${window.location.origin}${window.location.pathname}`;
      // Passa o email do professor como loginHint para o backend identificar o usuário
      await startGoogleOAuth(user?.email, returnUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao conectar com Google.';
      setGoogleError(msg);
      toast(msg, 'error');
      setGoogleConnecting(false);
    }
  };

  const inputCls = 'w-full border border-(--input-border) bg-(--input-bg) rounded-xl px-3 py-2 text-sm text-(--input-text) focus:outline-none focus:ring-2 focus:ring-(--accent-100)';
  const labelCls = 'text-xs font-medium text-(--muted) mb-1.5 block';

  const profileInputStyle = { borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--input-bg, var(--surface))' };

  return (
    <div className="page-padding">
      <div className="flex gap-6">
        {/* Sidebar nav */}
        <div className="w-48 shrink-0">
          <Card className="p-2 app-surface">
            {SECTIONS.filter(s => !s.studentOnly || user?.role === 'student').map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 h-9 rounded-xl text-sm transition-all mb-0.5',
                  activeSection === s.id
                    ? 'font-medium text-(--accent-700) bg-(--accent-50)'
                    : 'text-(--muted) hover:bg-(--hover-bg)',
                )}
              >
                <span className={activeSection === s.id ? 'text-(--accent-600)' : 'text-(--muted)'}>{s.icon}</span>
                {t(s.labelKey)}
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
            {activeSection === 'profile' && user && (
              <Card className="p-6 app-surface">
                <h2 className="text-sm font-semibold text-(--heading) mb-5">{t('settings.sections.profile')}</h2>
                <form onSubmit={handleProfileSave} className="space-y-5">
                  {/* Avatar + progresso */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'var(--surface-soft)', border: '1px solid var(--border)' }}>
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black text-white shrink-0 shadow overflow-hidden"
                      style={{ background: profilePhoto ? 'transparent' : 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                    >
                      {profilePhoto
                        ? <img src={profilePhoto} alt={profileInitials} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        : profileInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate text-(--heading)">
                        {profileNome.trim() || 'Seu nome'}
                      </p>
                      <p className="text-xs text-(--muted) truncate mt-0.5">{user.email}</p>                    <span
                      className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{ background: 'var(--accent-50)', color: 'var(--accent-700)', border: '1px solid var(--accent-100)' }}
                    >
                      {user.role === 'teacher' ? t('settings.profile.roleTeacher') : t('settings.profile.roleStudent')}
                    </span>                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-(--border)">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${profilePct}%` }}
                            transition={{ duration: 0.4 }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-(--accent-600) shrink-0">{profilePct}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Email (readonly) */}
                  <div>
                    <label className={labelCls}>{t('profileSetup.emailLabel')}</label>
                    <div className="relative">
                      <Mail size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)" />
                      <input
                        className="w-full border rounded-xl pl-9 pr-3 py-2 text-sm opacity-60 cursor-not-allowed"
                        style={profileInputStyle}
                        value={user.email}
                        readOnly
                        tabIndex={-1}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-(--muted)">{t('profileSetup.emailReadonly')}</p>
                  </div>

                  {/* Nome */}
                  <div>
                    <label className={labelCls}>{t('profileSetup.nameLabel')} {user.role === 'teacher' ? '*' : ''}</label>
                    <div className="relative">
                      <User size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)" />
                      <input
                        className="w-full border rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--accent-100)"
                        style={{
                          ...profileInputStyle,
                          ...(user.role !== 'teacher' ? { opacity: 0.6, cursor: 'not-allowed' } : {}),
                        }}
                        value={profileNome}
                        onChange={e => { if (user.role === 'teacher') setProfileNome(e.target.value); }}
                        readOnly={user.role !== 'teacher'}
                        placeholder={t('profileSetup.namePH')}
                      />
                    </div>
                    {user.role !== 'teacher' && (
                      <p className="mt-1 text-[11px] text-(--muted)">{t('settings.profile.nameReadonlyHint')}</p>
                    )}
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className={labelCls}>{t('profileSetup.phoneLabel')}</label>
                    <div className="relative">
                      <Phone size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: profileTelefone && isPhoneValid(profileTelefone) ? 'var(--accent-500)' : 'var(--muted)' }}
                      />
                      <input
                        className="w-full border rounded-xl pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--accent-100)"
                        style={{
                          ...profileInputStyle,
                          borderColor: profileTelefone && !isPhoneValid(profileTelefone) ? '#f87171'
                            : profileTelefone && isPhoneValid(profileTelefone) ? '#34d399'
                            : 'var(--border)',
                        }}
                        value={formatPhone(profileTelefone)}
                        onChange={e => {
                          const raw = e.target.value;
                          let d = raw.replace(/\D/g, '');
                          // Remove o prefixo '55' do país que a máscara insere
                          if (raw.startsWith('+55') && d.startsWith('55')) d = d.slice(2);
                          setProfileTelefone(d.slice(0, 11));
                          if (profileError) setProfileError('');
                        }}
                        placeholder="+55 (11) 99999-9999"
                        type="tel"
                        inputMode="tel"
                      />
                      <AnimatePresence>
                        {profileTelefone && isPhoneValid(profileTelefone) && (
                          <motion.span key="ok" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          </motion.span>
                        )}
                        {profileTelefone && !isPhoneValid(profileTelefone) && (
                          <motion.span key="err" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                            <AlertCircle size={14} className="text-rose-400" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    {profileTelefone && !isPhoneValid(profileTelefone) && (
                      <p className="mt-1 text-xs text-rose-500">{t('profileSetup.phoneHint')}</p>
                    )}
                  </div>

                  <AnimatePresence>
                    {profileError && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
                        {profileError}
                      </motion.p>
                    )}
                    {profileSaved && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold"
                        style={{ backgroundColor: 'var(--accent-50)', borderColor: 'var(--accent-100)', color: 'var(--accent-700)' }}>
                        <CheckCircle2 size={14} /> {t('profileSetup.saved')}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button type="submit" className="w-full justify-center" disabled={profileLoading}>
                    {profileLoading ? t('profileSetup.saving') : t('profileSetup.save')}
                  </Button>
                </form>

                {/* Créditos de Reposição */}
                {user.role === 'student' && user.id && (
                  <div className="mt-6 pt-6 border-t border-(--border)">
                    <SaldoCreditosCard alunoId={user.id} isTeacher={false} />
                  </div>
                )}
              </Card>
            )}

            {activeSection === 'general' && (
              <Card className="p-6 space-y-5 app-surface">
                <h2 className="text-sm font-semibold text-(--heading)">{t('settings.sections.general')}</h2>
                <div>
                  <label className={labelCls}>Nome da escola</label>
                  <input value={schoolName} onChange={e => setSchoolName(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>E-mail de contato</label>
                  <input defaultValue="marcoslima91@hotmail.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Telefone</label>
                  <input defaultValue="+55 11 3333-4444" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Fuso horário</label>
                  <select
                    value={pendingTimezone}
                    onChange={e => { if (e.target.value) setPendingTimezone(e.target.value); }}
                    className={inputCls}
                  >
                    {TIMEZONES.map((tz, i) => (
                      <option key={i} value={tz.value} disabled={!tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={() => setTimezone(pendingTimezone)}>Salvar alterações</Button>
              </Card>
            )}

            {activeSection === 'notifications' && (
              <Card className="p-6 app-surface">
                <h2 className="text-sm font-semibold text-(--heading) mb-5">{t('settings.sections.notifications')}</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Aulas agendadas', desc: 'Receber alertas sobre aulas', value: notifLessons, set: setNotifLessons },
                    { label: 'Pagamentos', desc: 'Cobranças vencendo e em atraso', value: notifPayments, set: setNotifPayments },
                    { label: 'Mensagens', desc: 'Mensagens de alunos e professores', value: notifMessages, set: setNotifMessages },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-(--border) last:border-0">
                      <div>
                        <p className="text-sm font-medium text-(--heading)">{item.label}</p>
                        <p className="text-xs text-(--muted)">{item.desc}</p>
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
                      <h2 className="text-sm font-semibold text-(--heading)">Temas</h2>
                      <p className="text-xs text-(--muted) mt-0.5">Escolha um tema pronto combina cor de destaque e fundo automaticamente</p>
                    </div>
                    <button
                      onClick={resetSettings}
                      title="Restaurar padrão"
                      className="flex items-center gap-1.5 text-xs text-(--muted) hover:text-(--text) px-2.5 h-7 rounded-lg hover:bg-(--hover-bg) transition-all"
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
                              ? 'text-white border-transparent bg-(--accent-600)'
                              : 'bg-(--surface) text-(--text) border-(--border) hover:border-(--accent-500)',
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
                    className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-(--hover-bg) transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sliders size={14} className="text-(--accent-600)" />
                      <span className="text-sm font-semibold text-(--heading)">Personalizar</span>
                      <span className="text-xs text-(--muted)">Controles individuais</span>
                    </div>
                    <motion.span
                      animate={{ rotate: showAdvanced ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-(--muted) text-xs"
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
                    <div className="px-6 pb-6 space-y-5 border-t border-(--border)">
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
                                settings.preset === c.value && 'ring-2 ring-offset-2 ring-(--accent-600) scale-110',
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
                                  ? 'border-(--accent-600) scale-105'
                                  : 'border-(--border) hover:border-(--accent-500)',
                              )}
                            >
                              <div className="w-8 h-8 rounded-lg overflow-hidden shadow-inner border border-(--border)">
                                <div className="w-full h-1/2" style={{ backgroundColor: bg.light }} />
                                <div className="w-full h-1/2" style={{ backgroundColor: bg.dark }} />
                              </div>
                              <span className="text-[10px] font-medium text-(--muted)">{bg.name}</span>
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
                                  ? 'text-white border-transparent bg-(--accent-600)'
                                  : 'bg-(--surface) text-(--text) border-(--border) hover:border-(--accent-500)',
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
                                  ? 'text-white border-transparent bg-(--accent-600)'
                                  : 'bg-(--surface) text-(--text) border-(--border) hover:border-(--accent-500)',
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
                                  ? 'text-white border-transparent bg-(--accent-600)'
                                  : 'bg-(--surface) text-(--text) border-(--border) hover:border-(--accent-500)',
                              )}
                            >
                              {r.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quick preview */}
                      <div className="p-4 rounded-xl border border-(--border) bg-(--surface-soft)">
                        <p className="text-xs font-semibold text-(--heading) mb-3">Preview</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            className="px-3 h-8 text-xs font-semibold rounded-lg text-white"
                            style={{ backgroundColor: 'var(--accent-600)' }}
                          >
                            Primário
                          </button>
                          <button className="px-3 h-8 text-xs font-semibold rounded-lg border border-(--border) bg-(--surface) text-(--text)">
                            Secundário
                          </button>
                          <span className="text-xs px-2.5 h-6 rounded-full flex items-center font-medium"
                            style={{ backgroundColor: 'var(--accent-100)', color: 'var(--accent-700)' }}>
                            Badge
                          </span>
                          <span className="text-xs text-(--muted)">Texto muted</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Card>
              </div>
            )}

            {activeSection === 'integrations' && (
              <Card className="p-6 app-surface">
                <h2 className="text-sm font-semibold text-(--heading) mb-5">{t('settings.sections.integrations')}</h2>
                {googleError && (
                  <div className="mb-4 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600">
                    ⚠ {googleError}
                  </div>
                )}
                <div className="space-y-3">
                  {/* Google Calendar funcional */}
                  <div className="flex items-center gap-4 p-4 border border-(--border) rounded-2xl hover:border-(--accent-500) transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: '#0F9D58' }}>
                      G
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-(--heading)">Google Calendar</p>
                      <p className="text-xs text-(--muted)">
                        {googleConnected ? 'Conta conectada  aulas sincronizadas automaticamente ao iniciar' : 'Sincronizar agenda com Google Calendar'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
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

                  {/* Auto-sync toggle  só aparece quando conectado */}
                  {googleConnected && (
                    <div className="flex items-center justify-between px-4 py-3 rounded-2xl border border-(--border) bg-(--surface-soft)">
                      <div>
                        <p className="text-sm font-medium text-(--heading)">Sincronização automática</p>
                        <p className="text-xs text-(--muted)">Sincroniza com o Google Calendar ao abrir o sistema</p>
                      </div>
                      <button
                        onClick={() => setAutoSync(!autoSync)}
                        aria-label={autoSync ? 'Desativar sincronização automática' : 'Ativar sincronização automática'}
                        className="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-(--accent-500) focus:ring-offset-2"
                        style={{ backgroundColor: autoSync ? 'var(--accent-600)' : 'var(--border)' }}
                      >
                        <span
                          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                          style={{ transform: autoSync ? 'translateX(20px)' : 'translateX(0)' }}
                        />
                      </button>
                    </div>
                  )}

                  {/* Outros (estáticos) */}
                  {[
                    { name: 'Google Meet',  desc: 'Gerar links de videoconferência', connected: true,  color: '#4285F4' },
                  ].map(integration => (
                    <div
                      key={integration.name}
                      className="flex items-center gap-4 p-4 border border-(--border) rounded-2xl hover:border-(--accent-500) transition-colors"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: integration.color }}
                      >
                        {integration.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-(--heading)">{integration.name}</p>
                        <p className="text-xs text-(--muted)">{integration.desc}</p>
                      </div>
                      <Button size="sm" variant={integration.connected ? 'secondary' : 'primary'}>
                        {integration.connected ? 'Desconectar' : 'Conectar'}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeSection === 'credits' && user?.role === 'student' && (
              <CreditsPage />
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
          ? 'border-(--accent-600) shadow-lg'
          : 'border-(--border) hover:border-(--accent-500) hover:shadow-md',
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
      <div className="px-2.5 py-2 bg-(--surface) border-t border-(--border)">
        <p className="text-[11px] font-semibold text-(--heading) leading-tight">{bundle.label}</p>
        <p className="text-[9px] text-(--muted) leading-tight mt-0.5 truncate">{bundle.description}</p>
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
        value ? 'bg-(--accent-600)' : 'bg-(--surface-soft)',
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
