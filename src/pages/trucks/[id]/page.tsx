import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockTrucks, truckStatuses, maintenanceTypes } from '@/mocks/trucks';
import { mockDrivers } from '@/mocks/drivers';
import { useSharedMaintenance, getMergedTruckData } from '@/hooks/useSharedMaintenance';

const tabs = [
  { id: 'general', label: 'General' },
  { id: 'maintenance', label: 'Mantenimiento' },
  { id: 'routes', label: 'Rutas Asignadas' },
  { id: 'gps', label: 'GPS en Vivo' },
  { id: 'documents', label: 'Documentos' },
];

const routeStatuses: Record<string, { label: string; color: string; dot: string }> = {
  Completed: { label: 'Completada', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  In_Progress: { label: 'En Progreso', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  Pending: { label: 'Pendiente', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  Canceled: { label: 'Cancelada', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
};

const docStatuses: Record<string, { label: string; color: string }> = {
  Active: { label: 'Vigente', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Expired: { label: 'Vencido', color: 'bg-red-50 text-red-700 border-red-200' },
  Near: { label: 'Proximo a vencer', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const maintCategories = [
  { value: 'oil_change', label: 'Cambio de aceite', interval: 3 },
  { value: 'battery', label: 'Bateria', interval: 6 },
  { value: 'tires', label: 'Cubiertas', interval: 12 },
  { value: 'brakes', label: 'Frenos', interval: 6 },
  { value: 'itv', label: 'ITV / RTO', interval: 12 },
  { value: 'insurance', label: 'Seguro', interval: 12 },
  { value: 'general', label: 'Mantenimiento general', interval: 4 },
];

function getDocStatus(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = d.getTime() - now.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  if (days < 0) return 'Expired';
  if (days < 30) return 'Near';
  return 'Active';
}

function formatDateInput(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addMonthsToDate(dateStr: string, months: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setMonth(d.getMonth() + months);
  return formatDateInput(d);
}

export default function TruckDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const { addAlert } = useSharedMaintenance();

  // Get merged data from localStorage + mocks
  const baseTruck = getMergedTruckData(id || '');
  const [truck, setTruck] = useState(baseTruck ? JSON.parse(JSON.stringify(baseTruck)) : null);

  // Modal state
  const [showNewMaint, setShowNewMaint] = useState(false);
  const [maintForm, setMaintForm] = useState({
    category: 'oil_change',
    type: 'Mantenimiento Preventivo',
    date: formatDateInput(new Date()),
    km: 0,
    cost: 0,
    provider: '',
    description: '',
    interval_months: 3,
    status: 'Completed' as string,
  });

  // Force re-render when localStorage changes from other tabs
  const [, setTick] = useState(0);
  const reloadFromStorage = useCallback(() => {
    const merged = getMergedTruckData(id || '');
    if (merged) {
      setTruck(JSON.parse(JSON.stringify(merged)));
    }
    setTick((t) => t + 1);
  }, [id]);

  const assignedDriver = truck?.assigned_driver_id
    ? mockDrivers.find((d) => d.id === truck.assigned_driver_id)
    : null;

  if (!truck) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/trucks')}
          className="text-sm text-text-secondary hover:text-brand-primary transition-colors"
        >
          ← Volver a Camiones
        </button>
        <div className="bg-white rounded-xl p-8 text-center border border-brand-border/60">
          <i className="ri-truck-line text-5xl text-text-muted mb-4" />
          <h2 className="text-xl font-semibold text-text-primary">Camion no encontrado</h2>
          <p className="text-sm text-text-secondary mt-2">El camion solicitado no existe.</p>
        </div>
      </div>
    );
  }

  const statusConfig = truckStatuses[truck.status as keyof typeof truckStatuses];

  const totalMaintCost = truck.maintenance_history.reduce((sum: number, m: { cost: number }) => sum + m.cost, 0);
  const completedRoutes = truck.assigned_routes.filter((r: { status: string }) => r.status === 'Completed');
  const inProgressRoutes = truck.assigned_routes.filter((r: { status: string }) => r.status === 'In_Progress');

  function handleSaveMaintenance() {
    const catLabel = maintCategories.find((c) => c.value === maintForm.category)?.label || maintForm.category;
    const nextDate = addMonthsToDate(maintForm.date, maintForm.interval_months);

    const newMaint = {
      id: `MNT-${Date.now()}`,
      date: maintForm.date,
      type: maintForm.type,
      km: maintForm.km,
      cost: maintForm.cost,
      description: `${catLabel}: ${maintForm.description}`,
      provider: maintForm.provider || 'Sin proveedor',
      status: maintForm.status,
      category: maintForm.category,
      next_due_date: nextDate,
      interval_months: maintForm.interval_months,
    };

    // Update local truck state
    setTruck((prev: typeof truck) => {
      if (!prev) return prev;
      return {
        ...prev,
        maintenance_history: [newMaint, ...prev.maintenance_history],
        last_maintenance: maintForm.date,
        next_maintenance: nextDate,
        km_since_maintenance: 0,
      };
    });

    // Persist merged truck data to localStorage for other pages
    try {
      const raw = localStorage.getItem('uco_trucks_data_v1');
      const trucksData = raw ? JSON.parse(raw) : {};
      const existing = trucksData[truck.id]?.maintenance_history || [];
      trucksData[truck.id] = {
        ...(trucksData[truck.id] || {}),
        maintenance_history: [newMaint, ...existing],
      };
      localStorage.setItem('uco_trucks_data_v1', JSON.stringify(trucksData));
    } catch {
      // ignore
    }

    // Sync alert to shared maintenance system
    addAlert({
      truck_id: truck.id,
      truck_plate: truck.plate,
      truck_model: truck.model,
      category: maintForm.category as import('@/mocks/maintenance').MaintenanceCategory,
      last_done_date: maintForm.date,
      next_due_date: nextDate,
      interval_months: maintForm.interval_months,
      current_km: maintForm.km,
      notes: newMaint.description,
      provider: newMaint.provider,
      cost: newMaint.cost,
    });

    setShowNewMaint(false);
    setMaintForm({
      category: 'oil_change',
      type: 'Mantenimiento Preventivo',
      date: formatDateInput(new Date()),
      km: 0,
      cost: 0,
      provider: '',
      description: '',
      interval_months: 3,
      status: 'Completed',
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/trucks')}
            className="text-xs text-text-secondary hover:text-brand-primary transition-colors mb-2"
          >
            ← Volver a Camiones
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-text-primary">{truck.plate}</h1>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig?.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${truck.status === 'Active' ? 'bg-emerald-500' : truck.status === 'On_Route' ? 'bg-blue-500' : truck.status === 'Maintenance' ? 'bg-amber-500' : 'bg-gray-500'}`} />
              {statusConfig?.label}
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1">{truck.model}</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-brand-border/60">
          <div className="flex items-center gap-2 mb-1">
            <i className="ri-route-line text-brand-green text-lg" />
            <p className="text-xs text-text-muted">Rutas Completadas</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{completedRoutes.length}</p>
          <p className="text-xs text-text-muted mt-1">{inProgressRoutes.length} en progreso</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60">
          <div className="flex items-center gap-2 mb-1">
            <i className="ri-gas-station-line text-brand-primary text-lg" />
            <p className="text-xs text-text-muted">Capacidad</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{truck.capacity_liters.toLocaleString()} L</p>
          <p className="text-xs text-text-muted mt-1">Tanque de acero inoxidable</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60">
          <div className="flex items-center gap-2 mb-1">
            <i className="ri-speed-line text-brand-primary text-lg" />
            <p className="text-xs text-text-muted">Kilometraje</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{truck.km_total.toLocaleString()} km</p>
          <p className="text-xs text-text-muted mt-1">+{truck.km_since_maintenance.toLocaleString()} desde ult. service</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60">
          <div className="flex items-center gap-2 mb-1">
            <i className="ri-tools-line text-brand-primary text-lg" />
            <p className="text-xs text-text-muted">Costo Mantenimiento</p>
          </div>
          <p className="text-xl font-bold text-text-primary">${totalMaintCost.toLocaleString('es-AR')}</p>
          <p className="text-xs text-text-muted mt-1">{truck.maintenance_history.length} intervenciones</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-brand-border/60">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'maintenance') reloadFromStorage();
              }}
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
              {/* Informacion tecnica */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-text-primary">Informacion Tecnica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-text-muted">Modelo</p>
                    <p className="text-sm font-medium text-text-primary">{truck.model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Anio</p>
                    <p className="text-sm font-medium text-text-primary">{truck.year}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">VIN</p>
                    <p className="text-sm font-medium text-text-primary">{truck.vin}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Tipo de Combustible</p>
                    <p className="text-sm font-medium text-text-primary">{truck.fuel_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Capacidad</p>
                    <p className="text-sm font-medium text-text-primary">{truck.capacity_liters.toLocaleString()} L</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Kilometraje Total</p>
                    <p className="text-sm font-medium text-text-primary">{truck.km_total.toLocaleString()} km</p>
                  </div>
                </div>
              </div>

              {/* Documentos del vehiculo */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-text-primary">Documentacion del Vehiculo</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-brand-light rounded-lg border border-brand-border/40">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Seguro Vehicular</p>
                      <p className="text-xs text-text-muted">Vence: {truck.insurance_expiry}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${docStatuses[getDocStatus(truck.insurance_expiry)].color}`}>
                      {docStatuses[getDocStatus(truck.insurance_expiry)].label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-brand-light rounded-lg border border-brand-border/40">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Revision Tecnica</p>
                      <p className="text-xs text-text-muted">Vence: {truck.technical_revision_expiry}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${docStatuses[getDocStatus(truck.technical_revision_expiry)].color}`}>
                      {docStatuses[getDocStatus(truck.technical_revision_expiry)].label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conductor asignado */}
            <div className="pt-4 border-t border-brand-border/40">
              <h3 className="text-base font-semibold text-text-primary mb-3">Conductor Asignado</h3>
              {assignedDriver ? (
                <div className="flex items-center gap-4 p-4 bg-brand-light rounded-xl border border-brand-border/40">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-base font-bold text-brand-primary flex-shrink-0">
                    {assignedDriver.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{assignedDriver.name}</p>
                    <p className="text-xs text-text-muted">{assignedDriver.dni} · Licencia {assignedDriver.license_type}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-text-primary">{assignedDriver.routes_completed} rutas</p>
                    <p className="text-xs text-text-muted">{assignedDriver.total_liters.toLocaleString()} L recolectados</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/drivers/${assignedDriver.id}`)}
                    className="text-brand-green text-sm font-medium hover:underline whitespace-nowrap"
                  >
                    Ver Perfil →
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <i className="ri-user-line text-xl text-text-muted" />
                  <div>
                    <p className="text-sm text-text-secondary">Sin conductor asignado</p>
                    <p className="text-xs text-text-muted">Asigne un conductor desde el panel de personal</p>
                  </div>
                </div>
              )}
            </div>

            {/* Observaciones */}
            {truck.notes && (
              <div className="pt-4 border-t border-brand-border/40">
                <h3 className="text-base font-semibold text-text-primary mb-2">Observaciones</h3>
                <p className="text-sm text-text-secondary">{truck.notes}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-text-primary">Historial de Mantenimiento</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Registro completo: ideal para valuacion de reventa y garantias
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewMaint(true)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap"
              >
                <i className="ri-add-line" />
                Nuevo Mantenimiento
              </button>
            </div>
            <div className="space-y-3">
              {truck.maintenance_history.map((maint: {
                id: string;
                type: string;
                date: string;
                description: string;
                provider: string;
                km: number;
                cost: number;
                status: string;
                next_due_date?: string;
                interval_months?: number;
              }) => {
                const typeConfig = maintenanceTypes[maint.type as keyof typeof maintenanceTypes];
                return (
                  <div key={maint.id} className="p-4 border border-brand-border/40 rounded-xl hover:border-brand-green/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${typeConfig?.color}`}>
                            {typeConfig?.label}
                          </span>
                          <p className="text-xs text-text-muted">{maint.date}</p>
                        </div>
                        <p className="text-sm font-semibold text-text-primary">{maint.description}</p>
                        <p className="text-xs text-text-muted mt-1">Proveedor: {maint.provider} · {maint.km.toLocaleString()} km</p>
                        {maint.next_due_date && (
                          <p className="text-xs text-text-secondary mt-0.5">
                            Proximo: {maint.next_due_date} ({maint.interval_months} meses)
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-text-primary">${maint.cost.toLocaleString('es-AR')}</p>
                        <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${maint.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${maint.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {maint.status === 'Completed' ? 'Completado' : 'En Progreso'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Resumen costos */}
            <div className="mt-4 p-4 bg-brand-light rounded-xl border border-brand-border/40">
              <h4 className="text-sm font-semibold text-text-primary mb-3">Resumen de Costos</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-text-muted">Total Invertido</p>
                  <p className="text-lg font-bold text-text-primary">${totalMaintCost.toLocaleString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Preventivo</p>
                  <p className="text-lg font-bold text-text-primary">
                    ${truck.maintenance_history.filter((m: { type: string }) => m.type.includes('Preventivo')).reduce((s: number, m: { cost: number }) => s + m.cost, 0).toLocaleString('es-AR')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Correctivo</p>
                  <p className="text-lg font-bold text-text-primary">
                    ${truck.maintenance_history.filter((m: { type: string }) => m.type.includes('Correctivo')).reduce((s: number, m: { cost: number }) => s + m.cost, 0).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'routes' && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-text-primary">Rutas Asignadas</h3>
            {truck.assigned_routes.length === 0 ? (
              <div className="text-center py-8">
                <i className="ri-route-line text-4xl text-text-muted mb-3" />
                <p className="text-sm text-text-secondary">No hay rutas asignadas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brand-border/40">
                      <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">ID Ruta</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Fecha</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Conductor</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Estado</th>
                      <th className="text-right text-xs font-medium text-text-muted uppercase px-4 py-3">Visitas</th>
                      <th className="text-right text-xs font-medium text-text-muted uppercase px-4 py-3">Litros</th>
                      <th className="text-center text-xs font-medium text-text-muted uppercase px-4 py-3">Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {truck.assigned_routes.map((route: { id: string; date: string; driver_name: string; status: string; visits_count: number; total_liters: number }) => {
                      const rs = routeStatuses[route.status];
                      return (
                        <tr key={route.id} className="border-b border-brand-border/30 hover:bg-brand-light/50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-text-primary">{route.id}</td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{route.date}</td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{route.driver_name}</td>
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
            )}
            {/* Resumen de productividad del camion */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-brand-light rounded-xl border border-brand-border/40">
                <p className="text-xs text-text-muted">Total Rutas</p>
                <p className="text-lg font-bold text-text-primary">{truck.assigned_routes.length}</p>
              </div>
              <div className="p-4 bg-brand-light rounded-xl border border-brand-border/40">
                <p className="text-xs text-text-muted">Litros Acumulados</p>
                <p className="text-lg font-bold text-text-primary">
                  {truck.assigned_routes.reduce((s: number, r: { total_liters: number }) => s + r.total_liters, 0).toLocaleString()} L
                </p>
              </div>
              <div className="p-4 bg-brand-light rounded-xl border border-brand-border/40">
                <p className="text-xs text-text-muted">Promedio por Ruta</p>
                <p className="text-lg font-bold text-text-primary">
                  {truck.assigned_routes.length > 0
                    ? Math.round(truck.assigned_routes.reduce((s: number, r: { total_liters: number }) => s + r.total_liters, 0) / truck.assigned_routes.length).toLocaleString()
                    : 0} L
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gps' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-text-primary">GPS en Vivo</h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Conectado
                </span>
                <span className="text-xs text-text-muted">DEV: {truck.gps_device_id}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 rounded-xl overflow-hidden border border-brand-border/60 h-80">
                <iframe
                  title={`Mapa GPS ${truck.plate}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d105073.26479892258!2d-58.41729755!3d-34.61582385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcca3b4ef90ffd%3A0xe15788b47bca6197!2sBuenos%20Aires%2C%20Argentina!5e0!3m2!1ses!2sus!4v1699999999999"
                />
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-brand-light rounded-xl border border-brand-border/40">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="ri-speed-line text-brand-green" />
                    <p className="text-xs font-medium text-text-primary">Velocidad Actual</p>
                  </div>
                  <p className="text-2xl font-bold text-text-primary">
                    {truck.status === 'On_Route' ? '42' : '0'} <span className="text-sm font-normal text-text-muted">km/h</span>
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {truck.status === 'On_Route' ? 'En movimiento · Av. Corrientes' : 'Detenido'}
                  </p>
                </div>
                <div className="p-4 bg-brand-light rounded-xl border border-brand-border/40">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="ri-map-pin-line text-brand-primary" />
                    <p className="text-xs font-medium text-text-primary">Ubicacion</p>
                  </div>
                  <p className="text-sm text-text-secondary">
                    Av. Corrientes 3456, CABA
                  </p>
                  <p className="text-xs text-text-muted mt-1">Actualizado: 21/05 14:32</p>
                </div>
                <div className="p-4 bg-brand-light rounded-xl border border-brand-border/40">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="ri-route-line text-brand-primary" />
                    <p className="text-xs font-medium text-text-primary">Ruta Actual</p>
                  </div>
                  {inProgressRoutes.length > 0 ? (
                    <div>
                      <p className="text-sm font-medium text-text-primary">{inProgressRoutes[0].id}</p>
                      <p className="text-xs text-text-muted">{inProgressRoutes[0].visits_count} visitas · {inProgressRoutes[0].driver_name}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted">Sin ruta activa</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-text-primary">Documentacion</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 border border-brand-border/40 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <i className="ri-file-pdf-line text-red-600 text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">Cedula Verde</p>
                  <p className="text-xs text-text-muted">{truck.plate} · {truck.year}</p>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${docStatuses.Active.color}`}>
                  Vigente
                </span>
              </div>
              <div className="p-4 border border-brand-border/40 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <i className="ri-file-pdf-line text-red-600 text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">Titulo de Propiedad</p>
                  <p className="text-xs text-text-muted">VIN: {truck.vin}</p>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${docStatuses.Active.color}`}>
                  Vigente
                </span>
              </div>
              <div className="p-4 border border-brand-border/40 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <i className="ri-file-pdf-line text-red-600 text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">Poliza de Seguro</p>
                  <p className="text-xs text-text-muted">Vence: {truck.insurance_expiry}</p>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${docStatuses[getDocStatus(truck.insurance_expiry)].color}`}>
                  {docStatuses[getDocStatus(truck.insurance_expiry)].label}
                </span>
              </div>
              <div className="p-4 border border-brand-border/40 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <i className="ri-file-pdf-line text-red-600 text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">Revision Tecnica</p>
                  <p className="text-xs text-text-muted">Vence: {truck.technical_revision_expiry}</p>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${docStatuses[getDocStatus(truck.technical_revision_expiry)].color}`}>
                  {docStatuses[getDocStatus(truck.technical_revision_expiry)].label}
                </span>
              </div>
              <div className="p-4 border border-brand-border/40 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <i className="ri-file-pdf-line text-red-600 text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">Certificado de Emisiones</p>
                  <p className="text-xs text-text-muted">{truck.model} · {truck.year}</p>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${docStatuses.Active.color}`}>
                  Vigente
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Nuevo Mantenimiento */}
      {showNewMaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-brand-border/60 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-brand-border/40">
              <h3 className="text-lg font-semibold text-text-primary">Registrar Nuevo Mantenimiento</h3>
              <button
                type="button"
                onClick={() => setShowNewMaint(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-light text-text-muted transition-colors"
              >
                <i className="ri-close-line text-lg" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Categoria y Tipo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Categoria</label>
                  <select
                    value={maintForm.category}
                    onChange={(e) => {
                      const cat = maintCategories.find((c) => c.value === e.target.value);
                      setMaintForm({
                        ...maintForm,
                        category: e.target.value,
                        interval_months: cat?.interval || 3,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green bg-white"
                  >
                    {maintCategories.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Tipo</label>
                  <select
                    value={maintForm.type}
                    onChange={(e) => setMaintForm({ ...maintForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green bg-white"
                  >
                    <option value="Mantenimiento Preventivo">Mantenimiento Preventivo</option>
                    <option value="Mantenimiento Correctivo">Mantenimiento Correctivo</option>
                  </select>
                </div>
              </div>

              {/* Fecha y Kilometraje */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Fecha del mantenimiento</label>
                  <input
                    type="date"
                    value={maintForm.date}
                    onChange={(e) => setMaintForm({ ...maintForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Kilometraje actual</label>
                  <input
                    type="number"
                    value={maintForm.km || ''}
                    onChange={(e) => setMaintForm({ ...maintForm, km: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green"
                    placeholder="Ej: 125000"
                  />
                </div>
              </div>

              {/* Proveedor y Costo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Proveedor / Taller</label>
                  <input
                    type="text"
                    value={maintForm.provider}
                    onChange={(e) => setMaintForm({ ...maintForm, provider: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green"
                    placeholder="Ej: Mercedes-Benz Argentina"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Costo ($)</label>
                  <input
                    type="number"
                    value={maintForm.cost || ''}
                    onChange={(e) => setMaintForm({ ...maintForm, cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green"
                    placeholder="Ej: 45000"
                  />
                </div>
              </div>

              {/* Alerta: Intervalo */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <i className="ri-alarm-warning-line text-amber-600" />
                  <h4 className="text-sm font-semibold text-amber-700">Configurar alerta de proximo mantenimiento</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Intervalo de alerta (meses)</label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={maintForm.interval_months}
                      onChange={(e) => setMaintForm({ ...maintForm, interval_months: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Proximo vencimiento calculado</label>
                    <div className="px-3 py-2 rounded-lg border border-brand-border bg-brand-light text-sm text-text-primary">
                      {addMonthsToDate(maintForm.date, maintForm.interval_months)}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-text-secondary">
                  El sistema calculara automaticamente la fecha del proximo mantenimiento sumando {maintForm.interval_months} meses a la fecha seleccionada.
                </p>
              </div>

              {/* Estado y Descripcion */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Estado</label>
                  <select
                    value={maintForm.status}
                    onChange={(e) => setMaintForm({ ...maintForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green bg-white"
                  >
                    <option value="Completed">Completado</option>
                    <option value="In_Progress">En Progreso</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Descripcion / Detalle</label>
                <textarea
                  value={maintForm.description}
                  onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green resize-none"
                  placeholder="Ej: Cambio de aceite, filtros, revision de frenos y suspension..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-brand-border/40">
              <button
                type="button"
                onClick={() => setShowNewMaint(false)}
                className="px-4 py-2 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveMaintenance}
                className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap"
              >
                Guardar Mantenimiento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}