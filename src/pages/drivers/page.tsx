import { useNavigate } from 'react-router-dom';
import { useDrivers, driverStatuses } from '@/hooks/useDrivers';
import { useTrucks } from '@/hooks/useTrucks';

export default function DriversPage() {
  const navigate = useNavigate();
  const { drivers, loading, error } = useDrivers();
  const { trucks } = useTrucks();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-sm text-text-secondary">Cargando conductores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <i className="ri-error-warning-line text-3xl text-red-500" />
          <p className="text-sm text-red-700 mt-2">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 whitespace-nowrap" type="button">Reintentar</button>
        </div>
      </div>
    );
  }

  const getAssignedTruck = (truckId: string | null) => {
    if (!truckId) return 'Sin asignar';
    const truck = trucks.find(t => t.id === truckId);
    return truck ? truck.plate : 'Sin asignar';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Conductores</h1>
          <p className="text-sm text-text-secondary mt-1">
            Personal de recoleccion y su rendimiento
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/drivers/new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap"
        >
          <i className="ri-add-line" />
          Nuevo Conductor
        </button>
      </div>

      <div className="bg-white rounded-xl border border-brand-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border/40">
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Conductor</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">DNI</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Licencia</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Estado</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Camion</th>
                <th className="text-center text-xs font-medium text-text-muted uppercase px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-text-muted">
                    No hay conductores registrados
                  </td>
                </tr>
              )}
              {drivers.map((driver) => {
                const statusConfig = driverStatuses[driver.status as keyof typeof driverStatuses];
                return (
                  <tr key={driver.id} className="border-b border-brand-border/30 hover:bg-brand-light/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center text-sm font-bold text-brand-primary flex-shrink-0">
                          {driver.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{driver.name}</p>
                          <p className="text-xs text-text-muted">{driver.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{driver.dni}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{driver.license_type}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig?.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          driver.status === 'Active' ? 'bg-emerald-500' :
                          driver.status === 'On_Route' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`} />
                        {statusConfig?.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary">
                      {getAssignedTruck(driver.assigned_truck_id)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button type="button" className="text-text-muted hover:text-brand-primary transition-colors p-1" onClick={() => navigate(`/drivers/${driver.id}`)}>
                        <i className="ri-eye-line" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}