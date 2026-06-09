import type { ActiveVisitState } from '../types';
import { driverAppData } from '@/mocks/driverApp';

interface SummaryScreenProps {
  activeVisit: ActiveVisitState;
  onBack: () => void;
  onFinish: () => void;
}

export default function SummaryScreen({ activeVisit, onBack, onFinish }: SummaryScreenProps) {
  const visit = driverAppData.todayVisits.find((v) => v.id === activeVisit.visitId);

  return (
    <div className="min-h-screen bg-brand-bg pb-6">
      <div className="bg-brand-primary text-white p-4">
        <button onClick={onBack} type="button" className="flex items-center gap-1 text-white/70 hover:text-white mb-2 transition-colors">
          <i className="ri-arrow-left-line" /> Volver
        </button>
        <h1 className="text-lg font-bold">Resumen de visita</h1>
        <p className="text-xs opacity-80">{visit?.customer_name}</p>
      </div>

      <div className="px-4 mt-4 space-y-3">
        <div className="bg-white rounded-xl p-4 border border-brand-border space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted">Cliente</span>
            <span className="text-sm font-semibold text-text-primary">{visit?.customer_name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted">Litros</span>
            <span className="text-sm font-bold text-brand-primary">{activeVisit.liters || '0'}L</span>
          </div>

          {/* Aceite */}
          <div className="border-t border-brand-border pt-2">
            <p className="text-xs font-semibold text-text-secondary mb-2">Aceite usado - pago al cliente</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">Pago</span>
              <span className={`text-sm font-medium ${activeVisit.oilPaid ? 'text-emerald-700' : 'text-red-600'}`}>
                {activeVisit.oilPaid ? `Pagado $${(activeVisit.totalOilPayment || 0).toLocaleString('es-AR')}` : 'No se pagó'}
              </span>
            </div>
          </div>

          {/* Detergente - solo cantidad de bidones */}
          {activeVisit.detergentDelivered && (
            <div className="border-t border-brand-border pt-2">
              <p className="text-xs font-semibold text-text-secondary mb-2">Detergente entregado</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Bidones de 5L</span>
                <span className="text-sm font-medium text-text-primary">{activeVisit.detergentQuantity} unidades</span>
              </div>
              <div className="mt-1">
                <span className="text-xs text-sky-600 bg-sky-50 px-2 py-1 rounded-full">Entregado sin costo</span>
              </div>
            </div>
          )}

          {/* Total pagado - solo aceite */}
          {activeVisit.totalOilPayment > 0 && (
            <div className="border-t border-brand-border pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-text-primary">Total pagado al cliente</span>
                <span className="text-lg font-bold text-emerald-700">
                  ${(activeVisit.totalOilPayment || 0).toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted">Receptor</span>
            <span className="text-sm font-medium text-text-primary">{activeVisit.receiverName || '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted">Otros productos</span>
            <span className="text-sm font-medium text-text-primary">{activeVisit.products || '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted">Fotos</span>
            <span className="text-sm font-medium text-text-primary">{activeVisit.photos.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted">GPS</span>
            <span className="text-xs font-mono text-text-secondary">Capturado</span>
          </div>
          {activeVisit.observations && (
            <div>
              <span className="text-sm text-text-muted">Observaciones</span>
              <p className="text-sm text-text-primary mt-1">{activeVisit.observations}</p>
            </div>
          )}
        </div>

        <button
          onClick={onFinish}
          type="button"
          className="w-full py-4 bg-emerald-600 text-white rounded-xl text-base font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <i className="ri-check-double-line text-xl" />
          Finalizar visita
        </button>
      </div>
    </div>
  );
}