import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

export default function TopBar() {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchValue, setSearchValue] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const notifications = [
    { id: 1, text: 'Ruta RT-2026-001 completada al 60%', time: '15 min', type: 'info' },
    { id: 2, text: 'Camión AF 345 KL en mantenimiento', time: '1h', type: 'warning' },
    { id: 3, text: 'Nuevo cliente registrado: Distribuidora Norte', time: '2h', type: 'success' },
    { id: 4, text: 'Conductor Pedro Sanchez reportó incidencia', time: '3h', type: 'error' },
  ];

  const displayName = profile?.full_name || 'Usuario';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const roleLabel = profile?.role === 'admin' ? 'Administrador' : 'Supervisor';

  return (
    <header className="h-16 bg-white/80 dark:bg-background-900/80 backdrop-blur-md border-b border-background-200/70 dark:border-background-700 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <div className="md:hidden w-8" />
        <div className="relative w-full max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400">
            <i className="ri-search-line" />
          </span>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Buscar rutas, clientes, camiones..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-background-50 dark:bg-background-800 border border-background-200/70 dark:border-background-700 text-sm text-foreground-900 dark:text-foreground-100 placeholder:text-foreground-400 dark:placeholder:text-foreground-600 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400/30 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-background-100 dark:hover:bg-background-800 transition-colors text-foreground-600 dark:text-foreground-400"
          type="button"
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        >
          <i className={theme === 'light' ? 'ri-moon-line text-xl' : 'ri-sun-line text-xl'} />
        </button>

        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-background-100 dark:hover:bg-background-800 transition-colors text-foreground-600 dark:text-foreground-400"
          type="button"
        >
          <i className="ri-notification-3-line text-xl" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full" />
        </button>

        {notificationsOpen && (
          <div className="fixed right-4 top-16 w-80 bg-white dark:bg-background-900 rounded-xl shadow-lg border border-background-200/70 dark:border-background-700 z-50 py-2">
            <div className="px-4 py-2 border-b border-background-200/70 dark:border-background-700">
              <span className="text-sm font-semibold text-foreground-900 dark:text-foreground-100">Notificaciones</span>
            </div>
            {notifications.map((n) => (
              <div key={n.id} className="px-4 py-3 hover:bg-background-50 dark:hover:bg-background-800 cursor-pointer border-b border-background-200/50 dark:border-background-700/50 last:border-0">
                <p className="text-sm text-foreground-900 dark:text-foreground-100">{n.text}</p>
                <p className="text-xs text-foreground-500 dark:text-foreground-600 mt-1">{n.time}</p>
              </div>
            ))}
          </div>
        )}

        <div className="relative flex items-center gap-3 pl-2 border-l border-background-200/70 dark:border-background-700">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 hover:bg-background-100 dark:hover:bg-background-800 rounded-xl px-2 py-1.5 transition-colors cursor-pointer"
            type="button"
          >
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium text-foreground-900 dark:text-foreground-100">{displayName}</span>
              <span className="text-xs text-foreground-500 dark:text-foreground-600">{roleLabel}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-background-900 rounded-xl shadow-lg border border-background-200/70 dark:border-background-700 z-50 py-1">
              <div className="px-4 py-2 border-b border-background-200/70 dark:border-background-700 md:hidden">
                <span className="text-sm font-medium text-foreground-900 dark:text-foreground-100">{displayName}</span>
                <p className="text-xs text-foreground-500 dark:text-foreground-600">{roleLabel}</p>
              </div>
              <button
                onClick={() => { setUserMenuOpen(false); signOut(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error-500 hover:bg-error-500/10 transition-colors cursor-pointer whitespace-nowrap"
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