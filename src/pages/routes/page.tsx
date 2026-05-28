import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockRoutes, routeStatuses } from '@/mocks/routes';
import { mockTrucks } from '@/mocks/trucks';
import { mockDrivers } from '@/mocks/drivers';
import { mockCustomers } from '@/mocks/customers';
import { mockRouteVisits } from '@/mocks/route_visits';
import { getCompanionById } from '@/mocks/companions';

type FilterStatus = 'all' | 'Pending' | 'In_Progress' | 'Completed' | 'Canceled';

export default function RoutesPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');

  const routesWithStats = useMemo(() => {
    return mockRoutes.map((route) => {
      const visits = mockRouteVisits.filter((v) => v.route_id === route.id);
      const completed = visits.filter((v) => v.status === 'Visited').length;
      const total = visits.length || route.total_clients;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      const truck = mockTrucks.find((t) => t.id === route.truck_id);
      const driver = mockDrivers.find((d) => d.id === route.driver_id);
      return { ...route, visits, completed, total, progress, truck, driver };
    });
  }, []);

  const filtered = routesWithStats.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.driver?.name.toLowerCase().includes(q) ||
        r.truck?.plate.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filterButtons: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'Pending', label: 'Pendientes' },
    { key: 'In_Progress', label: 'En Progreso' },
    { key: 'Completed', label: 'Completadas' },
    { key: 'Canceled', label: 'Canceladas' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Hoja de Ruta</h1>
          <p className="text-sm text-text-secondary mt-1">
            Planificacion y seguimiento de rutas de recoleccion
          </p>
          <button
            onClick={() => navigate('/routes/templates')}
            type="button"
            className="mt-2 text-xs text-brand-primary hover:underline inline-flex items-center gap-1"
          >
            <i className="ri-stack-line" />
            Ver plantillas guardadas
          </button>
        </div>
        <button
          onClick={() => navigate('/routes/new')}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap"
        >
          <i className="ri-add-line" />
          Nueva Ruta
        </button>
      </div>

      <div className="bg-white rounded-xl border border-brand-border/60 overflow-hidden">
        <div className="p-4 border-b border-brand-border/60 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <i className="ri-search-line" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar rutas..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setFilter(btn.key)}
                type="button"
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                  filter === btn.key
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-white text-text-secondary border-brand-border hover:bg-brand-light'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border/40">
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">ID / Nombre</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Fecha</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Camion</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Conductor</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Acompañante</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Estado</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Progreso</th>
                <th className="text-right text-xs font-medium text-text-muted uppercase px-5 py-3">Litros</th>
                <th className="text-center text-xs font-medium text-text-muted uppercase px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((route) => {
                const statusConfig = routeStatuses[route.status as keyof typeof routeStatuses];
                return (
                  <tr key={route.id} className="border-b border-brand-border/30 hover:bg-brand-light/50 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{route.name}</p>
                        <p className="text-xs text-text-muted font-mono">{route.id}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{route.date}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">
                      {route.truck ? (
                        <div className="flex items-center gap-1.5">
                          <i className="ri-truck-line text-text-muted" />
                          {route.truck.plate}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary">
                      {route.driver ? route.driver.name : '-'}
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary">
                      {getCompanionById(route.companion_id)?.full_name || '-'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig?.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          route.status === 'Completed' ? 'bg-emerald-500' :
                          route.status === 'In_Progress' ? 'bg-blue-500' :
                          route.status === 'Pending' ? 'bg-amber-500' :
                          'bg-red-500'
                        }`} />
                        {statusConfig?.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {route.status !== 'Pending' && route.status !== 'Canceled' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-brand-light rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                route.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${route.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-text-muted">{route.completed}/{route.total}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-text-primary text-right">
                      {route.total_liters > 0 ? `${route.total_liters.toLocaleString()} L` : '-'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Link
                        to={`/routes/${route.id}`}
                        className="text-text-muted hover:text-brand-primary transition-colors p-1 inline-block"
                      >
                        <i className="ri-eye-line text-base" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-text-muted text-sm">No se encontraron rutas</p>
          </div>
        )}
      </div>
    </div>
  );
}