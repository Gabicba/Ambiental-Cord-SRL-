import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function TopBar() {
  const { profile, signOut } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const displayName = profile?.full_name || 'Usuario';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const roleLabel = profile?.role === 'admin' ? 'Administrador' : 'Supervisor';

  return (
    <header className="h-16 bg-white border-b border-brand-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <div className="md:hidden w-8" />
        <div className="relative w-full max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <i className="ri-search-line" />
          </span>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Buscar rutas, clientes, camiones..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          disabled
          className="relative w-10 h-10 flex items-center justify-center rounded-lg opacity-30 cursor-not-allowed"
          type="button"
          title="Notificaciones próximamente"
        >
          <i className="ri-notification-3-line text-xl text-text-secondary" />
        </button>

        <div className="relative flex items-center gap-3 pl-2 border-l border-brand-border">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 hover:bg-brand-light rounded-lg px-2 py-1 transition-colors cursor-pointer"
            type="button"
          >
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium text-text-primary">{displayName}</span>
              <span className="text-xs text-text-muted">{roleLabel}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-brand-border z-50 py-1">
              <div className="px-4 py-2 border-b border-brand-border md:hidden">
                <span className="text-sm font-medium text-text-primary">{displayName}</span>
                <p className="text-xs text-text-muted">{roleLabel}</p>
              </div>
              <button
                onClick={() => { setUserMenuOpen(false); signOut(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
                type="button"
              >
                <i className="ri-logout-box-line" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}