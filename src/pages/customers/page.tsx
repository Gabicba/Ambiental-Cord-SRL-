import { useState } from 'react';
import { mockCustomers, customerStatuses, customerTypes } from '@/mocks/customers';
import { useNavigate } from 'react-router-dom';
import { getContractsByCustomer, refreshContractStatuses } from '@/mocks/contracts';
import { useEffect } from 'react';

type FilterType = 'all' | 'Active' | 'Inactive' | 'Prospect';

export default function CustomersPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [contractAlerts, setContractAlerts] = useState<Record<string, { expiring: number; expired: number; renewalDue: number }>>({});

  useEffect(() => {
    refreshContractStatuses();
    const alerts: Record<string, { expiring: number; expired: number; renewalDue: number }> = {};
    mockCustomers.forEach((c) => {
      const contracts = getContractsByCustomer(c.id);
      const expiring = contracts.filter((x) => x.status === 'Expiring').length;
      const expired = contracts.filter((x) => x.status === 'Expired').length;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const renewalDue = contracts.filter((x) => {
        if (x.status === 'Renewed') return false;
        const rd = new Date(x.renewal_date || x.expiration_date);
        rd.setHours(0, 0, 0, 0);
        return today.getTime() >= rd.getTime();
      }).length;
      if (expiring || expired || renewalDue) {
        alerts[c.id] = { expiring, expired, renewalDue };
      }
    });
    setContractAlerts(alerts);
  }, []);

  const filtered = mockCustomers.filter((c) => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.fantasy_name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    }
    return true;
  });

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'Active', label: 'Activos' },
    { key: 'Inactive', label: 'Inactivos' },
    { key: 'Prospect', label: 'Prospectos' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Clientes</h1>
          <p className="text-sm text-text-secondary mt-1">
            Gestion de clientes y puntos de recoleccion
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/customers/new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap"
        >
          <i className="ri-add-line" />
          Nuevo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl border border-brand-border/60 overflow-hidden">
        <div className="p-4 border-b border-brand-border/60 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <i className="ri-search-line" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setFilter(btn.key)}
                type="button"
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                  filter === btn.key
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-white text-text-secondary border-brand-border hover:bg-brand-light'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border/40">
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Nombre</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Direccion</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Telefono</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Zona</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Tipo</th>
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Estado</th>
                <th className="text-center text-xs font-medium text-text-muted uppercase px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => {
                const typeConfig = customerTypes[customer.type as keyof typeof customerTypes];
                const statusConfig = customerStatuses[customer.status as keyof typeof customerStatuses];
                return (
                  <tr key={customer.id} className="border-b border-brand-border/30 hover:bg-brand-light/50 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{customer.fantasy_name}</p>
                        <p className="text-xs text-text-muted">{customer.cuit || 'Sin CUIT'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary max-w-xs truncate">{customer.address}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{customer.phone}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{customer.location}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${typeConfig?.color}`}>
                        {typeConfig?.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${statusConfig?.color}`}>
                        {statusConfig?.label}
                      </span>
                      {contractAlerts[customer.id] && (
                        <div className="mt-1 flex items-center gap-1.5">
                          {contractAlerts[customer.id].expired > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700 border border-red-200">
                              <i className="ri-close-circle-line" />
                              {contractAlerts[customer.id].expired} vencido{contractAlerts[customer.id].expired > 1 ? 's' : ''}
                            </span>
                          )}
                          {contractAlerts[customer.id].expiring > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200">
                              <i className="ri-alert-line" />
                              {contractAlerts[customer.id].expiring} por vencer
                            </span>
                          )}
                          {contractAlerts[customer.id].renewalDue > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-100 text-rose-700 border border-rose-200">
                              <i className="ri-alarm-warning-line" />
                              {contractAlerts[customer.id].renewalDue} renovar trámite
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => navigate(`/customers/${customer.id}`)}
                        className="text-text-muted hover:text-brand-primary transition-colors p-1"
                      >
                        <i className="ri-eye-line" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-text-muted text-sm">No se encontraron clientes</p>
          </div>
        )}
      </div>
    </div>
  );
}