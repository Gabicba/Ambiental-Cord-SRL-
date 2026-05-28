import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  maintenanceCategories,
  alertStatuses,
} from '@/mocks/maintenance';
import { mockTrucks } from '@/mocks/trucks';
import { useSharedMaintenance, type TruckMaintenanceEntry } from '@/hooks/useSharedMaintenance';
import type { MaintenanceCategory } from '@/mocks/maintenance';

const categoryOptions: { value: MaintenanceCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas las categorias' },
  { value: 'oil_change', label: 'Cambio de aceite' },
  { value: 'battery', label: 'Bateria' },
  { value: 'tires', label: 'Cubiertas' },
  { value: 'brakes', label: 'Frenos' },
  { value: 'itv', label: 'ITV / RTO' },
  { value: 'insurance', label: 'Seguro' },
];

const statusOptions = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'Upcoming', label: 'Proximo' },
  { value: 'Due', label: 'Vencido' },
  { value: 'Expired', label: 'Vencido hace dias' },
  { value: 'Completed', label: 'Completado' },
];

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

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + 'T12:00:00');
  return Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function daysLabel(days: number): string {
  if (days === 0) return 'Vence hoy';
  if (days === 1) return 'Vence manana';
  if (days === -1) return 'Vencio ayer';
  if (days > 0) return `Vence en ${days} dias`;
  return `Vencido hace ${Math.abs(days)} dias`;
}

