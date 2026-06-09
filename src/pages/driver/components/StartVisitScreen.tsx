import { useState } from 'react';
import type { RouteVisit } from '@/mocks/driverApp';

interface StartVisitScreenProps {
  visit: RouteVisit;
  onBack: () => void;
  onContinue: (status: 'Open' | 'Closed' | 'NoOil' | 'Rejected' | 'Delayed', arrivedAt: string) => void;
}

export default function StartVisitScreen({ visit, onBack, onContinue }: StartVisitScreenProps) {
  const [status, setStatus] = useState<'Open' | 'Closed' | 'NoOil' | 'Rejected' | 'Delayed'>('Open');
  const arrivedAt = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-brand-bg pb-6">
      <div className="bg-brand-primary text-white p-4">
        <button onClick={onBack} type="button" className="flex items-center gap-1 text-white/70 hover:text-white mb-2 transition-colors">
          <i className="ri-arrow-left-line" /> Volver
        </button>
        <h1 className="text-lg font-bold">Iniciar visita</h1>
        <p className="text-xs opacity-80">{visit.customer_name}</p>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Hora llegada automática */}
        <div className="bg-white rounded-xl p-4 border border-brand-border">
          <p className="text-sm font-semibold text-text-primary mb-1">Hora de llegada</p>
          <div className="flex items-center gap-2">
            <i className="ri-time-line text-brand-primary text-lg" />
            <span className="text-2xl font-bold text-text-primary">{arrivedAt}</span>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Automático</span>
          </div>
        </div>

        {/* GPS automático */}
        <div className="bg-white rounded-xl p-4 border border-brand-border">
          <p className="text-sm font-semibold text-text-primary mb-1">GPS</p>
          <div className="flex items-center gap-2">
            <i className="ri-map-pin-line text-brand-primary text-lg" />
            <span className="text-sm font-mono text-text-secondary">{visit.lat.toFixed(4)}, {visit.lng.toFixed(4)}</span>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Capturado</span>
          </div>
        </div>

        {/* Estado */}
        <div className="bg-white rounded-xl p-4 border border-brand-border">
          <p className="text-sm font-semibold text-text-primary mb-3">Estado</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'Open', label: 'Cliente abierto', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
              { value: 'Closed', label: 'Cliente cerrado', color: 'bg-red-100 text-red-700 border-red-200' },
              { value: 'NoOil', label: 'Sin aceite', color: 'bg-blue-100 text-blue-700 border-blue-200' },
              { value: 'Rejected', label: 'Rechazado', color: 'bg-gray-100 text-gray-700 border-gray-200' },
              { value: 'Delayed', label: 'Cliente demorado', color: 'bg-amber-100 text-amber-800 border-amber-300' },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                type="button"
                className={`px-3 py-3 rounded-xl text-sm font-medium border text-center transition-colors whitespace-nowrap ${
                  status === opt.value ? opt.color + ' ring-2 ring-offset-1 ring-brand-primary/30' : 'bg-white text-text-secondary border-brand-border hover:bg-brand-light'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onContinue(status, arrivedAt)}
          type="button"
          className="w-full py-4 bg-brand-green text-white rounded-xl text-base font-bold hover:bg-brand-green/90 transition-colors whitespace-nowrap"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}