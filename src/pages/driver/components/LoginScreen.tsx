import { useState } from 'react';

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = () => {
    if (username.trim() && password.trim()) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-primary flex items-center justify-center mx-auto mb-4">
            <i className="ri-leaf-line text-3xl text-white" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">LogixARG</h1>
          <p className="text-sm text-text-muted mt-1">App del Conductor</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text-secondary">Usuario</label>
            <input
              type="text"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-brand-light border border-brand-border text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-brand-light border border-brand-border text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
            <p className="text-xs font-semibold text-amber-700">Credenciales de prueba:</p>
            <p className="text-xs text-amber-700 font-mono">Usuario: conductor</p>
            <p className="text-xs text-amber-700 font-mono">Contraseña: 1234</p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-brand-border text-brand-green focus:ring-brand-green/30"
            />
            <span className="text-sm text-text-secondary">Recordarme</span>
          </label>

          <button
            onClick={handleSubmit}
            type="button"
            className="w-full py-3 bg-brand-green text-white rounded-xl text-base font-semibold hover:bg-brand-green/90 transition-colors whitespace-nowrap"
          >
            Ingresar
          </button>

          <p className="text-xs text-text-muted text-center">
            Opcional futuro: biometria · PIN · huella
          </p>
        </div>
      </div>
    </div>
  );
}