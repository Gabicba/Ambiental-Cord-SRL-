import { driverAppData } from '@/mocks/driverApp';

interface HomeScreenProps {
  routeStarted: boolean;
  onStartRoute: () => void;
  onOpenRoute: () => void;
  onOpenMenu: () => void;
}

const { driver, truck, todayRoute, todayVisits } = driverAppData;

export default function HomeScreen({ routeStarted, onStartRoute, onOpenRoute, onOpenMenu }: HomeScreenProps) {
  const completed = todayVisits.filter((v) => v.status === 'Visited').length;
  const pending = todayVisits.filter((v) => v.status === 'Pending').length;
  const totalLiters = todayVisits.reduce((sum, v) => sum + (v.liters_collected || 0), 0);
  const nextPending = todayVisits.find((v) => v.status === 'Pending');

  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d52563.491540363!2d-58.44093!3d-34.6037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM2JzEzLjMiUyA1OMKwMjMnMzMuOSJX!5e0!3m2!1ses!2sar!4v1600000000000!5m2!1ses!2sar`;

  return (
    <div className="min-h-screen bg-brand-bg pb-24">
      {/* Header */}
      <div className="bg-brand-primary text-white p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onOpenMenu} type="button" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <i className="ri-menu-line text-lg" />
          </button>
          <span className="text-sm font-medium opacity-80">Inicio</span>
          <div className="w-9" />
        </div>
        <div className="space-y-1">
          <p className="text-sm opacity-80">👤 Chofer: <span className="font-semibold opacity-100">{driver.name}</span></p>
          <p className="text-sm opacity-80">🚚 Camión: <span className="font-semibold opacity-100">{truck.plate}</span></p>
          <p className="text-sm opacity-80">📍 Ruta: <span className="font-semibold opacity-100">{todayRoute.name}</span></p>
          <p className="text-sm opacity-80">📅 Fecha: <span className="font-semibold opacity-100">Hoy</span></p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="px-4 -mt-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 border border-brand-border">
            <p className="text-xs text-text-muted">Clientes pendientes</p>
            <p className="text-2xl font-bold text-text-primary">{pending}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-brand-border">
            <p className="text-xs text-text-muted">Completados</p>
            <p className="text-2xl font-bold text-emerald-600">{completed}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-brand-border">
            <p className="text-xs text-text-muted">Litros recolectados</p>
            <p className="text-2xl font-bold text-brand-primary">{totalLiters}L</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-brand-border">
            <p className="text-xs text-text-muted">Hora inicio</p>
            <p className="text-2xl font-bold text-text-primary">{routeStarted ? '08:00' : '--:--'}</p>
          </div>
        </div>
      </div>

      {/* Start route button */}
      <div className="px-4 mt-4">
        {!routeStarted ? (
          <button
            onClick={onStartRoute}
            type="button"
            className="w-full py-4 bg-brand-green text-white rounded-xl text-base font-bold hover:bg-brand-green/90 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <i className="ri-play-circle-line text-xl" />
            Iniciar recorrido
          </button>
        ) : (
          <button
            onClick={onOpenRoute}
            type="button"
            className="w-full py-4 bg-white text-brand-primary border-2 border-brand-primary rounded-xl text-base font-bold hover:bg-brand-primary/5 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <i className="ri-map-pin-line text-xl" />
            Ver hoja de ruta
          </button>
        )}
      </div>

      {/* Map */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl overflow-hidden border border-brand-border">
          <div className="px-4 py-3 border-b border-brand-border flex items-center justify-between">
            <span className="text-sm font-semibold text-text-primary">Recorrido de hoy</span>
            <span className="text-xs text-text-muted">{todayVisits.length} paradas</span>
          </div>
          <div className="w-full h-56">
            <iframe
              title="Mapa recorrido"
              src={mapUrl}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Quick list */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-semibold text-text-primary mb-2">Próximos clientes</h3>
        <div className="space-y-2">
          {todayVisits.slice(0, 4).map((visit) => {
            const isDone = visit.status === 'Visited' || visit.status === 'Closed' || visit.status === 'No_Oil';
            const isNext = visit.id === nextPending?.id;
            return (
              <div
                key={visit.id}
                onClick={isNext ? onOpenRoute : undefined}
                className={`bg-white rounded-xl p-3 border flex items-center gap-3 cursor-pointer transition-colors ${
                  isNext ? 'border-brand-primary' : 'border-brand-border'
                } ${isDone ? 'opacity-60' : ''}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDone ? 'bg-emerald-100 text-emerald-600' : isNext ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  <i className={`${isDone ? 'ri-check-line' : isNext ? 'ri-navigation-line' : 'ri-circle-line'} text-base`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{visit.customer_name}</p>
                  <p className="text-xs text-text-muted truncate">{visit.address}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  visit.status === 'Visited' ? 'bg-emerald-100 text-emerald-700' :
                  visit.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                  visit.status === 'Closed' ? 'bg-red-100 text-red-700' :
                  visit.status === 'No_Oil' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {visit.status === 'Visited' ? 'Completado' :
                   visit.status === 'Pending' ? 'Pendiente' :
                   visit.status === 'Closed' ? 'Cerrado' :
                   visit.status === 'No_Oil' ? 'Sin aceite' : visit.status}
                </span>
              </div>
            );
          })}
          {todayVisits.length > 4 && (
            <button onClick={onOpenRoute} type="button" className="w-full py-2 text-sm text-brand-primary font-medium hover:underline">
              Ver todos los clientes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}