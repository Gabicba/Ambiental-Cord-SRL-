import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockCustomers, customerStatuses, customerTypes } from '@/mocks/customers';
import { getContractsByCustomer, addContract, updateContract, deleteContract, computeContractStatus, refreshContractStatuses, type CustomerContract } from '@/mocks/contracts';
import { useContactVisibility, getContactVisibilityFromStorage } from '@/hooks/useContactVisibility';

type TabKey = 'general' | 'contacts' | 'pickup' | 'containers' | 'history' | 'documents' | 'contracts';

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'general', label: 'General', icon: 'ri-file-info-line' },
  { key: 'contacts', label: 'Contactos', icon: 'ri-contacts-line' },
  { key: 'pickup', label: 'Puntos de Recoleccion', icon: 'ri-map-pin-line' },
  { key: 'containers', label: 'Contenedores', icon: 'ri-archive-line' },
  { key: 'history', label: 'Historial', icon: 'ri-history-line' },
  { key: 'documents', label: 'Documentos', icon: 'ri-folder-line' },
  { key: 'contracts', label: 'Contratos', icon: 'ri-file-shield-line' },
];

const containerStatusColors: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Inactive: 'bg-gray-100 text-gray-700 border-gray-200',
  Maintenance: 'bg-amber-100 text-amber-700 border-amber-200',
};

