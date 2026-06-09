import { useState } from 'react';
import type { RouteVisit } from '@/mocks/driverApp';
import type { ActiveVisitState } from '../types';

interface DelayedScreenProps {
  visit: RouteVisit;
  activeVisit: ActiveVisitState;
  onBack: () => void;
  onContinue: (delayReason: string, delayReturnTime: string) => void;
}

export default function DelayedScreen({ visit, onBack, onContinue }: DelayedScreenProps) {
  const [delayReason, setDelayReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [returnTime, setReturnTime] = useState('');

  const reasons = [
    'Cliente vuelve en 10 minutos',
    'Esperando al encargado',
    'Cerrado temporalmente',
    'Otro',
  ];

  const selectedReason = delayReason === 'Otro' ? customReason : delayReason;

  const handleContinue = () => {
    if (!selectedReason.trim()) return;
    onContinue(selectedReason, returnTime);
  };

  return (
    <div className="min-h-screen bg-brand-bg pb-6">
      <div className="bg-amber-500 text-white p-4">
        <button onClick={onBack} type="button" className="flex items-center gap-1 text-white/70 hover:text-white mb-2 transition-colors">
          <i className="ri-arrow-left-line" /> Volver
        </button>
        <h1 className="text-lg font-bold">Cliente demorado</h1>
        <p className="text-xs opacity-80">{visit.customer_name}</p>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <div className="bg-white rounded-xl p-4 border border-brand-border">
          <p className="text-sm font-semibold text-text-primary mb-3">Motivo de la demora</p>
          <div className="space-y-2">
            {reasons.map((r) => (
              <button
                key={r}
                onClick={() => setDelayReason(r)}
                type="button"
                className={`w-full px-3 py-3 rounded-xl text-sm font-medium border text-left transition-colors whitespace-nowrap ${
                  delayReason === r
                    ? 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-300'
                    : 'bg-white text-text-secondary border-brand-border hover:bg-brand-light'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {delayReason === 'Otro' && (
            <div className="mt-3">
              <textarea
                placeholder="Describa el motivo..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                maxLength={200}
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-400/30 resize-none"
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 border border-brand-border">
          <p className="text-sm font-semibold text-text-primary mb-2">Hora estimada de retorno</p>
          <input
            type="time"
            value={returnTime}
            onChange={(e) => setReturnTime(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-brand-light border border-brand-border text-lg text-center font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-400/30"
          />
          <p className="text-xs text-text-muted mt-1 text-center">Opcional - estimacion de cuando volver</p>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-start gap-3">
            <i className="ri-information-line text-amber-600 text-lg mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Podras volver mas tarde</p>
              <p className="text-xs text-amber-700 mt-1">
                El cliente quedara marcado como &quot;Demorado&quot;. Podras continuar con los siguientes paradas y volver a este cliente cuando este disponible.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedReason.trim()}
          type="button"
          className="w-full py-4 bg-amber-500 text-white rounded-xl text-base font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Guardar y continuar recorrido
        </button>
      </div>
    </div>
  );
}