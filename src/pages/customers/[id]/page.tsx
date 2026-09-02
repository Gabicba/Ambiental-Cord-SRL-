import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useCustomers, customerStatuses, customerTypes } from '@/hooks/useCustomers';
import { useContactVisibility } from '@/hooks/useContactVisibility';

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

interface CustomerData {
  id: string; fantasy_name: string; cuit: string | null; address: string | null;
  phone: string | null; location: string | null; status: string; type: string;
  tax_info: Record<string, unknown> | null; created_at: string; updated_at: string; deleted_at: string | null;
}

interface ContactData {
  id: string; customer_id: string; name: string; phone: string | null;
  email: string | null; role: string | null; visible_to_driver: boolean; created_at: string;
}

interface PickupPointData {
  id: string; customer_id: string; address: string; lat: number | null; lng: number | null;
  frequency: string | null; schedule: string | null; container_count: number | null;
  observations: string | null; created_at: string;
}

interface ContainerData {
  id: string; customer_id: string; type: string; capacity: number; status: string;
  last_cleaned: string | null; location: string | null; created_at: string;
}

interface ContractData {
  id: string; customer_id: string; agreement_name: string; municipality: string;
  pdf_url: string | null; file_name: string | null; start_date: string; expiration_date: string;
  renewal_date: string | null; status: string; notes: string | null; created_at: string; updated_at: string;
}

