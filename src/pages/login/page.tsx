import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;

export default function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError);
      setSubmitting(false);
    } else {
      navigate('/');
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName.trim()) {
      setError('El nombre completo es obligatorio.');
      return;
    }

    if (!email.trim()) {
      setError('El email es obligatorio.');
      return;
    }

    if (!password.trim()) {
      setError('La contraseña es obligatoria.');
      return;
    }

    setSubmitting(true);

    // Si la contraseña es corta, usamos la Edge Function para bypass
    if (password.length < 6) {
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/create-admin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, fullName: fullName.trim() }),
        });

        const result = await response.json();

        if (!response.ok || result.error) {
          setError(result.error || 'Error al crear usuario');
          setSubmitting(false);
          return;
        }

        // Login automático con el session devuelto
        if (result.session) {
          await supabase.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
          });
          navigate('/');
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error de red');
        setSubmitting(false);
        return;
      }
    } else {
      // Registro normal con Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: fullName.trim() },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setSubmitting(false);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: email,
          full_name: fullName.trim(),
          role: 'admin',
        });

        if (profileError) {
          setError('Cuenta creada pero falló el perfil: ' + profileError.message);
          setSubmitting(false);
          return;
        }

        setSuccess('Cuenta creada. Ya podés iniciar sesión.');
        setMode('login');
        setPassword('');
        setFullName('');
      }
    }

    setSubmitting(false);
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
    setSuccess(null);
    setEmail('');
    setPassword('');
    setFullName('');
  };

  const handleSubmit = mode === 'login' ? handleLogin : handleRegister;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8 border border-background-200/70">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-5">
              <i className="ri-leaf-line text-background-50 text-2xl" />
            </div>
            <h1 className="text-xl font-bold text-foreground-950">Ambiental Cord</h1>
            <p className="text-sm text-foreground-600 mt-1">UCO Logistics Platform</p>
          </div>

          <div className="flex bg-background-100 rounded-full p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-foreground-950'
                  : 'text-foreground-600 hover:text-foreground-800'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-foreground-950'
                  : 'text-foreground-600 hover:text-foreground-800'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-foreground-950 mb-1.5">
                  Nombre Completo
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Admin AmbientalCord"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-background-200/70 bg-background-50 text-sm text-foreground-950 placeholder:text-foreground-500 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400/30 transition-all"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground-950 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ambientalcord.com"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-background-200/70 bg-background-50 text-sm text-foreground-950 placeholder:text-foreground-500 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400/30 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground-950 mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-background-200/70 bg-background-50 text-sm text-foreground-950 placeholder:text-foreground-500 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400/30 transition-all"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
                <i className="ri-error-warning-line flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-2">
                <i className="ri-checkbox-circle-line flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg bg-primary-500 text-background-50 text-sm font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-background-50/30 border-t-background-50 rounded-full animate-spin" />
                  <span>{mode === 'login' ? 'Ingresando...' : 'Creando cuenta...'}</span>
                </>
              ) : (
                <>
                  <i className={mode === 'login' ? 'ri-login-box-line' : 'ri-user-add-line'} />
                  <span>{mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-foreground-500 mt-6">
            {mode === 'login' ? (
              <>
                ¿No tenés cuenta?{' '}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                >
                  Registrate acá
                </button>
              </>
            ) : (
              <>
                ¿Ya tenés cuenta?{' '}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                >
                  Iniciá sesión
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}