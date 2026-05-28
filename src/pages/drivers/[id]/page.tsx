import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockDrivers, driverStatuses } from '@/mocks/drivers';
import { mockTrucks } from '@/mocks/trucks';
import { loadEquipment, getEquipmentStatus, equipmentLabels, equipmentIcons } from '@/mocks/equipment';

const tabs = [
  { id: 'general', label: 'General' },
  { id: 'performance', label: 'Rendimiento' },
  { id: 'routes', label: 'Historial de Rutas' },
  { id: 'license', label: 'Licencia' },
  { id: 'equipment', label: 'Equipamiento' },
  { id: 'evidence', label: 'Evidencia' },
];

const routeStatuses: Record<string, { label: string; color: string; dot: string }> = {
  Completed: { label: 'Completada', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  In_Progress: { label: 'En Progreso', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  Pending: { label: 'Pendiente', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  Canceled: { label: 'Cancelada', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
};

function getLicenseStatus(expiryDate: string): { status: string; color: string; label: string } {
  const d = new Date(expiryDate);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const months = diff / (1000 * 60 * 60 * 24 * 30);
  if (months < 0) return { status: 'expired', color: 'bg-red-100 text-red-700 border-red-200', label: 'Vencida' };
  if (months < 3) return { status: 'near', color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Proxima a vencer' };
  return { status: 'active', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Vigente' };
}

export default function DriverDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');

  const driver = mockDrivers.find((d) => d.id === id);
  const assignedTruck = driver?.assigned_truck_id
    ? mockTrucks.find((t) => t.id === driver.assigned_truck_id)
    : null;

  const driverEquipment = loadEquipment().filter((e) => e.employee_id === id);

  if (!driver) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/drivers')}
          className="text-sm text-text-secondary hover:text-brand-primary transition-colors"
        >
          ← Volver a Conductores
        </button>
        <div className="bg-white rounded-xl p-8 text-center border border-brand-border/60">
          <i className="ri-user-line text-5xl text-text-muted mb-4" />
          <h2 className="text-xl font-semibold text-text-primary">Conductor no encontrado</h2>
          <p className="text-sm text-text-secondary mt-2">El conductor solicitado no existe.</p>
        </div>
      </div>
    );
  }

  const statusConfig = driverStatuses[driver.status as keyof typeof driverStatuses];
  const licenseStatus = getLicenseStatus(driver.license_expiry);
  const lastSixRoutes = driver.route_history.slice(0, 6);
  const weeklyLiters = [4200, 3800, 5100, 3400, 4600, 3900, 5200];
  const weekLabels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7'];
  const maxWeekly = Math.max(...weeklyLiters);

  const photos = [
    { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop', caption: 'Colecta - El Boliche', date: '21/05 10:23' },
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=200&fit=crop', caption: 'Contenedor - La Masa', date: '21/05 10:47' },
    { url: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=300&h=200&fit=crop', caption: 'Deposito - Don Juan', date: '19/05 11:15' },
    { url: 'https://images.unsplash.com/photo-1582562124811-c8ed1b31bc3f?w=300&h=200&fit=crop', caption: 'Tanque - Restaurante Sur', date: '19/05 11:42' },
    { url: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=300&h=200&fit=crop', caption: 'Colecta - Bar Norte', date: '16/05 09:30' },
    { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop', caption: 'Comprobante - Hotel Continental', date: '16/05 10:05' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-brand-primary/10 flex items-center justify-center text-2xl font-bold text-brand-primary flex-shrink-0">
            {driver.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <button
              type="button"
              onClick={() => navigate('/drivers')}
              className="text-xs text-text-secondary hover:text-brand-primary transition-colors mb-1"
            >
              ← Volver a Conductores
            </button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-text-primary">{driver.name}</h1>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig?.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${driver.status === 'Active' ? 'bg-emerald-500' : driver.status === 'On_Route' ? 'bg-blue-500' : 'bg-gray-500'}`} />
                {statusConfig?.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
              <span>DNI: {driver.dni}</span>
              <span>·</span>
              <span>Licencia: {driver.license_type}</span>
              <span>·</span>
              <span>Desde: {driver.joined_at}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-3 py-2 border border-brand-border rounded-lg text-sm font-medium text-text-secondary hover:border-brand-green hover:text-brand-green transition-colors whitespace-nowrap"
        >
          <i className="ri-edit-line" />
          Editar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl p-4 border border-brand-border/60">
          <div className="flex items-center gap-2 mb-1">
            <i className="ri-route-line text-brand-green text-lg" />
            <p className="text-xs text-text-muted">Rutas Completadas</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{driver.routes_completed}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60">
          <div className="flex items-center gap-2 mb-1">
            <i className="ri-drop-line text-brand-primary text-lg" />
            <p className="text-xs text-text-muted">Litros Totales</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{driver.total_liters.toLocaleString()} L</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60">
          <div className="flex items-center gap-2 mb-1">
            <i className="ri-coins-line text-brand-primary text-lg" />
            <p className="text-xs text-text-muted">Pagos Recaudados</p>
          </div>
          <p className="text-xl font-bold text-text-primary">${driver.total_payments.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60">
          <div className="flex items-center gap-2 mb-1">
            <i className="ri-camera-line text-brand-primary text-lg" />
            <p className="text-xs text-text-muted">Evidencias</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{driver.evidence_photos.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60">
          <div className="flex items-center gap-2 mb-1">
            <i className="ri-star-fill text-amber-500 text-lg" />
            <p className="text-xs text-text-muted">Calificacion</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{driver.rating} <span className="text-sm font-normal text-text-muted">/ 5</span></p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-brand-border/60">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative ${
                activeTab === tab.id ? 'text-brand-green' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-brand-border/60 p-5">
        {activeTab === 'general' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Informacion personal */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-text-primary">Informacion Personal</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-text-muted">Nombre Completo</p>
                    <p className="text-sm font-medium text-text-primary">{driver.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">DNI</p>
                    <p className="text-sm font-medium text-text-primary">{driver.dni}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Fecha de Nacimiento</p>
                    <p className="text-sm font-medium text-text-primary">{driver.birth_date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Telefono</p>
                    <p className="text-sm font-medium text-text-primary">{driver.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Email</p>
                    <p className="text-sm font-medium text-text-primary">{driver.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Direccion</p>
                    <p className="text-sm font-medium text-text-primary">{driver.address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Fecha de Ingreso</p>
                    <p className="text-sm font-medium text-text-primary">{driver.joined_at}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Antiguedad</p>
                    <p className="text-sm font-medium text-text-primary">
                      {Math.floor((new Date().getTime() - new Date(driver.joined_at).getTime()) / (1000 * 60 * 60 * 24 * 365))} años
                    </p>
                  </div>
                </div>
              </div>

              {/* Contacto de emergencia + Camion */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-text-primary">Contacto de Emergencia</h3>
                <div className="p-3 bg-brand-light rounded-lg border border-brand-border/40">
                  <p className="text-sm font-medium text-text-primary">{driver.emergency_contact.name}</p>
                  <p className="text-xs text-text-muted">{driver.emergency_contact.relation} · {driver.emergency_contact.phone}</p>
                </div>

                <h3 className="text-base font-semibold text-text-primary pt-2">Camion Asignado</h3>
                {assignedTruck ? (
                  <div className="flex items-center gap-3 p-3 bg-brand-light rounded-lg border border-brand-border/40">
                    <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                      <i className="ri-truck-line text-brand-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary">{assignedTruck.plate}</p>
                      <p className="text-xs text-text-muted">{assignedTruck.model}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/trucks/${assignedTruck.id}`)}
                      className="text-brand-green text-xs font-medium hover:underline"
                    >
                      Ver Camion →
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <i className="ri-truck-line text-xl text-text-muted" />
                    <p className="text-sm text-text-secondary">Sin camion asignado</p>
                  </div>
                )}

                {driver.notes && (
                  <div className="pt-2">
                    <h3 className="text-base font-semibold text-text-primary mb-2">Observaciones</h3>
                    <p className="text-sm text-text-secondary">{driver.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-text-primary">Rendimiento Semanal (Litros)</h3>
            <div className="flex items-end gap-2 h-48 px-2">
              {weeklyLiters.map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs text-text-muted mb-1">{val.toLocaleString()} L</div>
                  <div
                    className="w-full rounded-t-md bg-brand-green/80 hover:bg-brand-green transition-colors"
                    style={{ height: `${(val / maxWeekly) * 160}px` }}
                  />
                  <div className="text-xs text-text-muted">{weekLabels[idx]}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-brand-border/40">
              <div className="p-4 bg-brand-light rounded-xl border border-brand-border/40">
                <p className="text-xs text-text-muted">Promedio por Ruta</p>
                <p className="text-lg font-bold text-text-primary">{driver.avg_liters_per_route} L</p>
              </div>
              <div className="p-4 bg-brand-light rounded-xl border border-brand-border/40">
                <p className="text-xs text-text-muted">Promedio Visitas/Ruta</p>
                <p className="text-lg font-bold text-text-primary">{driver.avg_visits_per_route}</p>
              </div>
              <div className="p-4 bg-brand-light rounded-xl border border-brand-border/40">
                <p className="text-xs text-text-muted">Promedio Pago/Ruta</p>
                <p className="text-lg font-bold text-text-primary">
                  ${driver.routes_completed > 0 ? Math.round(driver.total_payments / driver.routes_completed).toLocaleString('es-AR') : 0}
                </p>
              </div>
              <div className="p-4 bg-brand-light rounded-xl border border-brand-border/40">
                <p className="text-xs text-text-muted">Incidentes</p>
                <p className="text-lg font-bold text-text-primary">{driver.incidents}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'routes' && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-text-primary">Ultimas Rutas</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-border/40">
                    <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">ID Ruta</th>
                    <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Fecha</th>
                    <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Camion</th>
                    <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Zona</th>
                    <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Estado</th>
                    <th className="text-right text-xs font-medium text-text-muted uppercase px-4 py-3">Visitas</th>
                    <th className="text-right text-xs font-medium text-text-muted uppercase px-4 py-3">Litros</th>
                    <th className="text-center text-xs font-medium text-text-muted uppercase px-4 py-3">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {lastSixRoutes.map((route) => {
                    const rs = routeStatuses[route.status];
                    return (
                      <tr key={route.id} className="border-b border-brand-border/30 hover:bg-brand-light/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-text-primary">{route.id}</td>
                        <td className="px-4 py-3 text-sm text-text-secondary">{route.date}</td>
                        <td className="px-4 py-3 text-sm text-text-secondary">{route.truck_plate}</td>
                        <td className="px-4 py-3 text-sm text-text-secondary">{route.zone}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${rs?.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${rs?.dot}`} />
                            {rs?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-text-primary text-right">{route.visits_count}</td>
                        <td className="px-4 py-3 text-sm font-medium text-text-primary text-right">
                          {route.total_liters > 0 ? `${route.total_liters.toLocaleString()} L` : '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => navigate(`/routes/${route.id}`)}
                            className="text-text-muted hover:text-brand-primary transition-colors"
                          >
                            <i className="ri-eye-line" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {driver.route_history.length > 6 && (
              <p className="text-xs text-text-muted text-center">
                Mostrando ultimas 6 de {driver.route_history.length} rutas
              </p>
            )}
          </div>
        )}

        {activeTab === 'license' && (
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-text-primary">Informacion de Licencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div className="p-4 bg-brand-light rounded-xl border border-brand-border/40">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-text-primary">Licencia de Conducir</p>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${licenseStatus.color}`}>
                      {licenseStatus.label}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <p className="text-xs text-text-muted">Numero</p>
                      <p className="text-sm font-medium text-text-primary">{driver.license_number}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-xs text-text-muted">Categoria</p>
                      <p className="text-sm font-medium text-text-primary">{driver.license_type}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-xs text-text-muted">Fecha de Emision</p>
                      <p className="text-sm font-medium text-text-primary">{driver.license_issue_date}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-xs text-text-muted">Fecha de Vencimiento</p>
                      <p className="text-sm font-medium text-text-primary">{driver.license_expiry}</p>
                    </div>
                  </div>
                </div>

                {licenseStatus.status === 'near' && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
                    <i className="ri-alert-line text-amber-600 text-lg mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Licencia proxima a vencer</p>
                      <p className="text-xs text-amber-700 mt-1">La licencia vence el {driver.license_expiry}. Se recomienda iniciar tramite de renovacion.</p>
                    </div>
                  </div>
                )}

                {licenseStatus.status === 'expired' && (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200 flex items-start gap-3">
                    <i className="ri-close-circle-line text-red-600 text-lg mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Licencia vencida</p>
                      <p className="text-xs text-red-700 mt-1">La licencia vencio el {driver.license_expiry}. El conductor NO puede operar hasta renovar.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-text-primary">Historial de Renovaciones</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border border-brand-border/40 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Renovacion {driver.license_type}</p>
                      <p className="text-xs text-text-muted">{driver.license_issue_date}</p>
                    </div>
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">Vigente</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-brand-border/40 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Renovacion {driver.license_type}</p>
                      <p className="text-xs text-text-muted">Anterior</p>
                    </div>
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border bg-gray-50 text-gray-700 border-gray-200">Expirada</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-text-primary">Equipamiento Asignado</h3>
              <span className="text-xs text-text-muted">{driverEquipment.length} artículos</span>
            </div>
            {driverEquipment.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-3">
                  <i className="ri-shirt-line text-2xl text-text-muted" />
                </div>
                <p className="text-sm text-text-secondary">Sin equipamiento registrado</p>
                <p className="text-xs text-text-muted mt-1">Asigna uniformes y equipos desde la página de Equipamiento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {driverEquipment.map((eq) => {
                  const status = getEquipmentStatus(eq.replacement_date);
                  return (
                    <div key={eq.id} className="flex items-start gap-4 p-4 border border-brand-border/40 rounded-xl hover:bg-brand-light/30 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary flex-shrink-0">
                        <i className={`${equipmentIcons[eq.item_type]} text-lg`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-text-primary">{equipmentLabels[eq.item_type]}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-text-muted mt-1 flex-wrap">
                          <span>Talle: <strong className="text-text-secondary">{eq.size}</strong></span>
                          <span>·</span>
                          <span>Cantidad: <strong className="text-text-secondary">{eq.quantity}</strong></span>
                          <span>·</span>
                          <span>Entrega: {eq.delivery_date}</span>
                          <span>·</span>
                          <span>Reemplazo: {eq.replacement_date}</span>
                        </div>
                        {eq.notes && <p className="text-xs text-text-muted mt-1.5 truncate">{eq.notes}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {driverEquipment.some((eq) => getEquipmentStatus(eq.replacement_date).status === 'expired') && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-200 flex items-start gap-3">
                <i className="ri-alert-line text-red-600 text-lg mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Equipamiento vencido</p>
                  <p className="text-xs text-red-700 mt-1">Hay artículos que necesitan reemplazo inmediato.</p>
                </div>
              </div>
            )}

            {driverEquipment.some((eq) => getEquipmentStatus(eq.replacement_date).status === 'near') && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
                <i className="ri-time-line text-amber-600 text-lg mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Reemplazo próximo</p>
                  <p className="text-xs text-amber-700 mt-1">Algunos artículos se acercan a su fecha de reemplazo.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-text-primary">Evidencia Fotografica</h3>
              <p className="text-xs text-text-muted">{driver.evidence_photos} fotos totales · Mostrando ultimas 6</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {photos.map((photo, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-brand-border/40 group">
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <button type="button" className="text-white text-xs flex items-center gap-1">
                        <i className="ri-download-line" /> Descargar
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-text-primary">{photo.caption}</p>
                    <p className="text-xs text-text-muted">{photo.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-brand-border/40">
              <div className="p-4 bg-brand-light rounded-xl border border-brand-border/40">
                <p className="text-xs text-text-muted">Total Fotos</p>
                <p className="text-lg font-bold text-text-primary">{driver.evidence_photos.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-brand-light rounded-xl border border-brand-border/40">
                <p className="text-xs text-text-muted">Fotos / Ruta</p>
                <p className="text-lg font-bold text-text-primary">
                  {driver.routes_completed > 0 ? Math.round(driver.evidence_photos / driver.routes_completed) : 0}
                </p>
              </div>
              <div className="p-4 bg-brand-light rounded-xl border border-brand-border/40">
                <p className="text-xs text-text-muted">Incidentes Documentados</p>
                <p className="text-lg font-bold text-text-primary">{driver.incidents}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}