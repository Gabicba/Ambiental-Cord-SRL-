import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileContainer from "@/components/base/MobileContainer";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, driver, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    if (loginSuccess && driver) {
      navigate("/resumen");
    }
  }, [loginSuccess, driver, navigate]);

  useEffect(() => {
    if (loginSuccess && authError) {
      setError(authError);
      setLoginSuccess(false);
    }
  }, [loginSuccess, authError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Ingresá tu email");
      return;
    }
    if (!password.trim()) {
      setError("Ingresá tu contraseña");
      return;
    }

    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Error al iniciar sesión");
      return;
    }

    setLoginSuccess(true);
  };

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen bg-background-50">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-[340px] mx-auto">
            <div className="flex flex-col items-center mb-10">
              <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mb-4">
                <i className="ri-truck-line text-4xl text-background-50"></i>
              </div>
              <h1 className="text-2xl font-heading font-bold text-foreground-900">
                App Conductores
              </h1>
              <p className="text-sm text-foreground-500 mt-1">
                Gestión de Visitas
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 flex items-start gap-3">
                <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="ri-error-warning-line text-red-600 text-sm"></i>
                </div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="ri-mail-line text-foreground-400 text-lg"></i>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos.rodriguez@empresa.com"
                    className="w-full pl-10 pr-4 py-3 bg-background-50 border border-secondary-300 rounded-xl text-sm text-foreground-900 placeholder:text-foreground-300 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="ri-lock-line text-foreground-400 text-lg"></i>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-background-50 border border-secondary-300 rounded-xl text-sm text-foreground-900 placeholder:text-foreground-300 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  >
                    <i className={`${showPassword ? "ri-eye-off-line" : "ri-eye-line"} text-foreground-400 text-lg`}></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary-500 text-background-50 font-semibold text-base rounded-xl hover:bg-primary-600 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-background-50/30 border-t-background-50 rounded-full animate-spin"></div>
                    Ingresando...
                  </>
                ) : (
                  "INICIAR SESIÓN"
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="pb-8 text-center">
          <p className="text-xs text-foreground-400">
            v1.0 · App Conductores
          </p>
        </div>
      </div>
    </MobileContainer>
  );
}