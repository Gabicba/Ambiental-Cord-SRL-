import { driverAppData } from '@/mocks/driverApp';

interface HistoryScreenProps {
  onBack: () => void;
}

const statusLabels: Record<string, string> = {
  Visited: 'Completado',
  Closed: 'Cerrado',
  No_Oil: 'Sin aceite',
  Pending: 'Pendiente',
};

const statusColors: Record<string, string> = {
  Visited: 'text-emerald-600',
  Closed: 'text-red-600',
  No_Oil: 'text-blue-600',
  Pending: 'text-amber-600',
};

export default function HistoryScreen({ onBack }: HistoryScreenProps) {
  const { todayVisits } = driverAppData;

  return (
    <div className="min-h-screen bg-brand-bg pb-6">
      <div className="bg-brand-primary text-white p-4">
        <button onClick={onBack} type="button" className="flex items-center gap-1 text-white/70 hover:text-white mb-2 transition-colors">
          <i className="ri-arrow-left-line" /> Volver
        </button>
        <h1 className="text-lg font-bold">Historial del dia</h1>
        <p className="text-xs opacity-80">{todayVisits.length} visitas · {new Date().toLocaleDateString('es-AR')}</p>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {todayVisits.map((visit) => (
          <div key={visit.id} className="bg-white rounded-xl p-4 border border-brand-border">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-text-primary">{visit.customer_name}</p>
              <span className={`text-xs font-medium ${statusColors[visit.status] || 'text-gray-600'}`}>
                {statusLabels[visit.status] || visit.status}
              </span>
            </div>
            <p className="text-xs text-text-muted">{visit.address}</p>
            {visit.status === 'Visited' && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-brand-primary font-medium">{visit.liters_collected}L</span>
                  {visit.payment_amount > 0 && (
                    <span className="text-xs text-emerald-600 font-medium">${visit.payment_amount.toLocaleString('es-AR')} pagado</span>
                  )}
                  <span className="text-xs text-text-muted">{visit.visited_at ? new Date(visit.visited_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${visit.oil_paid ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    Aceite: {visit.oil_paid ? `Pagado $${visit.oil_amount.toLocaleString('es-AR')}` : 'No pagado'}
                  </span>
                  {visit.detergent_delivered && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-sky-50 text-sky-700">
                      Detergente: {visit.detergent_quantity} bidones de 5L
                    </span>
                  )}
                </div>
              </div>
            )}
            {visit.status === 'Closed' && (
              <p className="text-xs text-red-600 mt-1">{visit.observations}</p>
            )}
            {visit.status === 'No_Oil' && (
              <p className="text-xs text-blue-600 mt-1">{visit.observations}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}