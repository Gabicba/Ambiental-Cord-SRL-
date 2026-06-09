import { driverAppData } from '@/mocks/driverApp';

interface ProfileScreenProps {
  onBack: () => void;
}

export default function ProfileScreen({ onBack }: ProfileScreenProps) {
  const { driver } = driverAppData;

  return (
    <div className="min-h-screen bg-brand-bg pb-6">
      <div className="bg-brand-primary text-white p-4">
        <button onClick={onBack} type="button" className="flex items-center gap-1 text-white/70 hover:text-white mb-2 transition-colors">
          <i className="ri-arrow-left-line" /> Volver
        </button>
        <h1 className="text-lg font-bold">Perfil</h1>
      </div>

      <div className="px-4 mt-4 space-y-3">
        <div className="bg-white rounded-xl p-6 border border-brand-border text-center">
          <div className="w-20 h-20 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-3">
            <i className="ri-user-line text-3xl text-brand-primary" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">{driver.name}</h2>
          <p className="text-sm text-text-muted">{driver.license_type} · {driver.license_number}</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <i className="ri-star-fill text-amber-400 text-sm" />
            <span className="text-sm font-medium text-text-primary">{driver.rating}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-brand-border space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-text-muted">DNI</span>
            <span className="text-sm font-medium text-text-primary">{driver.dni}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-muted">Teléfono</span>
            <span className="text-sm font-medium text-text-primary">{driver.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-muted">Licencia vence</span>
            <span className="text-sm font-medium text-text-primary">{new Date(driver.license_expiry).toLocaleDateString('es-AR')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-muted">Rutas completadas</span>
            <span className="text-sm font-medium text-text-primary">{driver.routes_completed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-muted">Litros totales</span>
            <span className="text-sm font-medium text-brand-primary">{driver.total_liters.toLocaleString('es-AR')}L</span>
          </div>
        </div>
      </div>
    </div>
  );
}