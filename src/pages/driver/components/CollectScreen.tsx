import { useState, useEffect } from 'react';
import type { ActiveVisitState } from '../types';

const OIL_PRICE = 800;

interface CollectScreenProps {
  activeVisit: ActiveVisitState;
  onBack: () => void;
  onContinue: (data: Partial<ActiveVisitState>) => void;
}

export default function CollectScreen({ activeVisit, onBack, onContinue }: CollectScreenProps) {
  const [liters, setLiters] = useState(activeVisit.liters || '');
  const [receiverName, setReceiverName] = useState(activeVisit.receiverName || '');
  const [receiverDni, setReceiverDni] = useState(activeVisit.receiverDni || '');

  // Aceite - se pagó / no se pagó (la empresa le paga al cliente)
  const [oilPaid, setOilPaid] = useState(activeVisit.oilPaid || false);
  const [oilAmount, setOilAmount] = useState(activeVisit.oilAmount || '');

  // Detergente - solo control de bidones entregados (gratis, no se paga ni cobra)
  const [detergentDelivered, setDetergentDelivered] = useState(activeVisit.detergentDelivered || false);
  const [detergentQuantity, setDetergentQuantity] = useState(activeVisit.detergentQuantity || '');

  const [products, setProducts] = useState(activeVisit.products || '');
  const [observations, setObservations] = useState(activeVisit.observations || '');

  const litersNum = Number(liters) || 0;
  const autoOilTotal = litersNum * OIL_PRICE;
  const oilAmountNum = Number(oilAmount) || 0;
  const oilTotal = oilPaid ? (oilAmountNum > 0 ? oilAmountNum : autoOilTotal) : 0;

  const detergentQtyNum = Number(detergentQuantity) || 0;

  // Auto-fill oil amount when liters change and oil is paid
  useEffect(() => {
    if (oilPaid && litersNum > 0 && !oilAmount) {
      setOilAmount(String(autoOilTotal));
    }
  }, [litersNum, oilPaid, autoOilTotal, oilAmount]);

  // Reset detergent when not delivered
  useEffect(() => {
    if (!detergentDelivered) {
      setDetergentQuantity('');
    }
  }, [detergentDelivered]);

  const handleContinue = () => {
    onContinue({
      liters,
      receiverName,
      receiverDni,
      oilPaid,
      oilAmount,
      oilPriceAtCollection: OIL_PRICE,
      totalOilPayment: oilTotal,
      products,
      observations,
      detergentDelivered,
      detergentQuantity,
      totalDetergentPayment: 0,
    });
  };

  return (
    <div className="min-h-screen bg-brand-bg pb-6">
      <div className="bg-brand-primary text-white p-4">
        <button onClick={onBack} type="button" className="flex items-center gap-1 text-white/70 hover:text-white mb-2 transition-colors">
          <i className="ri-arrow-left-line" /> Volver
        </button>
        <h1 className="text-lg font-bold">Registro de retiro</h1>
        <p className="text-xs opacity-80">Complete los datos de la visita</p>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Litros recolectados */}
        <div className="bg-white rounded-xl p-4 border border-brand-border">
          <label className="text-sm font-semibold text-text-primary block mb-2">Litros recolectados</label>
          <input
            type="number"
            placeholder="0"
            value={liters}
            onChange={(e) => setLiters(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-brand-light border border-brand-border text-2xl text-center font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          />
          <p className="text-xs text-text-muted mt-1 text-center">Ingrese la cantidad en litros</p>
        </div>

        {/* Aceite - Se pagó / No se pagó (la empresa le paga al cliente) */}
        {litersNum > 0 && (
          <div className="bg-white rounded-xl p-4 border border-brand-border space-y-3">
            <p className="text-sm font-semibold text-text-primary">Aceite usado - pago al cliente</p>
            <p className="text-xs text-text-muted">Indique si la empresa le pagó al cliente por el aceite retirado</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setOilPaid(true);
                  if (!oilAmount) setOilAmount(String(autoOilTotal));
                }}
                type="button"
                className={`py-3 rounded-xl text-sm font-medium border transition-colors whitespace-nowrap ${
                  oilPaid === true
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-2 ring-offset-1 ring-emerald-300/50'
                    : 'bg-brand-light text-text-secondary border-brand-border hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-money-dollar-circle-line text-lg" />
                  Se pagó
                </span>
              </button>
              <button
                onClick={() => {
                  setOilPaid(false);
                  setOilAmount('');
                }}
                type="button"
                className={`py-3 rounded-xl text-sm font-medium border transition-colors whitespace-nowrap ${
                  oilPaid === false
                    ? 'bg-red-100 text-red-800 border-red-300 ring-2 ring-offset-1 ring-red-300/50'
                    : 'bg-brand-light text-text-secondary border-brand-border hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-close-circle-line text-lg" />
                  No se pagó
                </span>
              </button>
            </div>

            {oilPaid === true && (
              <div className="pt-2 border-t border-brand-border space-y-2">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Calculo automatico: {litersNum}L x ${OIL_PRICE}/L</span>
                  <span className="font-medium">${autoOilTotal.toLocaleString('es-AR')}</span>
                </div>
                <label className="text-xs font-medium text-text-secondary block">Monto real pagado</label>
                <input
                  type="number"
                  placeholder={`$${autoOilTotal}`}
                  value={oilAmount}
                  onChange={(e) => setOilAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-brand-light border border-brand-border text-lg font-bold text-center text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
                />
                <p className="text-xs text-text-muted">Puede modificar el monto si el pago fue diferente</p>
              </div>
            )}

            {oilPaid === false && (
              <div className="pt-2 border-t border-brand-border">
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
                  <i className="ri-information-line" />
                  <span>El aceite fue retirado sin pago al cliente</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detergente - solo control de bidones entregados */}
        <div className="bg-white rounded-xl p-4 border border-brand-border space-y-3">
          <div className="flex items-center gap-2">
            <i className="ri-drop-line text-sky-500 text-lg" />
            <p className="text-sm font-semibold text-text-primary">Detergente</p>
          </div>
          <p className="text-xs text-text-muted">Indique si se entregó detergente al cliente (bidones de 5L - sin costo)</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDetergentDelivered(true)}
              type="button"
              className={`py-3 rounded-xl text-sm font-medium border transition-colors whitespace-nowrap ${
                detergentDelivered === true
                  ? 'bg-sky-100 text-sky-800 border-sky-300 ring-2 ring-offset-1 ring-sky-300/50'
                  : 'bg-brand-light text-text-secondary border-brand-border hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <i className="ri-check-line text-lg" />
                Se entregó
              </span>
            </button>
            <button
              onClick={() => setDetergentDelivered(false)}
              type="button"
              className={`py-3 rounded-xl text-sm font-medium border transition-colors whitespace-nowrap ${
                detergentDelivered === false
                  ? 'bg-gray-100 text-gray-700 border-gray-300 ring-2 ring-offset-1 ring-gray-300/50'
                  : 'bg-brand-light text-text-secondary border-brand-border hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <i className="ri-close-line text-lg" />
                No se entregó
              </span>
            </button>
          </div>

          {detergentDelivered && (
            <div className="pt-2 border-t border-brand-border space-y-3">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Cantidad de bidones entregados (5L cada uno)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={detergentQuantity}
                  onChange={(e) => setDetergentQuantity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-brand-light border border-brand-border text-lg font-bold text-center text-text-primary focus:outline-none focus:ring-2 focus:ring-sky-300/50"
                />
                <p className="text-xs text-text-muted mt-1">Cada bidón contiene 5 litros de detergente</p>
              </div>
            </div>
          )}
        </div>

        {/* Resumen de pago - solo aceite */}
        {oilTotal > 0 && (
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <p className="text-sm font-semibold text-emerald-800 mb-2">Resumen de pagos</p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-emerald-700">Aceite</span>
                <span className="font-bold text-emerald-800">${oilTotal.toLocaleString('es-AR')}</span>
              </div>
              <div className="border-t border-emerald-200 pt-2 mt-2 flex justify-between">
                <span className="text-sm font-semibold text-emerald-800">Total a pagar</span>
                <span className="text-xl font-bold text-emerald-800">${oilTotal.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Receptor */}
        <div className="bg-white rounded-xl p-4 border border-brand-border space-y-3">
          <label className="text-sm font-semibold text-text-primary block">Nombre del receptor</label>
          <input
            type="text"
            placeholder="Nombre completo"
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          />
          <label className="text-sm font-semibold text-text-primary block">DNI del receptor</label>
          <input
            type="text"
            placeholder="Numero de DNI"
            value={receiverDni}
            onChange={(e) => setReceiverDni(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          />
        </div>

        {/* Productos entregados (legacy) */}
        <div className="bg-white rounded-xl p-4 border border-brand-border">
          <label className="text-sm font-semibold text-text-primary block mb-2">Otros productos entregados</label>
          <input
            type="text"
            placeholder="Ej: Bidon limpio 20L x2"
            value={products}
            onChange={(e) => setProducts(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          />
        </div>

        {/* Observaciones */}
        <div className="bg-white rounded-xl p-4 border border-brand-border">
          <label className="text-sm font-semibold text-text-primary block mb-2">Observaciones</label>
          <textarea
            placeholder="Notas adicionales..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30 resize-none"
          />
          <p className="text-xs text-text-muted mt-1 text-right">{observations.length}/500</p>
        </div>

        <button
          onClick={handleContinue}
          type="button"
          className="w-full py-4 bg-brand-green text-white rounded-xl text-base font-bold hover:bg-brand-green/90 transition-colors whitespace-nowrap"
        >
          Continuar a evidencia
        </button>
      </div>
    </div>
  );
}