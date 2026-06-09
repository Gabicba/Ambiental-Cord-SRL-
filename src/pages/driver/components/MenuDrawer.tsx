import type { DriverScreen } from '../types';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: DriverScreen) => void;
  onLogout: () => void;
}

export default function MenuDrawer({ isOpen, onClose, onNavigate, onLogout }: MenuDrawerProps) {
  if (!isOpen) return null;

  const items: { screen: DriverScreen; label: string; icon: string }[] = [
    { screen: 'home', label: 'Inicio', icon: 'ri-home-line' },
    { screen: 'route', label: 'Hoja de ruta', icon: 'ri-map-pin-line' },
    { screen: 'history', label: 'Historial del día', icon: 'ri-history-line' },
    { screen: 'profile', label: 'Perfil', icon: 'ri-user-line' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-64 h-full shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
        <div className="p-4 border-b border-brand-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center">
              <i className="ri-leaf-line text-xl text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Ambiental Cord</p>
              <p className="text-xs text-text-muted">App del Conductor</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {items.map((item) => (
            <button
              key={item.screen}
              onClick={() => { onNavigate(item.screen); onClose(); }}
              type="button"
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-text-primary hover:bg-brand-light transition-colors text-left"
            >
              <i className={`${item.icon} text-lg text-text-muted`} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-brand-border">
          <button
            onClick={onLogout}
            type="button"
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <i className="ri-logout-box-r-line text-lg" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}