export default function MaintenancePage() {
  const {
    alerts,
    addAlert,
    completeAlert,
    deleteAlert,
    getSummary,
    getUrgentAlerts,
  } = useSharedMaintenance();

  const [selectedCategory, setSelectedCategory] = useState<MaintenanceCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal: Nueva Alerta
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [newAlertForm, setNewAlertForm] = useState({
    truck_id: mockTrucks[0]?.id || '',
    category: 'oil_change' as MaintenanceCategory,
    last_done_date: formatDateInput(new Date()),
    interval_months: 3,
    next_due_date: addMonthsToDate(formatDateInput(new Date()), 3),
    notes: '',
    provider: '',
    cost: 0,
    current_km: 0,
  });

  // Modal: Completar Alerta
  const [completingAlert, setCompletingAlert] = useState<string | null>(null);
  const [completeForm, setCompleteForm] = useState({
    completedDate: formatDateInput(new Date()),
    km: 0,
    cost: 0,
    provider: '',
    notes: '',
  });

  const summary = getSummary();
  const urgent = getUrgentAlerts();

  const filtered = alerts.filter((rec) => {
    const catMatch = selectedCategory === 'all' || rec.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || rec.status === selectedStatus;
    const searchMatch =
      searchTerm === '' ||
      rec.truck_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.truck_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.provider?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      rec.notes.toLowerCase().includes(searchTerm.toLowerCase());
    return catMatch && statusMatch && searchMatch;
  });

  function handleAddAlert() {
    const truck = mockTrucks.find((t) => t.id === newAlertForm.truck_id);
    if (!truck) return;

    addAlert({
      truck_id: truck.id,
      truck_plate: truck.plate,
      truck_model: truck.model,
      category: newAlertForm.category,
      last_done_date: newAlertForm.last_done_date,
      next_due_date: newAlertForm.next_due_date,
      interval_months: newAlertForm.interval_months,
      current_km: newAlertForm.current_km,
      notes: newAlertForm.notes || `Alerta de ${maintenanceCategories[newAlertForm.category]?.label}`,
      provider: newAlertForm.provider || undefined,
      cost: newAlertForm.cost || undefined,
    });

    setShowNewAlert(false);
    setNewAlertForm({
      truck_id: mockTrucks[0]?.id || '',
      category: 'oil_change',
      last_done_date: formatDateInput(new Date()),
      interval_months: 3,
      next_due_date: addMonthsToDate(formatDateInput(new Date()), 3),
      notes: '',
      provider: '',
      cost: 0,
      current_km: 0,
    });
  }

  function handleCompleteAlert() {
    if (!completingAlert) return;
    completeAlert(completingAlert, {
      completedDate: completeForm.completedDate,
      km: completeForm.km,
      cost: completeForm.cost,
      provider: completeForm.provider,
      notes: completeForm.notes,
    });
    setCompletingAlert(null);
    setCompleteForm({
      completedDate: formatDateInput(new Date()),
      km: 0,
      cost: 0,
      provider: '',
      notes: '',
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mantenimiento Preventivo</h1>
          <p className="text-sm text-text-secondary mt-1">
            Alertas y seguimiento de mantenimiento de vehiculos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowNewAlert(true)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap"
          >
            <i className="ri-add-line" />
            Nueva Alerta
          </button>
          <Link
            to="/trucks"
            className="text-sm text-brand-green hover:text-brand-primary transition-colors font-medium"
          >
            Volver a camiones
          </Link>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-red-200/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <i className="ri-close-circle-line text-red-700 text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{summary.expired}</p>
              <p className="text-xs text-text-secondary">Vencidos hace dias</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-red-200/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <i className="ri-alarm-warning-line text-amber-700 text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{summary.due}</p>
              <p className="text-xs text-text-secondary">Vencidos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-amber-200/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <i className="ri-error-warning-line text-amber-600 text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{summary.upcoming}</p>
              <p className="text-xs text-text-secondary">Proximos (30 dias)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center">
              <i className="ri-tools-line text-brand-primary text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{summary.total}</p>
              <p className="text-xs text-text-secondary">Total registros</p>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Alerts Banner */}
      {urgent.length > 0 && (
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-2 mb-3">
            <i className="ri-alarm-warning-line text-red-600" />
            <h3 className="text-sm font-semibold text-red-700">Alertas urgentes ({urgent.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {urgent.slice(0, 6).map((alert) => {
              const cat = maintenanceCategories[alert.category];
              const status = alertStatuses[alert.status];
              const days = getDaysUntil(alert.next_due_date);
              return (
                <div
                  key={alert.id}
                  className="bg-white rounded-lg p-3 border border-red-100 flex items-start gap-3"
                >
                  <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center flex-shrink-0`}>
                    <i className={`${cat.icon} text-sm`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{alert.truck_plate}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{cat.label}</p>
                    <p className="text-xs font-medium text-red-600 mt-0.5">{daysLabel(days)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-brand-border/60 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 min-w-0">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
            <input
              type="text"
              placeholder="Buscar por patente, modelo, proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as MaintenanceCategory | 'all')}
            className="px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green bg-white"
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green bg-white"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Maintenance Table */}
      <div className="bg-white rounded-xl border border-brand-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border/40 bg-brand-light/30">
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Vehiculo</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Categoria</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Ultimo</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Proximo</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Estado</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Intervalo</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Notas</th>
                <th className="text-right text-xs font-medium text-text-muted uppercase px-5 py-3">Accion</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rec) => {
                const cat = maintenanceCategories[rec.category];
                const status = alertStatuses[rec.status];
                const days = getDaysUntil(rec.next_due_date);
                return (
                  <tr key={rec.id} className="border-b border-brand-border/30 hover:bg-brand-light/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center flex-shrink-0`}>
                          <i className={`${cat.icon} text-sm`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{rec.truck_plate}</p>
                          <p className="text-xs text-text-muted">{rec.truck_model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-text-secondary">{cat.label}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{rec.last_done_date}</td>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-medium ${days <= 0 ? 'text-red-600' : days <= 30 ? 'text-amber-600' : 'text-text-primary'}`}>
                        {rec.next_due_date}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                        <i className={`${status.badge} text-xs`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-text-secondary">{rec.interval_months} meses</span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-xs text-text-secondary max-w-[200px] truncate">{rec.notes}</p>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {rec.status !== 'Completed' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCompletingAlert(rec.id);
                              setCompleteForm({
                                completedDate: formatDateInput(new Date()),
                                km: rec.current_km,
                                cost: rec.cost || 0,
                                provider: rec.provider || '',
                                notes: '',
                              });
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-green text-white text-xs font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap"
                          >
                            <i className="ri-check-line" />
                            Completar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Eliminar esta alerta?')) {
                                deleteAlert(rec.id);
                              }
                            }}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-brand-border text-text-muted hover:text-red-600 hover:border-red-200 transition-colors"
                          >
                            <i className="ri-delete-bin-line text-xs" />
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                          <i className="ri-check-line text-xs" />
                          Completado
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-10 text-center">
            <i className="ri-tools-line text-4xl text-text-muted mb-3" />
            <p className="text-sm text-text-secondary">No se encontraron registros con los filtros seleccionados.</p>
          </div>
        )}
      </div>

      {/* By Truck Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from(new Set(alerts.map((r) => r.truck_id))).map((truckId) => {
          const truckRecs = alerts.filter((r) => r.truck_id === truckId);
          const truck = truckRecs[0];
          const expiredCount = truckRecs.filter((r) => r.status === 'Expired').length;
          const dueCount = truckRecs.filter((r) => r.status === 'Due').length;
          const upcomingCount = truckRecs.filter((r) => r.status === 'Upcoming').length;

          return (
            <Link
              key={truckId}
              to={`/trucks/${truckId}`}
              className="bg-white rounded-xl p-4 border border-brand-border/60 hover:border-brand-green/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{truck.truck_plate}</p>
                  <p className="text-xs text-text-muted">{truck.truck_model}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center">
                  <i className="ri-truck-line text-brand-primary text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                {expiredCount > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-red-600">Vencidos hace dias</span>
                    <span className="font-semibold text-red-600">{expiredCount}</span>
                  </div>
                )}
                {dueCount > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-600">Vencidos</span>
                    <span className="font-semibold text-amber-600">{dueCount}</span>
                  </div>
                )}
                {upcomingCount > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">Proximos</span>
                    <span className="font-semibold text-text-secondary">{upcomingCount}</span>
                  </div>
                )}
                {expiredCount === 0 && dueCount === 0 && upcomingCount === 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-600">Todo en orden</span>
                    <i className="ri-check-double-line text-emerald-600" />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Modal: Nueva Alerta */}
      {showNewAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-brand-border/60 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-brand-border/40">
              <h3 className="text-lg font-semibold text-text-primary">Nueva Alerta de Mantenimiento</h3>
              <button
                type="button"
                onClick={() => setShowNewAlert(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-light text-text-muted transition-colors"
              >
                <i className="ri-close-line text-lg" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Vehiculo</label>
                  <select
                    value={newAlertForm.truck_id}
                    onChange={(e) => {
                      const truck = mockTrucks.find((t) => t.id === e.target.value);
                      setNewAlertForm({
                        ...newAlertForm,
                        truck_id: e.target.value,
                        current_km: truck?.km_total || 0,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green bg-white"
                  >
                    {mockTrucks.map((t) => (
                      <option key={t.id} value={t.id}>{t.plate} - {t.model}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Categoria</label>
                  <select
                    value={newAlertForm.category}
                    onChange={(e) => {
                      const cat = e.target.value as MaintenanceCategory;
                      const interval = cat === 'oil_change' ? 3 : cat === 'battery' || cat === 'brakes' ? 6 : 12;
                      setNewAlertForm({
                        ...newAlertForm,
                        category: cat,
                        interval_months: interval,
                        next_due_date: addMonthsToDate(newAlertForm.last_done_date, interval),
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green bg-white"
                  >
                    {categoryOptions.filter((c) => c.value !== 'all').map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Ultimo mantenimiento</label>
                  <input
                    type="date"
                    value={newAlertForm.last_done_date}
                    onChange={(e) => {
                      setNewAlertForm({
                        ...newAlertForm,
                        last_done_date: e.target.value,
                        next_due_date: addMonthsToDate(e.target.value, newAlertForm.interval_months),
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Kilometraje actual</label>
                  <input
                    type="number"
                    value={newAlertForm.current_km || ''}
                    onChange={(e) => setNewAlertForm({ ...newAlertForm, current_km: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Intervalo (meses)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={newAlertForm.interval_months}
                    onChange={(e) => {
                      const months = Number(e.target.value);
                      setNewAlertForm({
                        ...newAlertForm,
                        interval_months: months,
                        next_due_date: addMonthsToDate(newAlertForm.last_done_date, months),
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Proximo vencimiento</label>
                  <div className="px-3 py-2 rounded-lg border border-brand-border bg-brand-light text-sm text-text-primary">
                    {newAlertForm.next_due_date}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Proveedor / Taller</label>
                  <input
                    type="text"
                    value={newAlertForm.provider}
                    onChange={(e) => setNewAlertForm({ ...newAlertForm, provider: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green"
                    placeholder="Ej: Mercedes-Benz Argentina"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Costo estimado ($)</label>
                  <input
                    type="number"
                    value={newAlertForm.cost || ''}
                    onChange={(e) => setNewAlertForm({ ...newAlertForm, cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green"
                    placeholder="Ej: 45000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Notas / Descripcion</label>
                <textarea
                  value={newAlertForm.notes}
                  onChange={(e) => setNewAlertForm({ ...newAlertForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green resize-none"
                  placeholder="Ej: Cambio de aceite Mobil Delvac MX 15W40, filtro original..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-brand-border/40">
              <button
                type="button"
                onClick={() => setShowNewAlert(false)}
                className="px-4 py-2 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddAlert}
                className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap"
              >
                Crear Alerta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Completar Alerta */}
      {completingAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-brand-border/60 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-brand-border/40">
              <h3 className="text-lg font-semibold text-text-primary">Completar Mantenimiento</h3>
              <button
                type="button"
                onClick={() => setCompletingAlert(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-light text-text-muted transition-colors"
              >
                <i className="ri-close-line text-lg" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Fecha de realizacion</label>
                  <input
                    type="date"
                    value={completeForm.completedDate}
                    onChange={(e) => setCompleteForm({ ...completeForm, completedDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Kilometraje</label>
                  <input
                    type="number"
                    value={completeForm.km || ''}
                    onChange={(e) => setCompleteForm({ ...completeForm, km: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Proveedor / Taller</label>
                  <input
                    type="text"
                    value={completeForm.provider}
                    onChange={(e) => setCompleteForm({ ...completeForm, provider: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green"
                    placeholder="Ej: Mercedes-Benz Argentina"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Costo real ($)</label>
                  <input
                    type="number"
                    value={completeForm.cost || ''}
                    onChange={(e) => setCompleteForm({ ...completeForm, cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Detalle de trabajo realizado</label>
                <textarea
                  value={completeForm.notes}
                  onChange={(e) => setCompleteForm({ ...completeForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green resize-none"
                  placeholder="Ej: Se cambio aceite, filtros, se revisaron frenos y suspension..."
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-700">
                  <i className="ri-information-line mr-1" />
                  Al completar, se guardara en el historial del camion y se generara automaticamente la proxima alerta segun el intervalo configurado.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-brand-border/40">
              <button
                type="button"
                onClick={() => setCompletingAlert(null)}
                className="px-4 py-2 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCompleteAlert}
                className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap"
              >
                Confirmar Completado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}