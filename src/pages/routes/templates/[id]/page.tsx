import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockRouteTemplates } from '@/mocks/route_templates';
import { mockCustomers } from '@/mocks/customers';
import { mockTrucks } from '@/mocks/trucks';
import { mockDrivers } from '@/mocks/drivers';

export default function RouteTemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [date, setDate] = useState('');
  const [truckId, setTruckId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customerOrder, setCustomerOrder] = useState<Record<string, number>>();
  const [searchCustomer, setSearchCustomer] = useState('');
  const [saving, setSaving] = useState(false);

  const template = mockRouteTemplates.find((t) => t.id === id);

  useEffect(() => {
    if (template) {
      setSelectedCustomers(template.customer_ids);
      setCustomerOrder(template.visit_order);
    }
  }, [template]);

  const activeCustomers = mockCustomers.filter((c) => c.status === 'Active');
  const availableTrucks = mockTrucks.filter(
    (t) => t.status === 'Active' || t.status === 'On_Route'
  );
  const availableDrivers = mockDrivers.filter(
    (d) => d.status === 'Active' || d.status === 'On_Route'
  );

  const filteredCustomers = useMemo(() => {
    return activeCustomers.filter(
      (c) =>
        !selectedCustomers.includes(c.id) &&
        (c.fantasy_name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
          c.address.toLowerCase().includes(searchCustomer.toLowerCase()))
    );
  }, [searchCustomer, selectedCustomers, activeCustomers]);

  if (!template) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-text-muted">Plantilla no encontrada</p>
        <button
          onClick={() => navigate('/routes/templates')}
          type="button"
          className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm"
        >
          Volver
        </button>
      </div>
    );
  }

  const selectedCustomerList = selectedCustomers
    .map((sid) => activeCustomers.find((c) => c.id === sid))
    .filter(Boolean)
    .sort((a, b) => {
      const orderA = customerOrder[a!.id] || 0;
      const orderB = customerOrder[b!.id] || 0;
      return orderA - orderB;
    });

  const toggleCustomer = (cid: string) => {
    setSelectedCustomers((prev) => {
      if (prev.includes(cid)) {
        const next = prev.filter((x) => x !== cid);
        setCustomerOrder((o) => {
          const copy = { ...o };
          delete copy[cid];
          let idx = 1;
          next.forEach((nid) => {
            if (copy[nid]) copy[nid] = idx++;
          });
          return copy;
        });
        return next;
      }
      const next = [...prev, cid];
      setCustomerOrder((o) => ({ ...o, [cid]: next.length }));
      return next;
    });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const list = [...selectedCustomerList];
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
    const newOrder: Record<string, number> = {};
    list.forEach((c, i) => {
      if (c) newOrder[c.id] = i + 1;
    });
    setCustomerOrder(newOrder);
    setSelectedCustomers(list.map((c) => c!.id));
  };

  const moveDown = (index: number) => {
    if (index >= selectedCustomerList.length - 1) return;
    const list = [...selectedCustomerList];
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    const newOrder: Record<string, number> = {};
    list.forEach((c, i) => {
      if (c) newOrder[c.id] = i + 1;
    });
    setCustomerOrder(newOrder);
    setSelectedCustomers(list.map((c) => c!.id));
  };

  const handleCreateRoute = () => {
    if (!date || !truckId || !driverId || selectedCustomers.length === 0) return;
    setSaving(true);
    setTimeout(() => {
      navigate('/routes');
    }, 1000);
  };

  const isValid = date && truckId && driverId && selectedCustomers.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/routes/templates')}
          type="button"
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <i className="ri-arrow-left-line" />
          Plantillas
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{template.name}</h1>
          <p className="text-sm text-text-secondary mt-1">{template.description}</p>
        </div>
        <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-medium">
          {selectedCustomers.length} clientes
        </span>
      </div>

      {template.notes ? (
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-start gap-3">
            <i className="ri-information-line text-amber-600 text-lg mt-0.5" />
            <p className="text-sm text-amber-800">{template.notes}</p>
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-xl border border-brand-border/60 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-text-primary">Crear ruta desde plantilla</h2>

        {/* Date, Truck, Driver */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">Camion</label>
            <select
              value={truckId}
              onChange={(e) => setTruckId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30 appearance-none cursor-pointer"
            >
              <option value="">Seleccionar</option>
              {availableTrucks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.plate} - {t.model}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">Conductor</label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30 appearance-none cursor-pointer"
            >
              <option value="">Seleccionar</option>
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} - Lic {d.license_type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected truck/driver preview */}
        {truckId || driverId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {truckId ? (
              <div className="bg-brand-light rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                  <i className="ri-truck-line text-brand-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{mockTrucks.find((t) => t.id === truckId)?.plate}</p>
                  <p className="text-xs text-text-muted">{mockTrucks.find((t) => t.id === truckId)?.model}</p>
                </div>
              </div>
            ) : null}
            {driverId ? (
              <div className="bg-brand-light rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-sm font-bold text-brand-green">
                  {mockDrivers.find((d) => d.id === driverId)?.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{mockDrivers.find((d) => d.id === driverId)?.name}</p>
                  <p className="text-xs text-text-muted">DNI {mockDrivers.find((d) => d.id === driverId)?.dni}</p>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Customer management */}
        <div className="border-t border-brand-border/40 pt-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Clientes y orden de visita</h3>
          <p className="text-xs text-text-muted mb-4">
            Puedes agregar, quitar o cambiar el orden de los clientes antes de guardar la ruta
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Available */}
            <div className="bg-brand-light rounded-xl p-4">
              <div className="relative mb-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                  <i className="ri-search-line" />
                </span>
                <input
                  type="text"
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  placeholder="Agregar mas clientes..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                />
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
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
                      </div>
                      <div className="w-6 h-6 rounded-full border-2 border-brand-border flex items-center justify-center flex-shrink-0">
                        <i className="ri-add-line text-xs text-text-muted" />
                      </div>
                    </div>
                  </button>
                ))}
                {filteredCustomers.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-4">No hay clientes disponibles</p>
                ) : null}
              </div>
            </div>

            {/* Selected with order */}
            <div className="bg-white rounded-xl border border-brand-border/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-text-primary">
                  Orden de visita: {selectedCustomers.length} clientes
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedCustomerList.map((c, index) => (
                  c ? (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg bg-brand-light border border-brand-border/40 flex items-center gap-2"
                    >
                      <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{c.fantasy_name}</p>
                        <p className="text-xs text-text-muted truncate">{c.address}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          type="button"
                          className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-brand-border/50 disabled:opacity-30 transition-colors"
                        >
                          <i className="ri-arrow-up-line text-sm" />
                        </button>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index >= selectedCustomerList.length - 1}
                          type="button"
                          className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-brand-border/50 disabled:opacity-30 transition-colors"
                        >
                          <i className="ri-arrow-down-line text-sm" />
                        </button>
                        <button
                          onClick={() => toggleCustomer(c.id)}
                          type="button"
                          className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-red-500 transition-colors"
                        >
                          <i className="ri-close-line text-sm" />
                        </button>
                      </div>
                    </div>
                  ) : null
                ))}
                {selectedCustomerList.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="ri-map-pin-line text-3xl text-brand-border mb-2 block" />
                    <p className="text-xs text-text-muted">Sin clientes seleccionados</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        {isValid ? (
          <div className="bg-brand-green/5 border border-brand-green/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-brand-green mb-2">Resumen de la ruta</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
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
                <p className="font-medium text-text-primary">{mockTrucks.find((t) => t.id === truckId)?.plate}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Conductor</p>
                <p className="font-medium text-text-primary">{mockDrivers.find((d) => d.id === driverId)?.name}</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => navigate('/routes/templates')}
            type="button"
            className="px-5 py-2.5 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreateRoute}
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
                Creando ruta...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <i className="ri-route-line" />
                Crear Ruta
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}