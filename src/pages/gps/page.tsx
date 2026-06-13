import { useState } from 'react';
import { useGPS } from '@/hooks/useGPS';
import GPSMap from './components/GPSMap';

function getStatusBadge(status: 'online' | 'ack' | 'offline') {
  switch (status) {
    case 'online':
      return { dot: 'bg-emerald-500 animate-pulse', label: 'En ruta' };
    case 'ack':
      return { dot: 'bg-yellow-500', label: 'Detenido' };
    case 'offline':
      return { dot: 'bg-red-500', label: 'Sin señal' };
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function GPSPage() {
  const { trucks, loading, error, lastUpdated, refresh } = useGPS();
  const [selectedTruckId, setSelectedTruckId] = useState<number | null>(null);
  const [pulseKey, setPulseKey] = useState(0);

  const handleRefresh = () => {
    setPulseKey(k => k + 1);
    refresh();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">GPS Tracking</h1>
        <p className="text-sm text-text-secondary mt-1">
          Monitoreo en tiempo real de la flota via ControlSat
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white rounded-xl p-4 border border-brand-border/60">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-text-primary">Flota</h3>
              <span key={pulseKey} className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            {lastUpdated && (
              <p className="text-xs text-text-muted">
                Última actualización: {formatTime(lastUpdated)}
              </p>
            )}
          </div>

          {loading && trucks.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-sm text-red-600 mb-3">{error}</p>
              <button
                onClick={handleRefresh}
                className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {trucks.map(truck => {
            const badge = getStatusBadge(truck.status);
            return (
              <div
                key={truck.deviceId}
                onClick={() => setSelectedTruckId(truck.deviceId)}
                className={`bg-white rounded-xl p-4 border transition-colors cursor-pointer ${
                  selectedTruckId === truck.deviceId
                    ? 'border-brand-green/50 shadow-md'
                    : 'border-brand-border/60 hover:border-brand-green/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                      <i className="ri-truck-line text-brand-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{truck.name}</p>
                    </div>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <i className="ri-speed-line" />
                    {truck.speed} km/h
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="ri-map-pin-line" />
                    {truck.lat.toFixed(4)}, {truck.lng.toFixed(4)}
                  </span>
                  {truck.time && (
                    <span className="flex items-center gap-1">
                      <i className="ri-time-line" />
                      {truck.time}
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    truck.status === 'online' ? 'bg-emerald-100 text-emerald-700' :
                    truck.status === 'ack' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl border border-brand-border/60 overflow-hidden">
          <div className="p-4 border-b border-brand-border/60 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Mapa en Vivo</h3>
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                En ruta
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Detenido
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Sin señal
              </span>
            </div>
          </div>
          <GPSMap trucks={trucks} selectedTruckId={selectedTruckId} />
        </div>
      </div>
    </div>
  );
}