const docTypeIcons: Record<string, string> = {
  Contrato: 'ri-file-text-line',
  Manifiesto: 'ri-file-paper-line',
  Propuesta: 'ri-file-list-line',
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('general');

  // Contracts state
  const [contracts, setContracts] = useState<CustomerContract[]>([]);
  const [showContractModal, setShowContractModal] = useState(false);
  const [editingContract, setEditingContract] = useState<CustomerContract | null>(null);
  const [contractForm, setContractForm] = useState({
    agreement_name: '',
    municipality: '',
    start_date: '',
    expiration_date: '',
    renewal_date: '',
    notes: '',
    file_name: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshContractStatuses();
    if (id) {
      setContracts(getContractsByCustomer(id));
    }
  }, [id]);

  const reloadContracts = () => {
    if (id) setContracts(getContractsByCustomer(id));
  };

  const openNewContract = () => {
    setEditingContract(null);
    setContractForm({
      agreement_name: '',
      municipality: '',
      start_date: new Date().toISOString().split('T')[0],
      expiration_date: '',
      renewal_date: '',
      notes: '',
      file_name: '',
    });
    setShowContractModal(true);
  };

  const openEditContract = (c: CustomerContract) => {
    setEditingContract(c);
    setContractForm({
      agreement_name: c.agreement_name,
      municipality: c.municipality,
      start_date: c.start_date,
      expiration_date: c.expiration_date,
      renewal_date: c.renewal_date || c.expiration_date,
      notes: c.notes,
      file_name: c.file_name,
    });
    setShowContractModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setContractForm((f) => ({ ...f, file_name: file.name }));
    }
  };

  const saveContract = () => {
    if (!contractForm.agreement_name || !contractForm.municipality || !contractForm.start_date || !contractForm.expiration_date || !id) return;
    const status = computeContractStatus(contractForm.expiration_date);
    if (editingContract) {
      updateContract(editingContract.id, {
        ...contractForm,
        status,
      });
    } else {
      addContract({
        customer_id: id,
        ...contractForm,
        status,
        pdf_url: '',
      });
    }
    setShowContractModal(false);
    reloadContracts();
  };

  const handleDeleteContract = (contractId: string) => {
    if (window.confirm('Seguro que queres eliminar este contrato?')) {
      deleteContract(contractId);
      reloadContracts();
    }
  };

  const handleRenewContract = (contractId: string) => {
    const c = contracts.find((x) => x.id === contractId);
    if (!c) return;
    const newExp = new Date(c.expiration_date);
    newExp.setFullYear(newExp.getFullYear() + 1);
    updateContract(contractId, {
      expiration_date: newExp.toISOString().split('T')[0],
      status: computeContractStatus(newExp.toISOString().split('T')[0]),
      notes: `${c.notes}\nRenovado el ${new Date().toLocaleDateString('es-AR')}`,
    });
    reloadContracts();
  };

  const contractStatusConfig: Record<string, { label: string; color: string; icon: string }> = {
    Active: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: 'ri-check-line' },
    Expiring: { label: 'Por Vencer', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: 'ri-alert-line' },
    Expired: { label: 'Vencido', color: 'bg-red-100 text-red-700 border-red-200', icon: 'ri-close-circle-line' },
    Renewed: { label: 'Renovado', color: 'bg-sky-100 text-sky-700 border-sky-200', icon: 'ri-refresh-line' },
  };

  const customer = mockCustomers.find((c) => c.id === id);
  const contactVis = useContactVisibility(customer?.id || '');

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center mb-4">
          <i className="ri-user-search-line text-3xl text-text-muted" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Cliente no encontrado</h2>
        <p className="text-sm text-text-secondary mb-4">El cliente que buscas no existe o fue eliminado.</p>
        <button
          type="button"
          onClick={() => navigate('/customers')}
          className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors"
        >
          Volver a Clientes
        </button>
      </div>
    );
  }

  const { getVisibility, setVisibility } = contactVis;

  const typeConfig = customerTypes[customer.type as keyof typeof customerTypes];
  const statusConfig = customerStatuses[customer.status as keyof typeof customerStatuses];

  const totalLiters = customer.history.reduce((sum, h) => sum + h.liters, 0);
  const totalCollections = customer.history.length;
  const avgLiters = totalCollections > 0 ? Math.round(totalLiters / totalCollections) : 0;
  const totalContainers = customer.containers.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="mt-1 p-2 rounded-lg bg-brand-light text-text-secondary hover:bg-brand-border/50 transition-colors"
          >
            <i className="ri-arrow-left-line" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-text-primary">{customer.fantasy_name}</h1>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig?.color}`}>
                {statusConfig?.label}
              </span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${typeConfig?.color}`}>
                {typeConfig?.label}
              </span>
            </div>
            <p className="text-sm text-text-secondary mt-1">{customer.id} · {customer.address}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="px-4 py-2 border border-brand-border text-text-secondary rounded-lg text-sm font-medium hover:bg-brand-light transition-colors"
          >
            <i className="ri-map-pin-line mr-1.5" />
            Ver en Mapa
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors"
          >
            <i className="ri-edit-line mr-1.5" />
            Editar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-brand-border/60 p-4">
          <p className="text-xs text-text-muted uppercase font-medium">Total Litros</p>
          <p className="text-xl font-bold text-text-primary mt-1">{totalLiters.toLocaleString()}</p>
          <p className="text-xs text-text-muted mt-0.5">Acumulado historico</p>
        </div>
        <div className="bg-white rounded-xl border border-brand-border/60 p-4">
          <p className="text-xs text-text-muted uppercase font-medium">Colectas</p>
          <p className="text-xl font-bold text-text-primary mt-1">{totalCollections}</p>
          <p className="text-xs text-text-muted mt-0.5">Visitas completadas</p>
        </div>
        <div className="bg-white rounded-xl border border-brand-border/60 p-4">
          <p className="text-xs text-text-muted uppercase font-medium">Promedio</p>
          <p className="text-xl font-bold text-text-primary mt-1">{avgLiters} L</p>
          <p className="text-xs text-text-muted mt-0.5">Por visita</p>
        </div>
        <div className="bg-white rounded-xl border border-brand-border/60 p-4">
          <p className="text-xs text-muted uppercase font-medium">Contenedores</p>
          <p className="text-xl font-bold text-text-primary mt-1">{totalContainers}</p>
          <p className="text-xs text-text-muted mt-0.5">Activos e inactivos</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-brand-border/60 overflow-hidden">
        <div className="border-b border-brand-border/60 overflow-x-auto">
          <div className="flex min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-brand-green border-brand-green'
                    : 'text-text-secondary border-transparent hover:text-text-primary'
                }`}
              >
                <i className={tab.icon} />
                {tab.label}
                {tab.key === 'contacts' && customer.contacts.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-light text-xs text-text-secondary">{customer.contacts.length}</span>
                )}
                {tab.key === 'pickup' && customer.pickup_points.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-light text-xs text-text-secondary">{customer.pickup_points.length}</span>
                )}
                {tab.key === 'containers' && customer.containers.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-light text-xs text-text-secondary">{customer.containers.length}</span>
                )}
                {tab.key === 'history' && customer.history.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-light text-xs text-text-secondary">{customer.history.length}</span>
                )}
                {tab.key === 'documents' && customer.documents.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-light text-xs text-text-secondary">{customer.documents.length}</span>
                )}
                {tab.key === 'contracts' && contracts.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-light text-xs text-text-secondary">{contracts.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {/* GENERAL */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <i className="ri-building-line text-brand-green" />
                    Informacion General
                  </h3>
                  <div className="bg-brand-light/50 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-text-muted">Nombre de Fantasia</p>
                        <p className="text-sm font-medium text-text-primary">{customer.fantasy_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">CUIT</p>
                        <p className="text-sm font-medium text-text-primary">{customer.cuit || 'Sin CUIT'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">Direccion</p>
                        <p className="text-sm font-medium text-text-primary">{customer.address}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">Telefono</p>
                        <p className="text-sm font-medium text-text-primary">{customer.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">Zona</p>
                        <p className="text-sm font-medium text-text-primary">{customer.location}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">Tipo</p>
                        <p className="text-sm font-medium text-text-primary">{typeConfig?.label}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">Estado</p>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${statusConfig?.color}`}>
                          {statusConfig?.label}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">Fecha de Alta</p>
                        <p className="text-sm font-medium text-text-primary">{new Date(customer.created_at).toLocaleDateString('es-AR')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {customer.pickup_points.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <i className="ri-map-pin-line text-brand-green" />
                      Resumen de Puntos de Recoleccion
                    </h3>
                    <div className="space-y-2">
                      {customer.pickup_points.map((pp, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-brand-light/50 rounded-xl p-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                            <i className="ri-map-pin-2-line text-brand-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary">{pp.address}</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                              {pp.frequency && <span className="text-xs text-text-secondary"><i className="ri-calendar-line mr-1" />{pp.frequency}</span>}
                              {pp.schedule && <span className="text-xs text-text-secondary"><i className="ri-time-line mr-1" />{pp.schedule}</span>}
                              <span className="text-xs text-text-secondary"><i className="ri-archive-line mr-1" />{pp.container_count} contenedores</span>
                            </div>
                            {pp.observations && <p className="text-xs text-text-muted mt-1">{pp.observations}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <i className="ri-contacts-line text-brand-green" />
                    Contacto Principal
                  </h3>
                  {customer.contacts.length > 0 ? (
                    <div className="bg-brand-light/50 rounded-xl p-4 space-y-2">
                      <p className="text-sm font-medium text-text-primary">{customer.contacts[0].name}</p>
                      <p className="text-xs text-text-secondary">{customer.contacts[0].role}</p>
                      <div className="pt-2 border-t border-brand-border/40 space-y-1">
                        <p className="text-xs text-text-secondary"><i className="ri-phone-line mr-1.5" />{customer.contacts[0].phone}</p>
                        {customer.contacts[0].email && (
                          <p className="text-xs text-text-secondary"><i className="ri-mail-line mr-1.5" />{customer.contacts[0].email}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted">Sin contactos registrados</p>
                  )}
                </div>

                {customer.history.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <i className="ri-drop-line text-brand-green" />
                      Ultima Colecta
                    </h3>
                    <div className="bg-brand-light/50 rounded-xl p-4 space-y-2">
                      <p className="text-lg font-bold text-brand-green">{customer.history[0].liters} L</p>
                      <p className="text-xs text-text-secondary">{customer.history[0].date}</p>
                      <p className="text-xs text-text-muted">Ruta {customer.history[0].route} · {customer.history[0].driver}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <i className="ri-map-2-line text-brand-green" />
                    Ubicacion
                  </h3>
                  <div className="rounded-xl overflow-hidden border border-brand-border/60 aspect-[4/3]">
                    <iframe
                      title="map"
                      src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.0!2d${customer.pickup_points[0]?.lng || -58.38}!3d${customer.pickup_points[0]?.lat || -34.60}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM2JzAwLjAiUyA1OMKwMjInNDguMCJX!5e0!3m2!1ses!2sar!4v1600000000000`}
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTACTS */}
          {activeTab === 'contacts' && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <i className="ri-eye-line text-text-muted" />
                <p className="text-xs text-text-muted">
                  Los contactos marcados como <strong className="text-text-secondary">"Visible para chofer"</strong> aparecerán en la app móvil del conductor cuando visite este cliente.
                </p>
              </div>
              {customer.contacts.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-contacts-book-line text-4xl text-text-muted mb-3" />
                  <p className="text-text-muted text-sm">No hay contactos registrados</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {customer.contacts.map((contact, idx) => {
                    const visible = getVisibility(idx);
                    return (
                      <div key={idx} className="bg-brand-light/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                            <i className="ri-user-line text-brand-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary">{contact.name}</p>
                            <p className="text-xs text-text-secondary">{contact.role}</p>
                          </div>
                        </div>
                        <div className="space-y-1 pt-2 border-t border-brand-border/40">
                          <p className="text-xs text-text-secondary"><i className="ri-phone-line mr-1.5" />{contact.phone}</p>
                          {contact.email && <p className="text-xs text-text-secondary"><i className="ri-mail-line mr-1.5" />{contact.email}</p>}
                        </div>
                        <div className="pt-2 border-t border-brand-border/40 flex items-center justify-between">
                          <span className="text-xs text-text-muted">Visible para chofer</span>
                          <button
                            type="button"
                            onClick={() => setVisibility(idx, !visible)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                              visible
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                          >
                            <i className={visible ? 'ri-eye-line' : 'ri-eye-off-line'} />
                            {visible ? 'Sí' : 'No'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PICKUP POINTS */}
          {activeTab === 'pickup' && (
            <div className="space-y-4">
              {customer.pickup_points.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-map-pin-line text-text-muted mb-3" />
                  <p className="text-text-muted text-sm">No hay puntos de recoleccion registrados</p>
                </div>
              ) : (
                <>
                  <div className="rounded-xl overflow-hidden border border-brand-border/60 aspect-[16/9]">
                    <iframe
                      title="pickup-map"
                      src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.0!2d${customer.pickup_points[0]?.lng || -58.38}!3d${customer.pickup_points[0]?.lat || -34.60}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM2JzAwLjAiUyA1OMKwMjInNDguMCJX!5e0!3m2!1ses!2sar!4v1600000000000`}
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="space-y-3">
                    {customer.pickup_points.map((pp, idx) => (
                      <div key={idx} className="bg-brand-light/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                          <i className="ri-map-pin-2-line text-brand-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary">{pp.address}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                            {pp.frequency && (
                              <div className="flex items-center gap-1.5">
                                <i className="ri-calendar-line text-text-muted text-xs" />
                                <span className="text-xs text-text-secondary">{pp.frequency}</span>
                              </div>
                            )}
                            {pp.schedule && (
                              <div className="flex items-center gap-1.5">
                                <i className="ri-time-line text-text-muted text-xs" />
                                <span className="text-xs text-text-secondary">{pp.schedule}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <i className="ri-archive-line text-text-muted text-xs" />
                              <span className="text-xs text-text-secondary">{pp.container_count} contenedores</span>
                            </div>
                          </div>
                          {pp.observations && (
                            <div className="mt-2 p-2 bg-white rounded-lg border border-brand-border/40">
                              <p className="text-xs text-text-muted"><i className="ri-information-line mr-1" />{pp.observations}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-text-muted flex-shrink-0">
                          <p>Lat: {pp.lat?.toFixed(4)}</p>
                          <p>Lng: {pp.lng?.toFixed(4)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* CONTAINERS */}
          {activeTab === 'containers' && (
            <div>
              {customer.containers.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-archive-line text-4xl text-text-muted mb-3" />
                  <p className="text-text-muted text-sm">No hay contenedores registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-brand-border/40">
                        <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">ID</th>
                        <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Tipo</th>
                        <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Capacidad</th>
                        <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Ubicacion</th>
                        <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Ult. Limpieza</th>
                        <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.containers.map((c) => (
                        <tr key={c.id} className="border-b border-brand-border/30 hover:bg-brand-light/50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-text-primary">{c.id}</td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{c.type}</td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{c.capacity} L</td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{c.location}</td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{c.last_cleaned}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${containerStatusColors[c.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                              {c.status === 'Active' ? 'Activo' : c.status === 'Inactive' ? 'Inactivo' : 'Mantenimiento'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* HISTORY */}
          {activeTab === 'history' && (
            <div>
              {customer.history.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-history-line text-4xl text-text-muted mb-3" />
                  <p className="text-text-muted text-sm">No hay historial de colectas</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-brand-border/40">
                        <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Fecha</th>
                        <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Ruta</th>
                        <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Conductor</th>
                        <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Camion</th>
                        <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Litros</th>
                        <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.history.map((h, idx) => (
                        <tr key={idx} className="border-b border-brand-border/30 hover:bg-brand-light/50 transition-colors">
                          <td className="px-4 py-3 text-sm text-text-secondary">{h.date}</td>
                          <td className="px-4 py-3 text-sm font-medium text-text-primary">{h.route}</td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{h.driver}</td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{h.truck}</td>
                          <td className="px-4 py-3 text-sm font-bold text-brand-green">{h.liters} L</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Completado
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* DOCUMENTS */}
          {activeTab === 'documents' && (
            <div>
              {customer.documents.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-folder-line text-4xl text-text-muted mb-3" />
                  <p className="text-text-muted text-sm">No hay documentos registrados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {customer.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 bg-brand-light/50 rounded-xl p-3 hover:bg-brand-border/30 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                        <i className={`${docTypeIcons[doc.type] || 'ri-file-line'} text-brand-primary`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{doc.name}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                          <span className="text-xs text-text-secondary">{doc.type}</span>
                          <span className="text-xs text-text-muted">{doc.date}</span>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${
                        doc.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        doc.status === 'Completed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>
                        {doc.status === 'Active' ? 'Activo' : doc.status === 'Completed' ? 'Completado' : 'Pendiente'}
                      </span>
                      <button type="button" className="p-2 rounded-lg text-text-muted hover:text-brand-primary transition-colors flex-shrink-0">
                        <i className="ri-download-line" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CONTRACTS */}
          {activeTab === 'contracts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <i className="ri-file-shield-line text-brand-green" />
                    Convenios y Contratos Municipales
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Documentos firmados con municipalidades o entidades publicas
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewContract}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap"
                >
                  <i className="ri-add-line" />
                  Nuevo Contrato
                </button>
              </div>

              {contracts.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-4">
                    <i className="ri-file-shield-line text-3xl text-text-muted" />
                  </div>
                  <p className="text-sm font-medium text-text-primary mb-1">Sin contratos registrados</p>
                  <p className="text-xs text-text-muted max-w-sm mx-auto">
                    Carga los convenios municipales o contratos firmados con este cliente para llevar control de vencimientos.
                  </p>
                  <button
                    type="button"
                    onClick={openNewContract}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 border border-brand-border text-text-secondary rounded-lg text-sm font-medium hover:bg-brand-light transition-colors"
                  >
                    <i className="ri-add-line" />
                    Agregar primer contrato
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {contracts.map((c) => {
                    const cfg = contractStatusConfig[c.status];
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const rd = new Date(c.renewal_date || c.expiration_date);
                    rd.setHours(0,0,0,0);
                    const renewalDue = today.getTime() >= rd.getTime();
                    const renewalDiff = Math.ceil((rd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={c.id} className="bg-brand-light/50 rounded-xl p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-text-primary">{c.agreement_name}</p>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
                                <i className={cfg.icon} />
                                {cfg.label}
                              </span>
                              {renewalDue && c.status !== 'Renewed' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 border border-rose-200">
                                  <i className="ri-alarm-warning-line" />
                                  Renovar trámite
                                </span>
                              )}
                              {!renewalDue && renewalDiff <= 30 && c.status !== 'Renewed' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                                  <i className="ri-alarm-warning-line" />
                                  Renovar en {renewalDiff} días
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-text-secondary mt-1">
                              <i className="ri-government-line mr-1" />
                              {c.municipality}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-text-muted">
                              <span><i className="ri-calendar-line mr-1" />Inicio: {new Date(c.start_date).toLocaleDateString('es-AR')}</span>
                              <span><i className="ri-calendar-check-line mr-1" />Vence: {new Date(c.expiration_date).toLocaleDateString('es-AR')}</span>
                              <span className={renewalDue && c.status !== 'Renewed' ? 'text-rose-600 font-medium' : 'text-text-muted'}>
                                <i className="ri-calendar-event-line mr-1" />
                                Renovar trámite: {new Date(c.renewal_date || c.expiration_date).toLocaleDateString('es-AR')}
                              </span>
                              {c.file_name && (
                                <span><i className="ri-attachment-line mr-1" />{c.file_name}</span>
                              )}
                            </div>
                            {c.notes && (
                              <p className="text-xs text-text-muted mt-2 bg-white rounded-lg p-2 border border-brand-border/40">
                                <i className="ri-information-line mr-1" />{c.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {c.file_name && (
                              <button
                                type="button"
                                onClick={() => alert(`Descargando: ${c.file_name}\n\n(En produccion con Supabase Storage, se descarga el PDF real)`)}
                                className="p-2 rounded-lg text-text-muted hover:text-brand-primary transition-colors"
                                title="Descargar archivo"
                              >
                                <i className="ri-download-line" />
                              </button>
                            )}
                            {c.status !== 'Renewed' && (
                              <button
                                type="button"
                                onClick={() => handleRenewContract(c.id)}
                                className="p-2 rounded-lg text-text-muted hover:text-sky-600 transition-colors"
                                title="Renovar contrato"
                              >
                                <i className="ri-refresh-line" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => openEditContract(c)}
                              className="p-2 rounded-lg text-text-muted hover:text-brand-primary transition-colors"
                              title="Editar"
                            >
                              <i className="ri-edit-line" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteContract(c.id)}
                              className="p-2 rounded-lg text-text-muted hover:text-red-500 transition-colors"
                              title="Eliminar"
                            >
                              <i className="ri-delete-bin-line" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Contract Modal */}
              {showContractModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                  <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <div className="p-5 border-b border-brand-border/60 flex items-center justify-between">
                      <h3 className="text-base font-semibold text-text-primary">
                        {editingContract ? 'Editar Contrato' : 'Nuevo Contrato'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowContractModal(false)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-brand-light transition-colors"
                      >
                        <i className="ri-close-line text-lg" />
                      </button>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">Nombre del Convenio *</label>
                        <input
                          type="text"
                          value={contractForm.agreement_name}
                          onChange={(e) => setContractForm((f) => ({ ...f, agreement_name: e.target.value }))}
                          placeholder="Ej: Convenio Municipal Recoleccion UCO 2026"
                          className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">Municipalidad / Entidad *</label>
                        <input
                          type="text"
                          value={contractForm.municipality}
                          onChange={(e) => setContractForm((f) => ({ ...f, municipality: e.target.value }))}
                          placeholder="Ej: Municipalidad de Buenos Aires"
                          className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">Fecha Inicio *</label>
                          <input
                            type="date"
                            value={contractForm.start_date}
                            onChange={(e) => setContractForm((f) => ({ ...f, start_date: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">Fecha Vencimiento *</label>
                          <input
                            type="date"
                            value={contractForm.expiration_date}
                            onChange={(e) => setContractForm((f) => ({ ...f, expiration_date: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">Fecha para renovar trámite *</label>
                        <input
                          type="date"
                          value={contractForm.renewal_date}
                          onChange={(e) => setContractForm((f) => ({ ...f, renewal_date: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                        />
                        <p className="text-xs text-text-muted mt-1">Fecha en que el sistema debe avisar que hay que iniciar la renovación</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">Documento Firmado (PDF / Word)</label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 px-3 py-2 border border-brand-border text-text-secondary rounded-lg text-sm font-medium hover:bg-brand-light transition-colors"
                          >
                            <i className="ri-upload-cloud-line" />
                            {contractForm.file_name ? 'Cambiar archivo' : 'Seleccionar archivo'}
                          </button>
                          {contractForm.file_name && (
                            <span className="text-xs text-text-secondary flex items-center gap-1.5">
                              <i className="ri-file-text-line text-brand-green" />
                              {contractForm.file_name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-1">
                          Formatos permitidos: PDF, DOC, DOCX. En produccion se sube a Supabase Storage.
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">Notas</label>
                        <textarea
                          value={contractForm.notes}
                          onChange={(e) => setContractForm((f) => ({ ...f, notes: e.target.value }))}
                          placeholder="Clausulas especiales, condiciones de renovacion, observaciones..."
                          rows={3}
                          maxLength={500}
                          className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30 resize-none"
                        />
                        <p className="text-xs text-text-muted mt-1 text-right">{contractForm.notes.length}/500</p>
                      </div>
                    </div>
                    <div className="p-5 border-t border-brand-border/60 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowContractModal(false)}
                        className="px-4 py-2 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={saveContract}
                        disabled={!contractForm.agreement_name || !contractForm.municipality || !contractForm.start_date || !contractForm.expiration_date}
                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap ${
                          contractForm.agreement_name && contractForm.municipality && contractForm.start_date && contractForm.expiration_date
                            ? 'bg-brand-green hover:bg-brand-green/90'
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {editingContract ? 'Guardar Cambios' : 'Crear Contrato'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}