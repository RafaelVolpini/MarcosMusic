import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/Button";
import { AuthSplitLayout } from "./AuthSplitLayout";
import type { AuthUser } from "../../lib/auth";
import { login } from "../../lib/auth";
import { useLanguage } from "../../context/LanguageContext";

export type { AuthUser };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const fieldLabel = "mb-1.5 block text-sm font-medium text-(--text)";
const inputBase =
  "w-full rounded-md border border-(--input-border) bg-(--input-bg) px-3 py-2 text-sm text-(--text) outline-none transition focus:ring-2 focus:ring-(--accent-500)/25 focus:border-(--accent-500)";

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser, mode: "web" | "mobile") => void;
  onForgotPassword: () => void;
}

export function LoginPage({
  onLoginSuccess,
  onForgotPassword,
}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<"web" | "mobile">("web");
  const { t } = useLanguage();

  const emailTrimmed = email.trim().toLowerCase();
  const emailValid = EMAIL_RE.test(emailTrimmed);
  const emailError =
    touched.email && !emailTrimmed
      ? t("auth.errEmailRequired")
      : touched.email && emailTrimmed && !emailValid
        ? t("auth.errEmailInvalid")
        : "";
  const passwordError =
    touched.password && !password.trim() ? t("auth.errPasswordRequired") : "";

  function clearApiError() {
    if (apiError) setApiError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setApiError("");
    if (!emailTrimmed || !password.trim() || !emailValid) return;

    setLoading(true);
    try {
      const user = await login(emailTrimmed, password.trim(), rememberMe);
      if (!user) throw new Error(t("auth.errInvalid"));
      onLoginSuccess(user, loginMode);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : t("auth.errInvalid"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h2 className="text-2xl font-semibold text-(--heading)">
          {t("auth.welcome")}
        </h2>
        <p className="mt-1 text-sm text-(--muted)">{t("auth.accessHint")}</p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
          {/* E-mail */}
          <div>
            <label className={fieldLabel} htmlFor="login-email">
              {t("auth.emailLabel")}
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)"
              />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearApiError();
                }}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                placeholder={t("auth.emailPH")}
                className={`${inputBase} pl-9 ${emailError ? "border-rose-400 focus:border-rose-400 focus:ring-rose-300/25" : ""}`}
                autoComplete="email"
                autoFocus
              />
            </div>
            <AnimatePresence>
              {emailError && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1.5 overflow-hidden text-xs text-rose-500"
                >
                  {emailError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Senha */}
          <div>
            <div className="flex items-center justify-between">
              <label className={fieldLabel} htmlFor="login-password">
                {t("auth.passwordLabel")}
              </label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="mb-1.5 text-xs font-medium text-(--accent-600) hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative">
              <Lock
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)"
              />
              <input
                id="login-password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearApiError();
                }}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                placeholder="••••••••"
                className={`${inputBase} pl-9 pr-9 ${passwordError ? "border-rose-400 focus:border-rose-400 focus:ring-rose-300/25" : ""}`}
                autoComplete="current-password"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted) transition-colors hover:text-(--text)"
                aria-label={
                  showPass ? t("auth.hidePassword") : t("auth.showPassword")
                }
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <AnimatePresence>
              {passwordError && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1.5 overflow-hidden text-xs text-rose-500"
                >
                  {passwordError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <label className="flex items-center gap-2 text-sm text-(--muted)">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-(--input-border) accent-(--accent-600)"
            />
            Manter conectado
          </label>

          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2.5 dark:border-rose-900/40 dark:bg-rose-950/40">
                  <AlertCircle size={14} className="shrink-0 text-rose-500" />
                  <span className="text-xs text-rose-600 dark:text-rose-400">
                    {apiError}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            disabled={loading}
            className="w-full justify-center"
            style={{ background: "var(--accent-600)" }}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />{" "}
                {t("auth.logging")}
              </>
            ) : (
              t("auth.login")
            )}
          </Button>
        </form>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant={loginMode === "web" ? "primary" : "secondary"}
            onClick={() => setLoginMode("web")}
            className={`w-full justify-center transition-all duration-300 ${loginMode === "web"
              ? "border-transparent text-white shadow-lg"
              : "border-(--border) text-(--text) hover:border-transparent hover:bg-[var(--accent-600)] hover:text-white"
              }`}
            style={{
              background: loginMode === "web" ? "var(--accent-600)" : undefined,
            }}
          >
            Modo web
          </Button>
          <Button
            type="button"
            variant={loginMode === "mobile" ? "primary" : "secondary"}
            onClick={() => setLoginMode("mobile")}
            className={`w-full justify-center transition-all duration-300 ${loginMode === "mobile"
              ? "border-transparent text-white shadow-lg"
              : "border-(--border) text-(--text) hover:border-transparent hover:bg-[var(--accent-600)] hover:text-white"
              }`}
            style={{
              background: loginMode === "mobile" ? "var(--accent-600)" : undefined,
            }}
          >
            Modo mobile
          </Button>
        </div>

        <p className="mt-8 text-center text-xs text-(--muted)">
          Acesso restrito a contas criadas pelo professor. Entre em contato com
          o Marcos se ainda não tem uma conta.
        </p>
      </motion.div>
    </AuthSplitLayout>
  );
}