const inputCls = 'w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30';
const selectCls = 'w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30 appearance-none cursor-pointer';
const labelCls = 'text-xs font-medium text-text-muted uppercase block mb-1.5';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteCustomer } = useCustomers();
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [pickupPoints, setPickupPoints] = useState<PickupPointData[]>([]);
  const [containers, setContainers] = useState<ContainerData[]>([]);
  const [contracts, setContracts] = useState<ContractData[]>([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ fantasy_name: '', cuit: '', address: '', phone: '', location: '', status: '', type: '' });
  const [saving, setSaving] = useState(false);

  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', role: '', phone: '', email: '', visible_to_driver: true });
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  const [showPickupForm, setShowPickupForm] = useState(false);
  const [pickupForm, setPickupForm] = useState({ address: '', frequency: '', schedule: '', container_count: 0, observations: '', lat: '', lng: '' });
  const [editingPickupId, setEditingPickupId] = useState<string | null>(null);

  const [showContainerForm, setShowContainerForm] = useState(false);
  const [containerForm, setContainerForm] = useState({ type: 'Tambor 200L', capacity: 200, status: 'Active', location: '', last_cleaned: '' });
  const [editingContainerId, setEditingContainerId] = useState<string | null>(null);

  const [showContractModal, setShowContractModal] = useState(false);
  const [editingContract, setEditingContract] = useState<ContractData | null>(null);
  const [contractForm, setContractForm] = useState({ agreement_name: '', municipality: '', start_date: '', expiration_date: '', renewal_date: '', notes: '', file_name: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true); setError(null);
    try {
      const { data: d, error: e } = await supabase.from('customers').select('*').eq('id', id).is('deleted_at', null).maybeSingle();
      if (e) throw e;
      if (!d) { setError('Cliente no encontrado'); setLoading(false); return; }
      setCustomer(d as CustomerData);
      const [cr, pr, cnr, ctr] = await Promise.all([
        supabase.from('customer_contacts').select('*').eq('customer_id', id).order('created_at'),
        supabase.from('pickup_points').select('*').eq('customer_id', id).order('created_at'),
        supabase.from('containers').select('*').eq('customer_id', id).order('created_at'),
        supabase.from('customer_contracts').select('*').eq('customer_id', id).order('created_at'),
      ]);
      setContacts((cr.data as ContactData[]) || []);
      setPickupPoints((pr.data as PickupPointData[]) || []);
      setContainers((cnr.data as ContainerData[]) || []);
      setContracts((ctr.data as ContractData[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const contactVis = useContactVisibility(customer?.id || '');
  const { getVisibility, setVisibility } = contactVis;

  const openEditModal = () => {
    if (!customer) return;
    setEditForm({ fantasy_name: customer.fantasy_name, cuit: customer.cuit || '', address: customer.address || '', phone: customer.phone || '', location: customer.location || '', status: customer.status, type: customer.type });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!customer) return;
    setSaving(true);
    try {
      const { error: err } = await supabase.from('customers').update({ ...editForm, updated_at: new Date().toISOString() }).eq('id', customer.id);
      if (err) throw err;
      setCustomer({ ...customer, ...editForm, updated_at: new Date().toISOString() } as CustomerData);
      setShowEditModal(false);
    } catch (e) { alert(e instanceof Error ? e.message : 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleDeactivate = async () => {
    if (!customer) return;
    if (!window.confirm('Estas seguro de dar de baja este cliente? Se ocultara de las listas pero no se eliminara permanentemente.')) return;
    try { await deleteCustomer(customer.id); navigate('/customers'); }
    catch (e) { alert(e instanceof Error ? e.message : 'Error al desactivar'); }
  };

  const openNewContact = () => { setContactForm({ name: '', role: '', phone: '', email: '', visible_to_driver: true }); setEditingContactId(null); setShowContactForm(true); };
  const openEditContact = (c: ContactData) => { setContactForm({ name: c.name, role: c.role || '', phone: c.phone || '', email: c.email || '', visible_to_driver: c.visible_to_driver }); setEditingContactId(c.id); setShowContactForm(true); };
  const saveContact = async () => {
    if (!customer || !contactForm.name) return;
    try {
      if (editingContactId) await supabase.from('customer_contacts').update(contactForm).eq('id', editingContactId);
      else await supabase.from('customer_contacts').insert({ ...contactForm, customer_id: customer.id });
      setShowContactForm(false); fetchData();
    } catch (e) { alert(e instanceof Error ? e.message : 'Error'); }
  };
  const deleteContact = async (cid: string) => {
    if (!window.confirm('Eliminar este contacto?')) return;
    try { await supabase.from('customer_contacts').delete().eq('id', cid); fetchData(); } catch (e) { alert(e instanceof Error ? e.message : 'Error'); }
  };

  const openNewPickup = () => { setPickupForm({ address: '', frequency: '', schedule: '', container_count: 0, observations: '', lat: '', lng: '' }); setEditingPickupId(null); setShowPickupForm(true); };
  const openEditPickup = (p: PickupPointData) => { setPickupForm({ address: p.address, frequency: p.frequency || '', schedule: p.schedule || '', container_count: p.container_count || 0, observations: p.observations || '', lat: p.lat != null ? String(p.lat) : '', lng: p.lng != null ? String(p.lng) : '' }); setEditingPickupId(p.id); setShowPickupForm(true); };
  const savePickup = async () => {
    if (!customer || !pickupForm.address) return;
    const row = { customer_id: customer.id, address: pickupForm.address, frequency: pickupForm.frequency || null, schedule: pickupForm.schedule || null, container_count: pickupForm.container_count, observations: pickupForm.observations || null, lat: pickupForm.lat ? parseFloat(pickupForm.lat) : null, lng: pickupForm.lng ? parseFloat(pickupForm.lng) : null };
    try {
      if (editingPickupId) await supabase.from('pickup_points').update(row).eq('id', editingPickupId);
      else await supabase.from('pickup_points').insert(row);
      setShowPickupForm(false); fetchData();
    } catch (e) { alert(e instanceof Error ? e.message : 'Error'); }
  };
  const deletePickup = async (pid: string) => {
    if (!window.confirm('Eliminar este punto?')) return;
    try { await supabase.from('pickup_points').delete().eq('id', pid); fetchData(); } catch (e) { alert(e instanceof Error ? e.message : 'Error'); }
  };

  const openNewContainer = () => { setContainerForm({ type: 'Tambor 200L', capacity: 200, status: 'Active', location: '', last_cleaned: '' }); setEditingContainerId(null); setShowContainerForm(true); };
  const openEditContainer = (c: ContainerData) => { setContainerForm({ type: c.type, capacity: c.capacity, status: c.status, location: c.location || '', last_cleaned: c.last_cleaned || '' }); setEditingContainerId(c.id); setShowContainerForm(true); };
  const saveContainer = async () => {
    if (!customer) return;
    const row = { customer_id: customer.id, type: containerForm.type, capacity: containerForm.capacity, status: containerForm.status, location: containerForm.location || null, last_cleaned: containerForm.last_cleaned || null };
    try {
      if (editingContainerId) await supabase.from('containers').update(row).eq('id', editingContainerId);
      else await supabase.from('containers').insert(row);
      setShowContainerForm(false); fetchData();
    } catch (e) { alert(e instanceof Error ? e.message : 'Error'); }
  };
  const deleteContainer = async (cid: string) => {
    if (!window.confirm('Eliminar este contenedor?')) return;
    try { await supabase.from('containers').delete().eq('id', cid); fetchData(); } catch (e) { alert(e instanceof Error ? e.message : 'Error'); }
  };

  const openNewContract = () => { setEditingContract(null); setContractForm({ agreement_name: '', municipality: '', start_date: new Date().toISOString().split('T')[0], expiration_date: '', renewal_date: '', notes: '', file_name: '' }); setShowContractModal(true); };
  const openEditContract = (c: ContractData) => { setEditingContract(c); setContractForm({ agreement_name: c.agreement_name, municipality: c.municipality, start_date: c.start_date, expiration_date: c.expiration_date, renewal_date: c.renewal_date || c.expiration_date, notes: c.notes || '', file_name: c.file_name || '' }); setShowContractModal(true); };
  const saveContract = async () => {
    if (!customer || !contractForm.agreement_name || !contractForm.municipality || !contractForm.start_date || !contractForm.expiration_date) return;
    const status = computeContractStatus(contractForm.expiration_date);
    const row = { customer_id: customer.id, agreement_name: contractForm.agreement_name, municipality: contractForm.municipality, start_date: contractForm.start_date, expiration_date: contractForm.expiration_date, renewal_date: contractForm.renewal_date || null, status, notes: contractForm.notes || null, file_name: contractForm.file_name || null, pdf_url: '' };
    try {
      if (editingContract) await supabase.from('customer_contracts').update({ ...row, updated_at: new Date().toISOString() }).eq('id', editingContract.id);
      else await supabase.from('customer_contracts').insert(row);
      setShowContractModal(false); fetchData();
    } catch (e) { alert(e instanceof Error ? e.message : 'Error'); }
  };
  const deleteContract = async (cid: string) => {
    if (!window.confirm('Eliminar este contrato?')) return;
    try { await supabase.from('customer_contracts').delete().eq('id', cid); fetchData(); } catch (e) { alert(e instanceof Error ? e.message : 'Error'); }
  };
  const renewContract = async (c: ContractData) => {
    const newExp = new Date(c.expiration_date); newExp.setFullYear(newExp.getFullYear() + 1);
    try { await supabase.from('customer_contracts').update({ expiration_date: newExp.toISOString().split('T')[0], status: 'Active', renewal_date: null, updated_at: new Date().toISOString() }).eq('id', c.id); fetchData(); }
    catch (e) { alert(e instanceof Error ? e.message : 'Error'); }
  };

  const cStatusConfig: Record<string, { label: string; color: string; icon: string }> = {
    Active: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: 'ri-check-line' },
    Expiring: { label: 'Por Vencer', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: 'ri-alert-line' },
    Expired: { label: 'Vencido', color: 'bg-red-100 text-red-700 border-red-200', icon: 'ri-close-circle-line' },
    Renewed: { label: 'Renovado', color: 'bg-sky-100 text-sky-700 border-sky-200', icon: 'ri-refresh-line' },
  };

  if (loading) return (<div className="flex items-center justify-center py-20"><div className="flex flex-col items-center gap-4"><div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" /><p className="text-sm text-text-secondary">Cargando cliente...</p></div></div>);
  if (error || !customer) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center mb-4"><i className="ri-user-search-line text-3xl text-text-muted" /></div>
      <h2 className="text-xl font-bold text-text-primary mb-2">Cliente no encontrado</h2>
      <p className="text-sm text-text-secondary mb-4">{error || 'El cliente que buscas no existe o fue eliminado.'}</p>
      <button type="button" onClick={() => navigate('/customers')} className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors">Volver a Clientes</button>
    </div>
  );

  const taxInfo = (customer.tax_info || {}) as Record<string, unknown>;
  const typeCfg = customerTypes[customer.type as keyof typeof customerTypes];
  const statusCfg = customerStatuses[customer.status as keyof typeof customerStatuses];
  const firstPickup = pickupPoints[0];
  const mapSrc = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.0!2d' + (firstPickup?.lng || -58.38) + '!3d' + (firstPickup?.lat || -34.60) + '!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM2JzAwLjAiUyA1OMKwMjInNDguMCJX!5e0!3m2!1ses!2sar!4v1600000000000';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <button type="button" onClick={() => navigate('/customers')} className="mt-1 p-2 rounded-lg bg-brand-light text-text-secondary hover:bg-brand-border/50 transition-colors"><i className="ri-arrow-left-line" /></button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-text-primary">{customer.fantasy_name}</h1>
              <span className={'inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ' + (statusCfg?.color || '')}>{statusCfg?.label}</span>
              <span className={'inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ' + (typeCfg?.color || '')}>{typeCfg?.label}</span>
            </div>
            <p className="text-sm text-text-secondary mt-1">{customer.address} · {customer.phone}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={handleDeactivate} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors whitespace-nowrap"><i className="ri-close-circle-line mr-1.5" />Dar de Baja</button>
          <button type="button" onClick={openEditModal} className="px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap"><i className="ri-edit-line mr-1.5" />Editar</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-brand-border/60 p-4"><p className="text-xs text-text-muted uppercase font-medium">CUIT</p><p className="text-xl font-bold text-text-primary mt-1">{customer.cuit || '—'}</p><p className="text-xs text-text-muted mt-0.5">{taxInfo.iva_condition as string || '—'}</p></div>
        <div className="bg-white rounded-xl border border-brand-border/60 p-4"><p className="text-xs text-text-muted uppercase font-medium">Contenedores</p><p className="text-xl font-bold text-text-primary mt-1">{containers.length}</p><p className="text-xs text-text-muted mt-0.5">Activos e inactivos</p></div>
        <div className="bg-white rounded-xl border border-brand-border/60 p-4"><p className="text-xs text-text-muted uppercase font-medium">Puntos Retiro</p><p className="text-xl font-bold text-text-primary mt-1">{pickupPoints.length}</p><p className="text-xs text-text-muted mt-0.5">Sucursales activas</p></div>
        <div className="bg-white rounded-xl border border-brand-border/60 p-4"><p className="text-xs text-text-muted uppercase font-medium">Contratos</p><p className="text-xl font-bold text-text-primary mt-1">{contracts.length}</p><p className="text-xs text-text-muted mt-0.5">{contracts.filter((c) => c.status === 'Active').length} activos</p></div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-brand-border/60 overflow-hidden">
        <div className="border-b border-brand-border/60 overflow-x-auto">
          <div className="flex min-w-max">
            {tabs.map((tab) => {
              const count = tab.key === 'contacts' ? contacts.length : tab.key === 'pickup' ? pickupPoints.length : tab.key === 'containers' ? containers.length : tab.key === 'contracts' ? contracts.length : 0;
              return (
                <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                  className={'px-4 py-3 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ' + (activeTab === tab.key ? 'text-brand-green border-brand-green' : 'text-text-secondary border-transparent hover:text-text-primary')}>
                  <i className={tab.icon} /> {tab.label}
                  {count > 0 && <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-light text-xs text-text-secondary">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5">
          {/* GENERAL */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2"><i className="ri-building-line text-brand-green" />Informacion General</h3>
                  <div className="bg-brand-light/50 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><p className="text-xs text-text-muted">Nombre de Fantasia</p><p className="text-sm font-medium text-text-primary">{customer.fantasy_name}</p></div>
                      <div><p className="text-xs text-text-muted">CUIT</p><p className="text-sm font-medium text-text-primary">{customer.cuit || 'Sin CUIT'}</p></div>
                      <div><p className="text-xs text-text-muted">Direccion</p><p className="text-sm font-medium text-text-primary">{customer.address}</p></div>
                      <div><p className="text-xs text-text-muted">Telefono</p><p className="text-sm font-medium text-text-primary">{customer.phone}</p></div>
                      <div><p className="text-xs text-text-muted">Zona</p><p className="text-sm font-medium text-text-primary">{customer.location}</p></div>
                      <div><p className="text-xs text-text-muted">Rubro</p><p className="text-sm font-medium text-text-primary">{taxInfo.industry as string || '—'}</p></div>
                      <div><p className="text-xs text-text-muted">IVA</p><p className="text-sm font-medium text-text-primary">{taxInfo.iva_condition as string || '—'}</p></div>
                      <div><p className="text-xs text-text-muted">Fecha de Alta</p><p className="text-sm font-medium text-text-primary">{new Date(customer.created_at).toLocaleDateString('es-AR')}</p></div>
                      {taxInfo.city && <div><p className="text-xs text-text-muted">Ciudad</p><p className="text-sm font-medium text-text-primary">{taxInfo.city as string}</p></div>}
                      {taxInfo.zone && <div><p className="text-xs text-text-muted">Zona Operativa</p><p className="text-sm font-medium text-text-primary">{taxInfo.zone as string}</p></div>}
                      {taxInfo.payment_method && <div><p className="text-xs text-text-muted">Forma de Pago</p><p className="text-sm font-medium text-text-primary">{taxInfo.payment_method as string}</p></div>}
                      {taxInfo.uco_payment !== undefined && <div><p className="text-xs text-text-muted">UCO Pago</p><p className="text-sm font-medium text-text-primary">{taxInfo.uco_payment ? 'Si' : 'No'}</p></div>}
                    </div>
                    {taxInfo.operation_notes && <div className="pt-3 border-t border-brand-border/40"><p className="text-xs text-text-muted mb-1">Observaciones Operativas</p><p className="text-sm text-text-secondary">{taxInfo.operation_notes as string}</p></div>}
                  </div>
                </div>
                {pickupPoints.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2"><i className="ri-map-pin-line text-brand-green" />Resumen de Puntos</h3>
                    <div className="space-y-2">
                      {pickupPoints.slice(0, 3).map((pp) => (
                        <div key={pp.id} className="flex items-start gap-3 bg-brand-light/50 rounded-xl p-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0"><i className="ri-map-pin-2-line text-brand-primary" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary">{pp.address}</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                              {pp.frequency && <span className="text-xs text-text-secondary"><i className="ri-calendar-line mr-1" />{pp.frequency}</span>}
                              {pp.schedule && <span className="text-xs text-text-secondary"><i className="ri-time-line mr-1" />{pp.schedule}</span>}
                              <span className="text-xs text-text-secondary"><i className="ri-archive-line mr-1" />{pp.container_count} tachos</span>
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
                {contacts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2"><i className="ri-contacts-line text-brand-green" />Contacto Principal</h3>
                    <div className="bg-brand-light/50 rounded-xl p-4 space-y-2">
                      <p className="text-sm font-medium text-text-primary">{contacts[0].name}</p><p className="text-xs text-text-secondary">{contacts[0].role}</p>
                      <div className="pt-2 border-t border-brand-border/40 space-y-1">
                        {contacts[0].phone && <p className="text-xs text-text-secondary"><i className="ri-phone-line mr-1.5" />{contacts[0].phone}</p>}
                        {contacts[0].email && <p className="text-xs text-text-secondary"><i className="ri-mail-line mr-1.5" />{contacts[0].email}</p>}
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2"><i className="ri-map-2-line text-brand-green" />Ubicacion</h3>
                  <div className="rounded-xl overflow-hidden border border-brand-border/60 aspect-[4/3]">
                    <iframe title="map" src={mapSrc} className="w-full h-full border-0" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div><h3 className="text-sm font-semibold text-text-primary flex items-center gap-2"><i className="ri-contacts-line text-brand-green" />Contactos</h3><p className="text-xs text-text-muted mt-0.5">Los visibles apareceran en la app movil del conductor</p></div>
                <button type="button" onClick={openNewContact} className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap"><i className="ri-add-line" />Nuevo Contacto</button>
              </div>
              {contacts.length === 0 ? (
                <div className="text-center py-8"><i className="ri-contacts-book-line text-4xl text-text-muted mb-3" /><p className="text-text-muted text-sm">No hay contactos registrados</p></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {contacts.map((c, idx) => {
                    const visible = getVisibility(idx);
                    return (
                      <div key={c.id} className="bg-brand-light/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0"><i className="ri-user-line text-brand-primary" /></div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-text-primary">{c.name}</p><p className="text-xs text-text-secondary">{c.role}</p></div></div>
                        <div className="space-y-1 pt-2 border-t border-brand-border/40">{c.phone && <p className="text-xs text-text-secondary"><i className="ri-phone-line mr-1.5" />{c.phone}</p>}{c.email && <p className="text-xs text-text-secondary"><i className="ri-mail-line mr-1.5" />{c.email}</p>}</div>
                        <div className="pt-2 border-t border-brand-border/40 flex items-center justify-between">
                          <span className="text-xs text-text-muted">Visible chofer</span>
                          <button type="button" onClick={() => setVisibility(idx, !visible)} className={'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ' + (visible ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200')}><i className={visible ? 'ri-eye-line' : 'ri-eye-off-line'} />{visible ? 'Si' : 'No'}</button>
                        </div>
                        <div className="pt-2 border-t border-brand-border/40 flex items-center justify-end gap-2">
                          <button type="button" onClick={() => openEditContact(c)} className="text-xs text-text-muted hover:text-brand-primary transition-colors"><i className="ri-edit-line mr-1" />Editar</button>
                          <button type="button" onClick={() => deleteContact(c.id)} className="text-xs text-text-muted hover:text-red-500 transition-colors"><i className="ri-delete-bin-line mr-1" />Eliminar</button>
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
              <div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold text-text-primary flex items-center gap-2"><i className="ri-map-pin-line text-brand-green" />Puntos de Recoleccion</h3></div><button type="button" onClick={openNewPickup} className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap"><i className="ri-add-line" />Nuevo Punto</button></div>
              {pickupPoints.length === 0 ? (
                <div className="text-center py-8"><i className="ri-map-pin-line text-4xl text-text-muted mb-3" /><p className="text-text-muted text-sm">No hay puntos registrados</p></div>
              ) : (
                <>
                  <div className="rounded-xl overflow-hidden border border-brand-border/60 aspect-[16/9]"><iframe title="pickup-map" src={mapSrc} className="w-full h-full border-0" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
                  <div className="space-y-3">
                    {pickupPoints.map((pp) => (
                      <div key={pp.id} className="bg-brand-light/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0"><i className="ri-map-pin-2-line text-brand-primary" /></div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium text-text-primary">{pp.address}</p><div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">{pp.frequency && <div className="flex items-center gap-1.5"><i className="ri-calendar-line text-text-muted text-xs" /><span className="text-xs text-text-secondary">{pp.frequency}</span></div>}{pp.schedule && <div className="flex items-center gap-1.5"><i className="ri-time-line text-text-muted text-xs" /><span className="text-xs text-text-secondary">{pp.schedule}</span></div>}<div className="flex items-center gap-1.5"><i className="ri-archive-line text-text-muted text-xs" /><span className="text-xs text-text-secondary">{pp.container_count} contenedores</span></div></div>{pp.observations && <div className="mt-2 p-2 bg-white rounded-lg border border-brand-border/40"><p className="text-xs text-text-muted"><i className="ri-information-line mr-1" />{pp.observations}</p></div>}</div>
                        <div className="flex items-center gap-2 flex-shrink-0"><button type="button" onClick={() => openEditPickup(pp)} className="p-2 rounded-lg text-text-muted hover:text-brand-primary transition-colors"><i className="ri-edit-line" /></button><button type="button" onClick={() => deletePickup(pp.id)} className="p-2 rounded-lg text-text-muted hover:text-red-500 transition-colors"><i className="ri-delete-bin-line" /></button></div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* CONTAINERS */}
          {activeTab === 'containers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold text-text-primary flex items-center gap-2"><i className="ri-archive-line text-brand-green" />Contenedores</h3></div><button type="button" onClick={openNewContainer} className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap"><i className="ri-add-line" />Nuevo Contenedor</button></div>
              {containers.length === 0 ? (
                <div className="text-center py-8"><i className="ri-archive-line text-4xl text-text-muted mb-3" /><p className="text-text-muted text-sm">No hay contenedores registrados</p></div>
              ) : (
                <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-brand-border/40"><th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">ID</th><th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Tipo</th><th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Capacidad</th><th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Ubicacion</th><th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Ult. Limpieza</th><th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Estado</th><th className="text-right text-xs font-medium text-text-muted uppercase px-4 py-3">Acciones</th></tr></thead><tbody>{containers.map((c) => (
                  <tr key={c.id} className="border-b border-brand-border/30 hover:bg-brand-light/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">{c.id.slice(0, 8)}</td><td className="px-4 py-3 text-sm text-text-secondary">{c.type}</td><td className="px-4 py-3 text-sm text-text-secondary">{c.capacity} L</td><td className="px-4 py-3 text-sm text-text-secondary">{c.location}</td><td className="px-4 py-3 text-sm text-text-secondary">{c.last_cleaned ? new Date(c.last_cleaned).toLocaleDateString('es-AR') : '—'}</td><td className="px-4 py-3"><span className={'inline-flex px-2 py-1 rounded-full text-xs font-medium border ' + (containerStatusColors[c.status] || 'bg-gray-100 text-gray-700 border-gray-200')}>{c.status === 'Active' ? 'Activo' : c.status === 'Inactive' ? 'Inactivo' : 'Mantenimiento'}</span></td>
                    <td className="px-4 py-3 text-right"><button type="button" onClick={() => openEditContainer(c)} className="p-1.5 text-text-muted hover:text-brand-primary transition-colors"><i className="ri-edit-line" /></button><button type="button" onClick={() => deleteContainer(c.id)} className="p-1.5 text-text-muted hover:text-red-500 transition-colors"><i className="ri-delete-bin-line" /></button></td>
                  </tr>
                ))}</tbody></table></div>
              )}
            </div>
          )}

          {/* HISTORY */}
          {activeTab === 'history' && (
            <div><h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2"><i className="ri-history-line text-brand-green" />Historial de Operaciones</h3>
              <div className="text-center py-10"><div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-4"><i className="ri-history-line text-3xl text-text-muted" /></div><p className="text-sm font-medium text-text-primary mb-1">Sin historial registrado</p><p className="text-xs text-text-muted max-w-sm mx-auto">El historial de colectas se genera automaticamente al completar hojas de ruta con este cliente.</p></div>
            </div>
          )}

          {/* DOCUMENTS */}
          {activeTab === 'documents' && (
            <div><h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2"><i className="ri-folder-line text-brand-green" />Documentos</h3>
              <div className="text-center py-10"><div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-4"><i className="ri-folder-line text-3xl text-text-muted" /></div><p className="text-sm font-medium text-text-primary mb-1">Sin documentos</p><p className="text-xs text-text-muted max-w-sm mx-auto">La carga de documentos se habilitara en una proxima actualizacion con Supabase Storage.</p></div>
            </div>
          )}

          {/* CONTRACTS */}
          {activeTab === 'contracts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold text-text-primary flex items-center gap-2"><i className="ri-file-shield-line text-brand-green" />Convenios y Contratos Municipales</h3><p className="text-xs text-text-muted mt-0.5">Documentos firmados con municipalidades o entidades publicas</p></div><button type="button" onClick={openNewContract} className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap"><i className="ri-add-line" />Nuevo Contrato</button></div>
              {contracts.length === 0 ? (
                <div className="text-center py-10"><div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-4"><i className="ri-file-shield-line text-3xl text-text-muted" /></div><p className="text-sm font-medium text-text-primary mb-1">Sin contratos registrados</p><p className="text-xs text-text-muted max-w-sm mx-auto">Carga los convenios municipales o contratos firmados con este cliente.</p><button type="button" onClick={openNewContract} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 border border-brand-border text-text-secondary rounded-lg text-sm font-medium hover:bg-brand-light transition-colors"><i className="ri-add-line" />Agregar primer contrato</button></div>
              ) : (
                <div className="space-y-3">
                  {contracts.map((c) => {
                    const cfg = cStatusConfig[c.status] || cStatusConfig.Active;
                    const today = new Date(); today.setHours(0, 0, 0, 0);
                    const rd = new Date(c.renewal_date || c.expiration_date); rd.setHours(0, 0, 0, 0);
                    const renewalDue = today.getTime() >= rd.getTime();
                    const renewalDiff = Math.ceil((rd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={c.id} className="bg-brand-light/50 rounded-xl p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap"><p className="text-sm font-semibold text-text-primary">{c.agreement_name}</p><span className={'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ' + cfg.color}><i className={cfg.icon} />{cfg.label}</span>{renewalDue && c.status !== 'Renewed' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 border border-rose-200"><i className="ri-alarm-warning-line" />Renovar tramite</span>}{!renewalDue && renewalDiff <= 30 && c.status !== 'Renewed' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200"><i className="ri-alarm-warning-line" />Renovar en {renewalDiff} dias</span>}</div>
                            <p className="text-xs text-text-secondary mt-1"><i className="ri-government-line mr-1" />{c.municipality}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-text-muted"><span><i className="ri-calendar-line mr-1" />Inicio: {new Date(c.start_date).toLocaleDateString('es-AR')}</span><span><i className="ri-calendar-check-line mr-1" />Vence: {new Date(c.expiration_date).toLocaleDateString('es-AR')}</span><span className={renewalDue && c.status !== 'Renewed' ? 'text-rose-600 font-medium' : 'text-text-muted'}><i className="ri-calendar-event-line mr-1" />Renovar: {new Date(c.renewal_date || c.expiration_date).toLocaleDateString('es-AR')}</span>{c.file_name && <span><i className="ri-attachment-line mr-1" />{c.file_name}</span>}</div>
                            {c.notes && <p className="text-xs text-text-muted mt-2 bg-white rounded-lg p-2 border border-brand-border/40"><i className="ri-information-line mr-1" />{c.notes}</p>}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">{c.status !== 'Renewed' && <button type="button" onClick={() => renewContract(c)} className="p-2 rounded-lg text-text-muted hover:text-sky-600 transition-colors" title="Renovar"><i className="ri-refresh-line" /></button>}<button type="button" onClick={() => openEditContract(c)} className="p-2 rounded-lg text-text-muted hover:text-brand-primary transition-colors" title="Editar"><i className="ri-edit-line" /></button><button type="button" onClick={() => deleteContract(c.id)} className="p-2 rounded-lg text-text-muted hover:text-red-500 transition-colors" title="Eliminar"><i className="ri-delete-bin-line" /></button></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-brand-border/60 flex items-center justify-between"><h3 className="text-base font-semibold text-text-primary">Editar Cliente</h3><button type="button" onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-brand-light transition-colors"><i className="ri-close-line text-lg" /></button></div>
            <div className="p-5 space-y-4">
              <div><label className={labelCls}>Nombre *</label><input type="text" value={editForm.fantasy_name} onChange={(e) => setEditForm((f) => ({ ...f, fantasy_name: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>CUIT</label><input type="text" value={editForm.cuit} onChange={(e) => setEditForm((f) => ({ ...f, cuit: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>Direccion</label><input type="text" value={editForm.address} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>Telefono</label><input type="text" value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>Zona</label><input type="text" value={editForm.location} onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))} className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-4"><div><label className={labelCls}>Estado</label><select value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))} className={selectCls}>{Object.entries(customerStatuses).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}</select></div><div><label className={labelCls}>Tipo</label><select value={editForm.type} onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))} className={selectCls}>{Object.entries(customerTypes).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}</select></div></div>
            </div>
            <div className="p-5 border-t border-brand-border/60 flex items-center justify-end gap-3"><button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap">Cancelar</button><button type="button" onClick={saveEdit} disabled={saving || !editForm.fantasy_name} className={'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap ' + (saving || !editForm.fantasy_name ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-green hover:bg-brand-green/90')}>{saving ? 'Guardando...' : 'Guardar Cambios'}</button></div>
          </div>
        </div>
      )}

      {/* CONTACT MODAL */}
      {showContactForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-brand-border/60 flex items-center justify-between"><h3 className="text-base font-semibold text-text-primary">{editingContactId ? 'Editar Contacto' : 'Nuevo Contacto'}</h3><button type="button" onClick={() => setShowContactForm(false)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-brand-light transition-colors"><i className="ri-close-line text-lg" /></button></div>
            <div className="p-5 space-y-4">
              <div><label className={labelCls}>Nombre *</label><input type="text" value={contactForm.name} onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>Rol</label><input type="text" value={contactForm.role} onChange={(e) => setContactForm((f) => ({ ...f, role: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>Telefono</label><input type="text" value={contactForm.phone} onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>Email</label><input type="email" value={contactForm.email} onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))} className={inputCls} /></div>
              <div className="flex items-center gap-3"><input type="checkbox" id="vdrv" checked={contactForm.visible_to_driver} onChange={(e) => setContactForm((f) => ({ ...f, visible_to_driver: e.target.checked }))} /><label htmlFor="vdrv" className="text-sm text-text-secondary cursor-pointer">Visible para chofer</label></div>
            </div>
            <div className="p-5 border-t border-brand-border/60 flex items-center justify-end gap-3"><button type="button" onClick={() => setShowContactForm(false)} className="px-4 py-2 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap">Cancelar</button><button type="button" onClick={saveContact} disabled={!contactForm.name} className={'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap ' + (contactForm.name ? 'bg-brand-green hover:bg-brand-green/90' : 'bg-gray-300 cursor-not-allowed')}>{editingContactId ? 'Guardar' : 'Crear'}</button></div>
          </div>
        </div>
      )}

      {/* PICKUP MODAL */}
      {showPickupForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-brand-border/60 flex items-center justify-between"><h3 className="text-base font-semibold text-text-primary">{editingPickupId ? 'Editar Punto' : 'Nuevo Punto'}</h3><button type="button" onClick={() => setShowPickupForm(false)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-brand-light transition-colors"><i className="ri-close-line text-lg" /></button></div>
            <div className="p-5 space-y-4">
              <div><label className={labelCls}>Direccion *</label><input type="text" value={pickupForm.address} onChange={(e) => setPickupForm((f) => ({ ...f, address: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>Frecuencia</label><input type="text" value={pickupForm.frequency} onChange={(e) => setPickupForm((f) => ({ ...f, frequency: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>Horario</label><input type="text" value={pickupForm.schedule} onChange={(e) => setPickupForm((f) => ({ ...f, schedule: e.target.value }))} className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-4"><div><label className={labelCls}>Latitud</label><input type="text" value={pickupForm.lat} onChange={(e) => setPickupForm((f) => ({ ...f, lat: e.target.value }))} className={inputCls} /></div><div><label className={labelCls}>Longitud</label><input type="text" value={pickupForm.lng} onChange={(e) => setPickupForm((f) => ({ ...f, lng: e.target.value }))} className={inputCls} /></div></div>
              <div><label className={labelCls}>Cant. Tachos</label><input type="number" value={pickupForm.container_count} onChange={(e) => setPickupForm((f) => ({ ...f, container_count: parseInt(e.target.value) || 0 }))} className={inputCls} /></div>
              <div><label className={labelCls}>Observaciones</label><textarea value={pickupForm.observations} onChange={(e) => setPickupForm((f) => ({ ...f, observations: e.target.value }))} rows={2} maxLength={500} className={inputCls + ' resize-none'} /></div>
            </div>
            <div className="p-5 border-t border-brand-border/60 flex items-center justify-end gap-3"><button type="button" onClick={() => setShowPickupForm(false)} className="px-4 py-2 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap">Cancelar</button><button type="button" onClick={savePickup} disabled={!pickupForm.address} className={'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap ' + (pickupForm.address ? 'bg-brand-green hover:bg-brand-green/90' : 'bg-gray-300 cursor-not-allowed')}>{editingPickupId ? 'Guardar' : 'Crear'}</button></div>
          </div>
        </div>
      )}

      {/* CONTAINER MODAL */}
      {showContainerForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-brand-border/60 flex items-center justify-between"><h3 className="text-base font-semibold text-text-primary">{editingContainerId ? 'Editar Contenedor' : 'Nuevo Contenedor'}</h3><button type="button" onClick={() => setShowContainerForm(false)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-brand-light transition-colors"><i className="ri-close-line text-lg" /></button></div>
            <div className="p-5 space-y-4">
              <div><label className={labelCls}>Tipo</label><select value={containerForm.type} onChange={(e) => setContainerForm((f) => ({ ...f, type: e.target.value }))} className={selectCls}>{['Tambor 200L','Tambor 100L','Bidon 200L','Bidon 100L','Bidon 50L','Cisterna 1000L'].map((t) => (<option key={t} value={t}>{t}</option>))}</select></div>
              <div><label className={labelCls}>Capacidad (L)</label><input type="number" value={containerForm.capacity} onChange={(e) => setContainerForm((f) => ({ ...f, capacity: parseInt(e.target.value) || 0 }))} className={inputCls} /></div>
              <div><label className={labelCls}>Estado</label><select value={containerForm.status} onChange={(e) => setContainerForm((f) => ({ ...f, status: e.target.value }))} className={selectCls}><option value="Active">Activo</option><option value="Inactive">Inactivo</option><option value="Maintenance">Mantenimiento</option></select></div>
              <div><label className={labelCls}>Ubicacion</label><input type="text" value={containerForm.location} onChange={(e) => setContainerForm((f) => ({ ...f, location: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>Ult. Limpieza</label><input type="date" value={containerForm.last_cleaned} onChange={(e) => setContainerForm((f) => ({ ...f, last_cleaned: e.target.value }))} className={inputCls} /></div>
            </div>
            <div className="p-5 border-t border-brand-border/60 flex items-center justify-end gap-3"><button type="button" onClick={() => setShowContainerForm(false)} className="px-4 py-2 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap">Cancelar</button><button type="button" onClick={saveContainer} className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap">{editingContainerId ? 'Guardar' : 'Crear'}</button></div>
          </div>
        </div>
      )}

      {/* CONTRACT MODAL */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-brand-border/60 flex items-center justify-between"><h3 className="text-base font-semibold text-text-primary">{editingContract ? 'Editar Contrato' : 'Nuevo Contrato'}</h3><button type="button" onClick={() => setShowContractModal(false)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-brand-light transition-colors"><i className="ri-close-line text-lg" /></button></div>
            <div className="p-5 space-y-4">
              <div><label className={labelCls}>Nombre Convenio *</label><input type="text" value={contractForm.agreement_name} onChange={(e) => setContractForm((f) => ({ ...f, agreement_name: e.target.value }))} placeholder="Ej: Convenio Municipal 2026" className={inputCls} /></div>
              <div><label className={labelCls}>Municipalidad *</label><input type="text" value={contractForm.municipality} onChange={(e) => setContractForm((f) => ({ ...f, municipality: e.target.value }))} placeholder="Ej: Municipalidad de Buenos Aires" className={inputCls} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className={labelCls}>Inicio *</label><input type="date" value={contractForm.start_date} onChange={(e) => setContractForm((f) => ({ ...f, start_date: e.target.value }))} className={inputCls} /></div><div><label className={labelCls}>Vencimiento *</label><input type="date" value={contractForm.expiration_date} onChange={(e) => setContractForm((f) => ({ ...f, expiration_date: e.target.value }))} className={inputCls} /></div></div>
              <div><label className={labelCls}>Renovar tramite *</label><input type="date" value={contractForm.renewal_date} onChange={(e) => setContractForm((f) => ({ ...f, renewal_date: e.target.value }))} className={inputCls} /><p className="text-xs text-text-muted mt-1">Fecha en que el sistema avisa que hay que renovar</p></div>
              <div>
                <label className={labelCls}>Documento</label>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={(e) => { const f = e.target.files?.[0]; if (f) setContractForm((prev) => ({ ...prev, file_name: f.name })); }} className="hidden" />
                <div className="flex items-center gap-3"><button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-2 border border-brand-border text-text-secondary rounded-lg text-sm font-medium hover:bg-brand-light transition-colors"><i className="ri-upload-cloud-line" />{contractForm.file_name ? 'Cambiar' : 'Seleccionar'}</button>{contractForm.file_name && <span className="text-xs text-text-secondary"><i className="ri-file-text-line text-brand-green mr-1" />{contractForm.file_name}</span>}</div>
              </div>
              <div><label className={labelCls}>Notas</label><textarea value={contractForm.notes} onChange={(e) => setContractForm((f) => ({ ...f, notes: e.target.value }))} rows={3} maxLength={500} className={inputCls + ' resize-none'} /><p className="text-xs text-text-muted mt-1 text-right">{contractForm.notes.length}/500</p></div>
            </div>
            <div className="p-5 border-t border-brand-border/60 flex items-center justify-end gap-3"><button type="button" onClick={() => setShowContractModal(false)} className="px-4 py-2 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap">Cancelar</button><button type="button" onClick={saveContract} disabled={!contractForm.agreement_name || !contractForm.municipality || !contractForm.start_date || !contractForm.expiration_date} className={'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap ' + (contractForm.agreement_name && contractForm.municipality && contractForm.start_date && contractForm.expiration_date ? 'bg-brand-green hover:bg-brand-green/90' : 'bg-gray-300 cursor-not-allowed')}>{editingContract ? 'Guardar Cambios' : 'Crear Contrato'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function computeContractStatus(expirationDate: string): string {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const exp = new Date(expirationDate); exp.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Expired';
  if (diffDays <= 30) return 'Expiring';
  return 'Active';
}