import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockCustomers } from '@/mocks/customers';

export default function RouteTemplateNewPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customerOrder, setCustomerOrder] = useState<Record<string, number>>({});
  const [searchCustomer, setSearchCustomer] = useState('');
  const [saving, setSaving] = useState(false);

  const activeCustomers = mockCustomers.filter((c) => c.status === 'Active');

  const filteredCustomers = useMemo(() => {
    return activeCustomers.filter(
      (c) =>
        !selectedCustomers.includes(c.id) &&
        (c.fantasy_name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
          c.address.toLowerCase().includes(searchCustomer.toLowerCase()))
    );
  }, [searchCustomer, selectedCustomers, activeCustomers]);

  const selectedCustomerList = activeCustomers.filter((c) =>
    selectedCustomers.includes(c.id)
  );

  const toggleCustomer = (id: string) => {
    setSelectedCustomers((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((x) => x !== id);
        setCustomerOrder((o) => {
          const copy = { ...o };
          delete copy[id];
          return copy;
        });
        return next;
      }
      const next = [...prev, id];
      setCustomerOrder((o) => ({ ...o, [id]: next.length }));
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
      newOrder[c.id] = i + 1;
    });
    setCustomerOrder(newOrder);
    setSelectedCustomers(list.map((c) => c.id));
  };

  const moveDown = (index: number) => {
    if (index >= selectedCustomerList.length - 1) return;
    const list = [...selectedCustomerList];
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    const newOrder: Record<string, number> = {};
    list.forEach((c, i) => {
      newOrder[c.id] = i + 1;
    });
    setCustomerOrder(newOrder);
    setSelectedCustomers(list.map((c) => c.id));
  };

  const handleSave = () => {
    if (!name || selectedCustomers.length === 0) return;
    setSaving(true);
    setTimeout(() => {
      navigate('/routes/templates');
    }, 800);
  };

  const isValid = name.trim() && selectedCustomers.length > 0;

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

      <div>
        <h1 className="text-2xl font-bold text-text-primary">Nueva Plantilla de Ruta</h1>
        <p className="text-sm text-text-secondary mt-1">Guarda una ruta recurrente para usarla multiples veces</p>
      </div>

      <div className="bg-white rounded-xl border border-brand-border/60 p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
              Nombre de la plantilla
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Ruta Norte - Lunes"
              className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
              Descripcion
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripcion de la ruta"
              className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Instrucciones especiales para esta ruta..."
            rows={2}
            maxLength={500}
            className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30 resize-none"
          />
          <p className="text-xs text-text-muted mt-1 text-right">{notes.length}/500</p>
        </div>

        {/* Customer Selection */}
        <div className="border-t border-brand-border/40 pt-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Clientes en la ruta</h3>
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
                  <p className="text-xs text-text-muted text-center py-4">No hay clientes disponibles</p>
                )}
              </div>
            </div>

            {/* Selected with order */}
            <div className="bg-white rounded-xl border border-brand-border/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-text-primary">
                  Seleccionados: {selectedCustomers.length}
                </span>
                {selectedCustomers.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedCustomers([]);
                      setCustomerOrder({});
                    }}
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
                ))}
                {selectedCustomerList.length === 0 && (
                  <div className="text-center py-8">
                    <i className="ri-map-pin-line text-3xl text-brand-border mb-2 block" />
                    <p className="text-xs text-text-muted">Selecciona clientes del panel izquierdo</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

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
                Guardando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <i className="ri-save-line" />
                Guardar Plantilla
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}