import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
  disabled?: boolean;
}

const mainNavItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: 'ri-dashboard-line' },
  { path: '/routes', label: 'Hoja de Ruta', icon: 'ri-route-line' },
  { path: '/routes/templates', label: 'Plantillas', icon: 'ri-stack-line' },
  { path: '/customers', label: 'Clientes', icon: 'ri-building-line' },
  { path: '/trucks', label: 'Camiones', icon: 'ri-truck-line', adminOnly: true },
  { path: '/trucks/maintenance', label: 'Mantenimiento', icon: 'ri-tools-line', disabled: true },
  { path: '/drivers', label: 'Conductores', icon: 'ri-user-line', adminOnly: true },
  { path: '/companions', label: 'Acompañantes', icon: 'ri-user-add-line', adminOnly: true },
  { path: '/equipment', label: 'Equipamiento', icon: 'ri-shirt-line', disabled: true },
  { path: '/gps', label: 'GPS Tracking', icon: 'ri-map-pin-line' },
  { path: '/reports', label: 'Reportes', icon: 'ri-bar-chart-box-line', disabled: true },
  { path: '/documents', label: 'Documentos', icon: 'ri-file-list-3-line', disabled: true },
];

const bottomNavItems: NavItem[] = [
  { path: '/settings', label: 'Configuracion', icon: 'ri-settings-4-line', adminOnly: true },
];

export default function Sidebar() {
  const { isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);
  const closeMobile = () => setMobileOpen(false);

  const visibleMainItems = mainNavItems.filter(item => !item.adminOnly || isAdmin);
  const visibleBottomItems = bottomNavItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-brand-primary text-white"
        type="button"
      >
        <i className="ri-menu-line text-xl" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen z-50 bg-brand-primary text-white flex flex-col transition-all duration-300
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className={`flex items-center gap-3 overflow-hidden transition-all ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center flex-shrink-0">
              <i className="ri-leaf-line text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm whitespace-nowrap">Ambiental Cord</span>
              <span className="text-[10px] text-white/60 whitespace-nowrap">UCO Logistics</span>
            </div>
          </div>
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center mx-auto">
              <i className="ri-leaf-line text-white" />
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex w-7 h-7 items-center justify-center rounded-md hover:bg-white/10 transition-colors"
            type="button"
          >
            <i className={collapsed ? 'ri-arrow-right-s-line text-sm' : 'ri-arrow-left-s-line text-sm'} />
          </button>
          <button
            onClick={closeMobile}
            className="md:hidden w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10"
            type="button"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {visibleMainItems.map((item) => (
            item.disabled ? (
              <div
                key={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/30 cursor-not-allowed select-none"
              >
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <i className={`${item.icon} text-lg`} />
                </span>
                <span className={`whitespace-nowrap transition-all flex items-center gap-2 ${collapsed ? 'w-0 opacity-0 hidden' : 'opacity-100'}`}>
                  {item.label}
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-white/10 text-white/40">
                    Próximo
                  </span>
                </span>
              </div>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-brand-green text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <i className={`${item.icon} text-lg`} />
                </span>
                <span className={`whitespace-nowrap transition-all ${collapsed ? 'w-0 opacity-0 hidden' : 'opacity-100'}`}>
                  {item.label}
                </span>
              </NavLink>
            )
          ))}
        </nav>

        <div className="border-t border-white/10 py-3 px-3 space-y-1">
          {visibleBottomItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-brand-green text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <i className={`${item.icon} text-lg`} />
              </span>
              <span className={`whitespace-nowrap transition-all ${collapsed ? 'w-0 opacity-0 hidden' : 'opacity-100'}`}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
}