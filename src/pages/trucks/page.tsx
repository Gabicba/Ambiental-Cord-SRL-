import { useNavigate } from 'react-router-dom';
import { mockTrucks, truckStatuses } from '@/mocks/trucks';

export default function TrucksPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Camiones</h1>
          <p className="text-sm text-text-secondary mt-1">
            Flota vehicular y asignacion de conductores
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/trucks/new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap"
        >
          <i className="ri-add-line" />
          Nuevo Camion
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockTrucks.map((truck) => {
          const statusConfig = truckStatuses[truck.status as keyof typeof truckStatuses];
          return (
            <div
              key={truck.id}
              className="bg-white rounded-xl p-5 border border-brand-border/60 hover:border-brand-green/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/trucks/${truck.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                    <i className="ri-truck-line text-2xl text-brand-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-text-primary">{truck.plate}</p>
                    <p className="text-xs text-text-muted">{truck.model}</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${statusConfig?.color}`}>
                  {statusConfig?.label}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-brand-border/40 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-text-muted">Capacidad</p>
                  <p className="text-sm font-medium text-text-primary">{truck.capacity_liters.toLocaleString()} L</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Anio</p>
                  <p className="text-sm font-medium text-text-primary">{truck.year}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">GPS</p>
                  <p className="text-sm font-medium text-text-primary">{truck.gps_device_id}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Mantenimiento</p>
                  <p className="text-sm font-medium text-text-primary">{truck.last_maintenance}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}