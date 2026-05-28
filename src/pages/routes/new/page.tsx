import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockTrucks } from '@/mocks/trucks';
import { mockDrivers } from '@/mocks/drivers';
import { mockCustomers } from '@/mocks/customers';
import { mockCompanions } from '@/mocks/companions';

export default function RouteNewPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [truckId, setTruckId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [companionId, setCompanionId] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [saving, setSaving] = useState(false);

  const availableTrucks = mockTrucks.filter(
    (t) => t.status === 'Active' || t.status === 'On_Route'
  );
  const availableDrivers = mockDrivers.filter(
    (d) => d.status === 'Active' || d.status === 'On_Route'
  );

  const filteredCustomers = useMemo(() => {
    return mockCustomers.filter(
      (c) =>
        c.status === 'Active' &&
        !selectedCustomers.includes(c.id) &&
        (c.fantasy_name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
          c.address.toLowerCase().includes(searchCustomer.toLowerCase()))
    );
  }, [searchCustomer, selectedCustomers]);

  const selectedCustomerList = mockCustomers.filter((c) =>
    selectedCustomers.includes(c.id)
  );

  const toggleCustomer = (id: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!name || !date || !truckId || !driverId || selectedCustomers.length === 0) return;
    setSaving(true);
    setTimeout(() => {
      navigate('/routes');
    }, 800);
  };

  const isValid = name && date && truckId && driverId && selectedCustomers.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Nueva Hoja de Ruta</h1>
        <p className="text-sm text-text-secondary mt-1">
          Planificar recorrido de recoleccion de aceite usado
        </p>
      </div>

      <div className="bg-white rounded-xl border border-brand-border/60 p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
              Nombre de la Ruta
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Ruta Centro - Zona Norte"
              className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>
        </div>

        {/* Truck & Driver */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
              Camion
            </label>
            <select
              value={truckId}
              onChange={(e) => setTruckId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30 appearance-none cursor-pointer"
            >
              <option value="">Seleccionar camion</option>
              {availableTrucks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.plate} - {t.model} ({t.capacity_liters.toLocaleString()} L)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
              Conductor
            </label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30 appearance-none cursor-pointer"
            >
              <option value="">Seleccionar conductor</option>
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} - Licencia {d.license_type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Companion */}
        <div>
          <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
            Acompañante (Opcional)
          </label>
          <select
            value={companionId}
            onChange={(e) => setCompanionId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30 appearance-none cursor-pointer"
          >
            <option value="">Sin acompañante</option>
            {mockCompanions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} - DNI {c.dni}
              </option>
            ))}
          </select>
        </div>

        {/* Selected truck/driver preview */}
        {(truckId || driverId || companionId) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {truckId && (
              <div className="bg-brand-light rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                  <i className="ri-truck-line text-brand-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {mockTrucks.find((t) => t.id === truckId)?.plate}
                  </p>
                  <p className="text-xs text-text-muted">
                    {mockTrucks.find((t) => t.id === truckId)?.model}
                  </p>
                </div>
              </div>
            )}
            {driverId && (
              <div className="bg-brand-light rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-sm font-bold text-brand-green">
                  {mockDrivers.find((d) => d.id === driverId)?.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {mockDrivers.find((d) => d.id === driverId)?.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    DNI {mockDrivers.find((d) => d.id === driverId)?.dni}
                  </p>
                </div>
              </div>
            )}
            {companionId && (
              <div className="bg-brand-light rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sm font-bold text-sky-600">
                  {mockCompanions.find((c) => c.id === companionId)?.full_name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {mockCompanions.find((c) => c.id === companionId)?.full_name}
                  </p>
                  <p className="text-xs text-text-muted">
                    DNI {mockCompanions.find((c) => c.id === companionId)?.dni}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customer Selection */}
        <div className="border-t border-brand-border/40 pt-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Clientes a Visitar</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Available customers */}
            <div className="bg-brand-light rounded-xl p-4">
              <div className="relative mb-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                  <i className="ri-search-line" />
                </span>
                <input
                  type="text"
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  placeholder="Buscar clientes..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                />
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {filteredCustomers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggleCustomer(c.id)}
                    type="button"
                    className="w-full text-left p-3 rounded-lg bg-white border border-brand-border/60 hover:border-brand-green/40 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{c.fantasy_name}</p>
                        <p className="text-xs text-text-muted mt-0.5">{c.address}</p>
                        <p className="text-xs text-text-muted">{c.phone}</p>
                      </div>
                      <div className="w-6 h-6 rounded-full border-2 border-brand-border flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="ri-add-line text-xs text-text-muted" />
                      </div>
                    </div>
                  </button>
                ))}
                {filteredCustomers.length === 0 && (
                  <p className="text-xs text-text-muted text-center py-4">
                    No hay clientes disponibles
                  </p>
                )}
              </div>
            </div>

            {/* Selected customers */}
            <div className="bg-white rounded-xl border border-brand-border/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-text-primary">
                  Seleccionados: {selectedCustomers.length}
                </span>
                {selectedCustomers.length > 0 && (
                  <button
                    onClick={() => setSelectedCustomers([])}
                    type="button"
                    className="text-xs text-red-500 hover:text-red-600 transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {selectedCustomerList.map((c, index) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-lg bg-brand-light border border-brand-border/40 flex items-start justify-between gap-2"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand-primary/10 flex items-center justify-center text-[10px] font-bold text-brand-primary flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{c.fantasy_name}</p>
                        <p className="text-xs text-text-muted">{c.address}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleCustomer(c.id)}
                      type="button"
                      className="text-text-muted hover:text-red-500 transition-colors p-0.5"
                    >
                      <i className="ri-close-line" />
                    </button>
                  </div>
                ))}
                {selectedCustomerList.length === 0 && (
                  <div className="text-center py-8">
                    <i className="ri-map-pin-line text-3xl text-brand-border mb-2" />
                    <p className="text-xs text-text-muted">Selecciona clientes del panel izquierdo</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        {isValid && (
          <div className="bg-brand-green/5 border border-brand-green/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-brand-green mb-2">Resumen</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
              <div>
                <p className="text-xs text-text-muted">Ruta</p>
                <p className="font-medium text-text-primary">{name}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Fecha</p>
                <p className="font-medium text-text-primary">{date}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Clientes</p>
                <p className="font-medium text-text-primary">{selectedCustomers.length}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Camion</p>
                <p className="font-medium text-text-primary">
                  {mockTrucks.find((t) => t.id === truckId)?.plate}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Acompañante</p>
                <p className="font-medium text-text-primary">
                  {companionId ? mockCompanions.find((c) => c.id === companionId)?.full_name : '—'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => navigate('/routes')}
            type="button"
            className="px-5 py-2.5 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            type="button"
            className={`px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap ${
              isValid && !saving
                ? 'bg-brand-green hover:bg-brand-green/90'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <i className="ri-loader-4-line animate-spin" />
                Creando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <i className="ri-check-line" />
                Crear Ruta
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}