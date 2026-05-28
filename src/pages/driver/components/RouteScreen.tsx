import { driverAppData } from '@/mocks/driverApp';
import type { RouteVisit } from '@/mocks/driverApp';

interface RouteScreenProps {
  onSelectVisit: (visit: RouteVisit) => void;
  onBack: () => void;
}

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  Pending: { label: 'Pendiente', dot: 'bg-amber-400', bg: 'bg-amber-50', text: 'text-amber-700' },
  Visited: { label: 'Completado', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  Closed: { label: 'Cerrado', dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  No_Oil: { label: 'Sin aceite', dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
};

export default function RouteScreen({ onSelectVisit, onBack }: RouteScreenProps) {
  const { todayVisits, todayRoute } = driverAppData;

  return (
    <div className="min-h-screen bg-brand-bg pb-6">
      <div className="bg-brand-primary text-white p-4">
        <button onClick={onBack} type="button" className="flex items-center gap-1 text-white/70 hover:text-white mb-2 transition-colors">
          <i className="ri-arrow-left-line" /> Volver
        </button>
        <h1 className="text-lg font-bold">Hoja de ruta</h1>
        <p className="text-xs opacity-80">{todayRoute.name} · {todayVisits.length} clientes</p>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {todayVisits.map((visit, idx) => {
          const cfg = statusConfig[visit.status] || statusConfig.Pending;
          return (
            <button
              key={visit.id}
              onClick={() => onSelectVisit(visit)}
              type="button"
              className="w-full bg-white rounded-xl p-4 border border-brand-border text-left hover:border-brand-primary/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0 text-sm font-bold text-brand-primary">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-text-primary truncate">{visit.customer_name}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.bg} ${cfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 truncate">{visit.address}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-text-muted"><i className="ri-time-line mr-0.5" />{visit.estimated_time}</span>
                    {visit.liters_collected > 0 && (
                      <span className="text-xs font-medium text-brand-primary">{visit.liters_collected}L</span>
                    )}
                  </div>
                </div>
                <i className="ri-arrow-right-s-line text-text-muted mt-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}