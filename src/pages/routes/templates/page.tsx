import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockRouteTemplates } from '@/mocks/route_templates';
import { mockCustomers } from '@/mocks/customers';

export default function RouteTemplatesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = mockRouteTemplates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const getCustomerCount = (ids: string[]) => {
    return ids.filter((id) => mockCustomers.find((c) => c.id === id)).length;
  };

  const getCustomerNames = (ids: string[]) => {
    return ids
      .map((id) => mockCustomers.find((c) => c.id === id)?.fantasy_name)
      .filter(Boolean)
      .slice(0, 3)
      .join(', ');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Plantillas de Rutas</h1>
          <p className="text-sm text-text-secondary mt-1">
            Rutas recurrentes guardadas para reutilizar rapidamente
          </p>
        </div>
        <button
          onClick={() => navigate('/routes/templates/new')}
          type="button"
          className="px-4 py-2.5 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <i className="ri-add-line" />
          Nueva Plantilla
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          <i className="ri-search-line" />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar plantillas..."
          className="w-full max-w-md pl-10 pr-4 py-2.5 rounded-xl bg-white border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-xl border border-brand-border/60 p-5 hover:border-brand-green/40 transition-colors cursor-pointer"
            onClick={() => navigate(`/routes/templates/${template.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/routes/templates/${template.id}`); }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                  <i className="ri-route-line text-brand-primary text-lg" />
                </div>
                <div>
                  <p className="text-base font-semibold text-text-primary">{template.name}</p>
                  <p className="text-xs text-text-muted">{template.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-map-pin-line text-text-muted text-sm" />
                </span>
                <span className="text-sm text-text-secondary">{getCustomerCount(template.customer_ids)} clientes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-building-line text-text-muted text-sm" />
                </span>
                <span className="text-xs text-text-muted truncate">{getCustomerNames(template.customer_ids)}</span>
              </div>
            </div>

            {template.notes && (
              <div className="bg-amber-50 rounded-lg p-2.5 mb-3 border border-amber-100">
                <p className="text-xs text-amber-700">
                  <i className="ri-information-line mr-1" />
                  {template.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-brand-border/40">
              <span className="text-xs text-text-muted">
                Creada {new Date(template.created_at).toLocaleDateString('es-AR')}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/routes/templates/${template.id}`);
                }}
                type="button"
                className="text-sm font-medium text-brand-primary hover:text-brand-primary/80 transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                Usar plantilla
                <i className="ri-arrow-right-line" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-brand-light flex items-center justify-center mx-auto mb-4">
            <i className="ri-route-line text-2xl text-text-muted" />
          </div>
          <p className="text-sm text-text-muted">No se encontraron plantillas</p>
        </div>
      )}
    </div>
  );
}