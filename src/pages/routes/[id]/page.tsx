import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mockRoutes, routeStatuses } from '@/mocks/routes';
import { mockTrucks } from '@/mocks/trucks';
import { mockDrivers } from '@/mocks/drivers';
import { mockRouteVisits, visitStatusConfig } from '@/mocks/route_visits';
import { getCompanionById } from '@/mocks/companions';

export default function RouteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [routeState, setRouteState] = useState<string | null>(null);

  const route = mockRoutes.find((r) => r.id === id);
  const truck = mockTrucks.find((t) => t.id === route?.truck_id);
  const driver = mockDrivers.find((d) => d.id === route?.driver_id);
  const visits = mockRouteVisits.filter((v) => v.route_id === id);

  const currentStatus = routeState || route?.status || 'Pending';

  const completedCount = visits.filter((v) => v.status === 'Visited').length;
  const totalCount = visits.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalLiters = visits.reduce((sum, v) => sum + v.liters_collected, 0);
  const totalPayments = visits.reduce((sum, v) => sum + v.payment_amount, 0);

  const statusConfig = routeStatuses[currentStatus as keyof typeof routeStatuses];

  const mapSrc = useMemo(() => {
    if (visits.length === 0) {
      return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d210146.68100188583!2d-58.5733832!3d-34.6157432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcca3b4ef90b07%3A0x948c7b6a0bfc6!2sBuenos%20Aires%2C%20CABA!5e0!3m2!1ses!2sar!4v1700000000000!5m2!1ses!2sar';
    }
    const origin = visits[0];
    const waypoints = visits.slice(1, -1).map((v) => `${v.lat},${v.lng}`).join('%7C');
    const destination = visits[visits.length - 1];
    return `https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d210146.7!2d-58.5734!3d-34.6157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s${origin.lat}%2C${origin.lng}!2s${origin.address}!3m2!1d${origin.lat}!2d${origin.lng}!4m5!1s${destination.lat}%2C${destination.lng}!2s${destination.address}!3m2!1d${destination.lat}!2d${destination.lng}!5e0!3m2!1ses!2sar`;
  }, [visits]);

  if (!route) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-4">
          <i className="ri-route-line text-3xl text-brand-primary" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary">Ruta no encontrada</h2>
        <p className="text-sm text-text-secondary mt-1 mb-4">La ruta que buscas no existe en el sistema</p>
        <Link
          to="/routes"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors"
        >
          <i className="ri-arrow-left-line" />
          Volver a rutas
        </Link>
      </div>
    );
  }

  const statusButtons = [
    { status: 'Pending', label: 'Pendiente', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { status: 'In_Progress', label: 'Iniciar Ruta', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { status: 'Completed', label: 'Completar', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { status: 'Canceled', label: 'Cancelar', color: 'bg-red-100 text-red-700 border-red-200' },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <button
            onClick={() => navigate('/routes')}
            type="button"
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-brand-primary transition-colors mb-2"
          >
            <i className="ri-arrow-left-line" />
            Volver a rutas
          </button>
          <h1 className="text-2xl font-bold text-text-primary">{route.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-text-muted font-mono">{route.id}</span>
            <span className="text-xs text-text-muted">{route.date}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig?.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                currentStatus === 'Completed' ? 'bg-emerald-500' :
                currentStatus === 'In_Progress' ? 'bg-blue-500' :
                currentStatus === 'Pending' ? 'bg-amber-500' :
                'bg-red-500'
              }`} />
              {statusConfig?.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {statusButtons.map((btn) => (
            <button
              key={btn.status}
              onClick={() => setRouteState(btn.status)}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                currentStatus === btn.status ? btn.color + ' ring-2 ring-offset-1 ring-brand-green/30' : 'bg-white text-text-secondary border-brand-border hover:bg-brand-light'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-brand-border/60">
          <p className="text-xs text-text-muted uppercase">Clientes</p>
          <p className="text-xl font-bold text-text-primary mt-1">{completedCount}/{totalCount}</p>
          <div className="mt-2 h-1.5 bg-brand-light rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-green rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60">
          <p className="text-xs text-text-muted uppercase">Litros</p>
          <p className="text-xl font-bold text-text-primary mt-1">{totalLiters.toLocaleString()} <span className="text-sm font-normal text-text-muted">L</span></p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60">
          <p className="text-xs text-text-muted uppercase">Pagos</p>
          <p className="text-xl font-bold text-text-primary mt-1">${totalPayments.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60">
          <p className="text-xs text-text-muted uppercase">Camion</p>
          <p className="text-lg font-bold text-text-primary mt-1">{truck?.plate || '-'}</p>
          <p className="text-xs text-text-muted">{driver?.name || '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-brand-border/60 overflow-hidden">
          <div className="p-4 border-b border-brand-border/60 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Recorrido</h3>
            <span className="text-xs text-text-muted">{visits.length} puntos de parada</span>
          </div>
          <div className="h-[420px] w-full">
            <iframe
              title="Route Map"
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Route Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-brand-border/60">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Informacion</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                  <i className="ri-truck-line text-brand-primary" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Camion</p>
                  <p className="text-sm font-medium text-text-primary">{truck?.plate || '-'}</p>
                  <p className="text-xs text-text-muted">{truck?.model || ''}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-green/10 flex items-center justify-center flex-shrink-0">
                  <i className="ri-user-line text-brand-green" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Conductor</p>
                  <p className="text-sm font-medium text-text-primary">{driver?.name || '-'}</p>
                  <p className="text-xs text-text-muted">DNI {driver?.dni || ''}</p>
                </div>
              </div>
              {route?.companion_id && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <i className="ri-user-add-line text-sky-600" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Acompañante</p>
                    <p className="text-sm font-medium text-text-primary">{getCompanionById(route.companion_id)?.full_name || '-'}</p>
                    <p className="text-xs text-text-muted">DNI {getCompanionById(route.companion_id)?.dni || ''}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <i className="ri-calendar-line text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Fecha Programada</p>
                  <p className="text-sm font-medium text-text-primary">{route.date}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <i className="ri-map-pin-line text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">GPS Device</p>
                  <p className="text-sm font-medium text-text-primary">{truck?.gps_device_id || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-5 border border-brand-border/60">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Resumen de Visitas</h3>
            <div className="space-y-2">
              {Object.entries(visitStatusConfig).map(([key, config]) => {
                const count = visits.filter((v) => v.status === key).length;
                if (count === 0) return null;
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                      <span className="text-sm text-text-secondary">{config.label}</span>
                    </div>
                    <span className="text-sm font-medium text-text-primary">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Visits List */}
      <div className="bg-white rounded-xl border border-brand-border/60 overflow-hidden">
        <div className="p-5 border-b border-brand-border/60 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Visitas</h3>
          <span className="text-xs text-text-muted">Orden de recorrido</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border/40">
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3 w-12">#</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Cliente</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Direccion</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Horario</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Estado</th>
                <th className="text-right text-xs font-medium text-text-muted uppercase px-5 py-3">Litros</th>
                <th className="text-right text-xs font-medium text-text-muted uppercase px-5 py-3">Pago</th>
                <th className="text-center text-xs font-medium text-text-muted uppercase px-5 py-3">Fotos</th>
              </tr>
            </thead>
            <tbody>
              {visits
                .sort((a, b) => a.visit_order - b.visit_order)
                .map((visit) => {
                  const vConfig = visitStatusConfig[visit.status];
                  return (
                    <tr key={visit.id} className="border-b border-brand-border/30 hover:bg-brand-light/50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="w-7 h-7 rounded-full bg-brand-primary/10 flex items-center justify-center text-xs font-bold text-brand-primary">
                          {visit.visit_order}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-text-primary">{visit.customer_name}</p>
                        <p className="text-xs text-text-muted">{visit.receiver_name || 'Sin receptor'}</p>
                      </td>
                      <td className="px-5 py-3 text-sm text-text-secondary max-w-[200px] truncate">
                        {visit.address}
                      </td>
                      <td className="px-5 py-3 text-sm text-text-secondary">{visit.estimated_time}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${vConfig?.color || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${vConfig?.dot || 'bg-gray-400'}`} />
                          {vConfig?.label || visit.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-text-primary text-right">
                        {visit.liters_collected > 0 ? `${visit.liters_collected} L` : '-'}
                      </td>
                      <td className="px-5 py-3 text-sm text-text-secondary text-right">
                        {visit.payment_amount > 0 ? `$${visit.payment_amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {visit.photos.length > 0 ? (
                          <div className="flex items-center justify-center gap-1">
                            <i className="ri-camera-line text-brand-green" />
                            <span className="text-xs text-text-muted">{visit.photos.length}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {visits.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-text-muted text-sm">No hay visitas registradas para esta ruta</p>
          </div>
        )}
      </div>
    </div>
  );
}