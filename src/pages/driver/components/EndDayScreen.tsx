import { useState } from 'react';
import { driverAppData } from '@/mocks/driverApp';

interface EndDayScreenProps {
  onCloseDay: () => void;
}

export default function EndDayScreen({ onCloseDay }: EndDayScreenProps) {
  const [closing, setClosing] = useState(false);
  const { todayVisits } = driverAppData;
  const visited = todayVisits.filter((v) => v.status === 'Visited').length;
  const total = todayVisits.length;
  const totalLiters = todayVisits.reduce((sum, v) => sum + (v.liters_collected || 0), 0);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onCloseDay();
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 border border-brand-border space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <i className="ri-flag-line text-3xl text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">Fin de jornada</h1>
          <p className="text-sm text-text-muted">Resumen del día</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-brand-light rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-text-primary">{visited}/{total}</p>
            <p className="text-xs text-text-muted">Clientes</p>
          </div>
          <div className="bg-brand-light rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-brand-primary">{totalLiters}L</p>
            <p className="text-xs text-text-muted">Litros</p>
          </div>
          <div className="bg-brand-light rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-text-primary">8h</p>
            <p className="text-xs text-text-muted">Tiempo</p>
          </div>
          <div className="bg-brand-light rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{visited === total ? 'Completo' : 'Parcial'}</p>
            <p className="text-xs text-text-muted">Recorrido</p>
          </div>
        </div>

        <button
          onClick={handleClose}
          disabled={closing}
          type="button"
          className="w-full py-4 bg-brand-primary text-white rounded-xl text-base font-bold hover:bg-brand-primary/90 transition-colors disabled:opacity-70 whitespace-nowrap"
        >
          {closing ? (
            <span className="flex items-center justify-center gap-2">
              <i className="ri-loader-4-line animate-spin text-xl" />
              Cerrando...
            </span>
          ) : (
            'Cerrar jornada'
          )}
        </button>
      </div>
    </div>
  );
}