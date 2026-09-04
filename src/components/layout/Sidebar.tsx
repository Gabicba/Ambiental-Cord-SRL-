import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const mainNavItems: NavItem[] = [
  { path: '/', label: 'Panel de control', icon: 'ri-dashboard-line' },
  { path: '/routes', label: 'Hojas de ruta', icon: 'ri-route-line' },
  { path: '/customers', label: 'Clientes', icon: 'ri-building-line' },
  { path: '/routes/templates', label: 'Planillas', icon: 'ri-stack-line' },
  { path: '/drivers', label: 'Conductores', icon: 'ri-user-line', adminOnly: true },
  { path: '/companions', label: 'Acompañantes', icon: 'ri-user-add-line', adminOnly: true },
  { path: '/messages', label: 'Mensajería', icon: 'ri-message-3-line' },
  { path: '/fuel', label: 'Combustible', icon: 'ri-gas-station-line' },
  { path: '/trucks/maintenance', label: 'Mantenimiento', icon: 'ri-tools-line' },
  { path: '/equipment', label: 'EPP', icon: 'ri-shirt-line' },
  { path: '/gps', label: 'GPS', icon: 'ri-map-pin-line' },
  { path: '/documents', label: 'Documentos', icon: 'ri-file-list-3-line' },
  { path: '/reports', label: 'Reportes', icon: 'ri-bar-chart-box-line' },
];

const bottomNavItems: NavItem[] = [
  { path: '/settings', label: 'Configuración', icon: 'ri-settings-4-line', adminOnly: true },
];

export default function Sidebar() {
  const { isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadChat, setUnreadChat] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_role', 'driver')
        .neq('status', 'read');
      setUnreadChat(count || 0);
    };
    load();
    const channel = supabase
      .channel('sidebar-unread-chat')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => {
        load();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleSidebar = () => setCollapsed(!collapsed);
  const closeMobile = () => setMobileOpen(false);

  const visibleMainItems = mainNavItems.filter(item => !item.adminOnly || isAdmin);
  const visibleBottomItems = bottomNavItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-primary-500 text-white"
        type="button"
      >
        <i className="ri-menu-line text-xl" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-sm"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen z-50 bg-white dark:bg-background-900
          border-r border-background-200/70 dark:border-background-700
          flex flex-col transition-all duration-300
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <div className={`flex items-center gap-3 overflow-hidden transition-all ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center flex-shrink-0">
              <i className="ri-box-3-line text-white text-lg" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[15px] whitespace-nowrap text-foreground-950 dark:text-foreground-100">LogixARG</span>
              <span className="text-[10px] text-foreground-500 dark:text-foreground-600 whitespace-nowrap">Plataforma logística</span>
            </div>
          </div>
          {collapsed && (
            <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center mx-auto">
              <i className="ri-box-3-line text-white text-lg" />
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-background-100 dark:hover:bg-background-800 transition-colors text-foreground-600 dark:text-foreground-400"
            type="button"
          >
            <i className={collapsed ? 'ri-arrow-right-s-line text-sm' : 'ri-arrow-left-s-line text-sm'} />
          </button>
          <button
            onClick={closeMobile}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background-100 dark:hover:bg-background-800 text-foreground-600"
            type="button"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-0.5">
          {visibleMainItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-foreground-600 dark:text-foreground-400 hover:bg-background-100 dark:hover:bg-background-800 hover:text-foreground-900 dark:hover:text-foreground-200'
                }`
              }
            >
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <i className={`${item.icon} text-lg`} />
              </span>
              <span className={`whitespace-nowrap transition-all ${collapsed ? 'w-0 opacity-0 hidden' : 'opacity-100'}`}>
                {item.label}
              </span>
              {item.path === '/messages' && unreadChat > 0 && (
                <span className={`ml-auto min-w-[20px] h-5 px-1 rounded-full bg-primary-500 text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0 ${collapsed ? 'hidden' : ''}`}>
                  {unreadChat}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-background-200/70 dark:border-background-700 py-2 px-3 space-y-0.5">
          <NavLink
            to="/driver"
            onClick={closeMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-foreground-600 dark:text-foreground-400 hover:bg-background-100 dark:hover:bg-background-800 hover:text-foreground-900 dark:hover:text-foreground-200'
              }`
            }
          >
            <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <i className="ri-smartphone-line text-lg" />
            </span>
            <span className={`whitespace-nowrap transition-all ${collapsed ? 'w-0 opacity-0 hidden' : 'opacity-100'}`}>
              App Conductor
            </span>
          </NavLink>
          {visibleBottomItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-foreground-600 dark:text-foreground-400 hover:bg-background-100 dark:hover:bg-background-800 hover:text-foreground-900 dark:hover:text-foreground-200'
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