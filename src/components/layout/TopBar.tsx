import { useState } from 'react';

export default function TopBar() {
  const [searchValue, setSearchValue] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = [
    { id: 1, text: 'Ruta RT-2026-001 completada al 60%', time: '15 min', type: 'info' },
    { id: 2, text: 'Camion AF 345 KL en mantenimiento', time: '1h', type: 'warning' },
    { id: 3, text: 'Nuevo cliente registrado: Cerveceria Artesanal', time: '2h', type: 'success' },
    { id: 4, text: 'Conductor Pedro Sanchez reporto incidencia', time: '3h', type: 'error' },
  ];

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
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-brand-light transition-colors"
          type="button"
        >
          <i className="ri-notification-3-line text-xl text-text-secondary" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {notificationsOpen && (
          <div className="absolute right-4 top-16 w-80 bg-white rounded-xl shadow-lg border border-brand-border z-50 py-2">
            <div className="px-4 py-2 border-b border-brand-border">
              <span className="text-sm font-semibold text-text-primary">Notificaciones</span>
            </div>
            {notifications.map((n) => (
              <div key={n.id} className="px-4 py-3 hover:bg-brand-light cursor-pointer border-b border-brand-border/50 last:border-0">
                <p className="text-sm text-text-primary">{n.text}</p>
                <p className="text-xs text-text-muted mt-1">{n.time}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 pl-2 border-l border-brand-border">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-text-primary">Admin</span>
            <span className="text-xs text-text-muted">Supervisor</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center text-white text-sm font-bold">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}