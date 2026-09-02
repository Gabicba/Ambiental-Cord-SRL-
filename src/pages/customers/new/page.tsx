import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { customerStatuses, customerTypes } from '@/hooks/useCustomers';
import { useDrivers } from '@/hooks/useDrivers';

type Contact = { name: string; role: string; phone: string; whatsapp: string; email: string };
type Branch = { name: string; address: string; schedule: string; containerCount: number; observations: string };
type Container = { quantity: number; type: string; capacity: number; status: string; observations: string };

type TabKey = 'general' | 'contacts' | 'location' | 'operations' | 'branches' | 'containers' | 'commercial' | 'history';

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'general', label: 'General', icon: 'ri-file-info-line' },
  { key: 'contacts', label: 'Contactos', icon: 'ri-contacts-line' },
  { key: 'location', label: 'Ubicacion', icon: 'ri-map-pin-line' },
  { key: 'operations', label: 'Operacion', icon: 'ri-settings-3-line' },
  { key: 'branches', label: 'Sucursales', icon: 'ri-building-2-line' },
  { key: 'containers', label: 'Tachos', icon: 'ri-archive-line' },
  { key: 'commercial', label: 'Comercial', icon: 'ri-briefcase-line' },
  { key: 'history', label: 'Historial', icon: 'ri-history-line' },
];

const ivaOptions = ['Responsable Inscripto', 'Monotributo', 'Exento', 'Consumidor Final'];
const industryOptions = ['Restaurante', 'Bar', 'Hotel', 'Fabrica', 'Catering', 'Panaderia', 'Empanadas', 'Pizzeria', 'Cerveceria', 'Otro'];
const categoryOptions = ['A', 'B', 'C'];
const frequencyOptions = ['semanal', 'quincenal', 'mensual'];
const zoneOptions = ['Centro', 'Norte', 'Sur', 'Este', 'Oeste', 'Palermo', 'San Telmo', 'Flores', 'Villa Crespo', 'Recoleta', 'Nueva Cordoba'];
const paymentOptions = ['Transferencia', 'Efectivo', 'Cheque', 'Tarjeta', 'Mercado Pago'];
const weekDays = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
const containerTypes = ['Tambor 200L', 'Tambor 100L', 'Bidon 200L', 'Bidon 100L', 'Bidon 50L', 'Cisterna 1000L'];
const containerStatuses = [
  { value: 'Active', label: 'Activo' },
  { value: 'Inactive', label: 'Inactivo' },
  { value: 'Maintenance', label: 'Mantenimiento' },
];

const inputCls = 'w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30';
const selectCls = 'w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30 appearance-none cursor-pointer';
const labelCls = 'text-xs font-medium text-text-muted uppercase block mb-1.5';

export default function CustomerNewPage() {
  const navigate = useNavigate();
  const { drivers } = useDrivers();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('general');

  const [form, setForm] = useState({
    fantasyName: '',
    businessName: '',
    cuit: '',
    ivaCondition: 'Responsable Inscripto',
    industry: 'Restaurante',
    category: 'A',
    status: 'Prospect',
    type: 'Prospect',
    joinedAt: new Date().toISOString().split('T')[0],
    phone: '',
    email: '',
    address: '',
    province: 'Buenos Aires',
    city: '',
    neighborhood: '',
    zipCode: '',
    lat: '',
    lng: '',
    contacts: [{ name: '', role: '', phone: '', whatsapp: '', email: '' }] as Contact[],
    visitDays: [] as string[],
    frequency: 'semanal',
    attentionHours: '',
    recommendedHours: '',
    zone: '',
    habitualDriverId: '',
    operationNotes: '',
    branches: [{ name: '', address: '', schedule: '', containerCount: 0, observations: '' }] as Branch[],
    containers: [{ quantity: 1, type: 'Tambor 200L', capacity: 200, status: 'Active', observations: '' }] as Container[],
    ucoPayment: false,
    paymentMethod: 'Transferencia',
    deliveredProducts: '',
    agreement: '',
    contract: '',
    notes: '',
  });

  const update = (field: keyof typeof form, value: unknown) => setForm((f) => ({ ...f, [field]: value }));

  const updateContact = (i: number, field: keyof Contact, value: string) =>
    setForm((f) => {
      const contacts = [...f.contacts];
      contacts[i] = { ...contacts[i], [field]: value };
      return { ...f, contacts };
    });
  const addContact = () => setForm((f) => ({ ...f, contacts: [...f.contacts, { name: '', role: '', phone: '', whatsapp: '', email: '' }] }));
  const removeContact = (i: number) => setForm((f) => ({ ...f, contacts: f.contacts.filter((_, idx) => idx !== i) }));

  const updateBranch = (i: number, field: keyof Branch, value: string | number) =>
    setForm((f) => {
      const branches = [...f.branches];
      branches[i] = { ...branches[i], [field]: value };
      return { ...f, branches };
    });
  const addBranch = () => setForm((f) => ({ ...f, branches: [...f.branches, { name: '', address: '', schedule: '', containerCount: 0, observations: '' }] }));
  const removeBranch = (i: number) => setForm((f) => ({ ...f, branches: f.branches.filter((_, idx) => idx !== i) }));

  const updateContainer = (i: number, field: keyof Container, value: string | number) =>
    setForm((f) => {
      const containers = [...f.containers];
      containers[i] = { ...containers[i], [field]: value };
      return { ...f, containers };
    });
  const addContainer = () => setForm((f) => ({ ...f, containers: [...f.containers, { quantity: 1, type: 'Tambor 200L', capacity: 200, status: 'Active', observations: '' }] }));
  const removeContainer = (i: number) => setForm((f) => ({ ...f, containers: f.containers.filter((_, idx) => idx !== i) }));

  const toggleVisitDay = (day: string) =>
    setForm((f) => ({
      ...f,
      visitDays: f.visitDays.includes(day) ? f.visitDays.filter((d) => d !== day) : [...f.visitDays, day],
    }));

  const mapSrc = useMemo(() => {
    const latitude = form.lat ? parseFloat(form.lat) : -34.6037;
    const longitude = form.lng ? parseFloat(form.lng) : -58.3816;
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.0!2d-58.3816!3d-34.6037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM2JzAwLjAiUyA1OMKwMjInNDguMCJX!5e0!3m2!1ses!2sar!4v1600000000000';
    }
    return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.0!2d' + longitude + '!3d' + latitude + '!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM2JzAwLjAiUyA1OMKwMjInNDguMCJX!5e0!3m2!1ses!2sar!4v1600000000000';
  }, [form.lat, form.lng]);

  const statusOptions = Object.entries(customerStatuses).map(([key, config]) => ({ value: key, label: config.label }));
  const typeOptions = Object.entries(customerTypes).map(([key, config]) => ({ value: key, label: config.label }));
  const activeDrivers = drivers.filter((d) => d.status === 'Active' || d.status === 'On_Route');

  const isValid = form.fantasyName && form.address && form.city && form.phone && form.status;

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    setSaveError(null);

    try {
      const addressFirstPart = form.address ? form.address.split(",")[0] : "";
      const location = form.address ? (form.city || form.province) + ", " + addressFirstPart : form.zone;

      const taxInfo = {
        business_name: form.businessName,
        iva_condition: form.ivaCondition,
        industry: form.industry,
        category: form.category,
        email: form.email,
        joined_at: form.joinedAt,
        province: form.province,
        city: form.city,
        neighborhood: form.neighborhood,
        zip_code: form.zipCode,
        lat: form.lat,
        lng: form.lng,
        visit_days: form.visitDays,
        attention_hours: form.attentionHours,
        recommended_hours: form.recommendedHours,
        zone: form.zone,
        habitual_driver_id: form.habitualDriverId,
        operation_notes: form.operationNotes,
        uco_payment: form.ucoPayment,
        payment_method: form.paymentMethod,
        delivered_products: form.deliveredProducts,
        agreement: form.agreement,
        contract: form.contract,
        notes: form.notes,
      };

      const { data: customer, error: customerErr } = await supabase
        .from('customers')
        .insert({
          fantasy_name: form.fantasyName,
          cuit: form.cuit || null,
          address: form.address,
          phone: form.phone,
          location: form.zone || location,
          status: form.status,
          type: form.type,
          tax_info: taxInfo,
        })
        .select()
        .single();

      if (customerErr) throw customerErr;
      const customerId = customer.id;

      const validContacts = form.contacts.filter((c) => c.name.trim());
      if (validContacts.length > 0) {
        const contactRows = validContacts.map((c) => ({
          customer_id: customerId,
          name: c.name,
          role: c.role || null,
          phone: c.phone || null,
          email: c.email || null,
          visible_to_driver: true,
        }));
        const { error: contactsErr } = await supabase.from('customer_contacts').insert(contactRows);
        if (contactsErr) throw contactsErr;
      }

      const validBranches = form.branches.filter((b) => b.name.trim() || b.address.trim());
      if (validBranches.length > 0) {
        const branchRows = validBranches.map((b) => ({
          customer_id: customerId,
          address: b.address || b.name,
          frequency: form.frequency,
          schedule: b.schedule || null,
          container_count: b.containerCount || 0,
          observations: b.observations || null,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
        }));
        const { error: branchesErr } = await supabase.from('pickup_points').insert(branchRows);
        if (branchesErr) throw branchesErr;
      }

      const validContainers = form.containers.filter((c) => c.quantity > 0);
      if (validContainers.length > 0) {
        const containerRows = validContainers.flatMap((c) =>
          Array.from({ length: c.quantity }, () => ({
            customer_id: customerId,
            type: c.type,
            capacity: c.capacity,
            status: c.status,
            location: form.address,
          }))
        );
        const { error: containersErr } = await supabase.from('containers').insert(containerRows);
        if (containersErr) throw containersErr;
      }

      navigate('/customers');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al guardar el cliente';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const summaryContacts = form.contacts.filter((c) => c.name).length;
  const summaryBranches = form.branches.filter((b) => b.name || b.address).length;
  const summaryContainers = form.containers.reduce((sum, c) => sum + (c.quantity || 0), 0);

  const tabActiveCls = 'text-brand-green border-brand-green';
  const tabInactiveCls = 'text-text-secondary border-transparent hover:text-text-primary';
  const tabBaseCls = 'px-4 py-3 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap';

  const dayActiveCls = 'bg-brand-green text-white border-brand-green';
  const dayInactiveCls = 'bg-white text-text-secondary border-brand-border hover:bg-brand-light';
  const dayBaseCls = 'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap';

  const btnPrimaryCls = 'px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap bg-brand-green hover:bg-brand-green/90';
  const btnDisabledCls = 'px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap bg-gray-300 cursor-not-allowed';
  const btnCancelCls = 'px-5 py-2.5 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap';

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Nuevo Cliente</h1>
        <p className="text-sm text-text-secondary mt-1">Registrar un nuevo cliente con toda su informacion operativa y comercial</p>
      </div>

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <i className="ri-error-warning-line text-red-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">Error al guardar</p>
            <p className="text-xs text-red-600 mt-0.5">{saveError}</p>
          </div>
          <button type="button" onClick={() => setSaveError(null)} className="text-red-400 hover:text-red-600">
            <i className="ri-close-line" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-brand-border/60 overflow-hidden">
        <div className="border-b border-brand-border/60 overflow-x-auto">
          <div className="flex min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={tabBaseCls + ' ' + (activeTab === tab.key ? tabActiveCls : tabInactiveCls)}
              >
                <i className={tab.icon} />
                {tab.label}
                {tab.key === 'contacts' && summaryContacts > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-light text-xs text-text-secondary">{summaryContacts}</span>
                )}
                {tab.key === 'branches' && summaryBranches > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-light text-xs text-text-secondary">{summaryBranches}</span>
                )}
                {tab.key === 'containers' && summaryContainers > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-light text-xs text-text-secondary">{summaryContainers}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* === GENERAL === */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <i className="ri-building-line text-brand-primary" /> Datos Generales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelCls}>Nombre de Fantasia *</label>
                  <input type="text" value={form.fantasyName} onChange={(e) => update('fantasyName', e.target.value)} placeholder="Ej: Parrilla Don Jose" className={inputCls} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>Razon Social</label>
                  <input type="text" value={form.businessName} onChange={(e) => update('businessName', e.target.value)} placeholder="Ej: Don Jose SA" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>CUIT</label>
                  <input type="text" value={form.cuit} onChange={(e) => update('cuit', e.target.value)} placeholder="Ej: 30-12345678-9" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Condicion IVA</label>
                  <select value={form.ivaCondition} onChange={(e) => update('ivaCondition', e.target.value)} className={selectCls}>
                    {ivaOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Rubro</label>
                  <select value={form.industry} onChange={(e) => update('industry', e.target.value)} className={selectCls}>
                    {industryOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Categoria</label>
                  <select value={form.category} onChange={(e) => update('category', e.target.value)} className={selectCls}>
                    {categoryOptions.map((o) => (
                      <option key={o} value={o}>Categoria {o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Estado *</label>
                  <select
                    value={form.status}
                    onChange={(e) => {
                      const s = e.target.value;
                      update('status', s);
                      update('type', s === 'Prospect' ? 'Prospect' : s === 'Active' ? 'Client' : 'Client');
                    }}
                    className={selectCls}
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tipo</label>
                  <select value={form.type} onChange={(e) => update('type', e.target.value)} className={selectCls}>
                    {typeOptions.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Fecha de Alta</label>
                  <input type="date" value={form.joinedAt} onChange={(e) => update('joinedAt', e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>
          )}

          {/* === CONTACTOS === */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <i className="ri-contacts-line text-brand-primary" /> Contactos
                </h3>
                <button onClick={addContact} type="button" className="text-sm text-brand-green hover:text-brand-green/80 font-medium flex items-center gap-1.5">
                  <i className="ri-add-line" /> Agregar contacto
                </button>
              </div>
              {form.contacts.map((c, i) => (
                <div key={i} className="bg-brand-light/50 rounded-xl p-4 space-y-3 relative">
                  {form.contacts.length > 1 && (
                    <button onClick={() => removeContact(i)} type="button" className="absolute top-3 right-3 text-text-muted hover:text-red-500 transition-colors">
                      <i className="ri-delete-bin-line" />
                    </button>
                  )}
                  <p className="text-xs font-medium text-text-muted uppercase">Contacto {i + 1}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className={labelCls}>Nombre completo</label>
                      <input type="text" value={c.name} onChange={(e) => updateContact(i, 'name', e.target.value)} placeholder="Ej: Roberto Diaz" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Cargo / Rol</label>
                      <input type="text" value={c.role} onChange={(e) => updateContact(i, 'role', e.target.value)} placeholder="Ej: Encargado" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Telefono</label>
                      <input type="text" value={c.phone} onChange={(e) => updateContact(i, 'phone', e.target.value)} placeholder="Ej: +54 11 4567-8901" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>WhatsApp</label>
                      <input type="text" value={c.whatsapp} onChange={(e) => updateContact(i, 'whatsapp', e.target.value)} placeholder="Ej: +54 11 4567-8902" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input type="email" value={c.email} onChange={(e) => updateContact(i, 'email', e.target.value)} placeholder="Ej: contacto@empresa.com" className={inputCls} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* === UBICACION === */}
          {activeTab === 'location' && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <i className="ri-map-pin-line text-brand-primary" /> Direccion Principal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelCls}>Direccion *</label>
                  <input type="text" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Ej: Av. Corrientes 3456, CABA" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Provincia</label>
                  <input type="text" value={form.province} onChange={(e) => update('province', e.target.value)} placeholder="Ej: Buenos Aires" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Ciudad / Localidad *</label>
                  <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Ej: Ciudad Autonoma de Buenos Aires" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Barrio</label>
                  <input type="text" value={form.neighborhood} onChange={(e) => update('neighborhood', e.target.value)} placeholder="Ej: Palermo" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Codigo Postal</label>
                  <input type="text" value={form.zipCode} onChange={(e) => update('zipCode', e.target.value)} placeholder="Ej: 1043" className={inputCls} />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 pt-4 border-t border-brand-border/40">
                <i className="ri-map-2-line text-brand-primary" /> Coordenadas GPS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Latitud</label>
                  <input type="text" value={form.lat} onChange={(e) => update('lat', e.target.value)} placeholder="Ej: -34.6037" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Longitud</label>
                  <input type="text" value={form.lng} onChange={(e) => update('lng', e.target.value)} placeholder="Ej: -58.3816" className={inputCls} />
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-brand-border/60 aspect-[16/9]">
                <iframe title="customer-map" src={mapSrc} className="w-full h-full border-0" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
              <p className="text-xs text-text-muted">
                <i className="ri-information-line mr-1" /> Ingresa coordenadas para centrar el mapa en la ubicacion exacta.
              </p>
            </div>
          )}

          {/* === OPERACION === */}
          {activeTab === 'operations' && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <i className="ri-calendar-line text-brand-primary" /> Dias de Visita
              </h3>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => {
                  const active = form.visitDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleVisitDay(day)}
                      className={dayBaseCls + ' ' + (active ? dayActiveCls : dayInactiveCls)}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-brand-border/40">
                <div>
                  <label className={labelCls}>Frecuencia de recoleccion</label>
                  <select value={form.frequency} onChange={(e) => update('frequency', e.target.value)} className={selectCls}>
                    {frequencyOptions.map((o) => (
                      <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Zona</label>
                  <select value={form.zone} onChange={(e) => update('zone', e.target.value)} className={selectCls}>
                    <option value="">Seleccionar zona...</option>
                    {zoneOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Horario de atencion</label>
                  <input type="text" value={form.attentionHours} onChange={(e) => update('attentionHours', e.target.value)} placeholder="Ej: 08:00 - 18:00" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Horario recomendado</label>
                  <input type="text" value={form.recommendedHours} onChange={(e) => update('recommendedHours', e.target.value)} placeholder="Ej: 10:00 - 12:00" className={inputCls} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>Chofer habitual (opcional)</label>
                  <select value={form.habitualDriverId} onChange={(e) => update('habitualDriverId', e.target.value)} className={selectCls}>
                    <option value="">Sin asignar</option>
                    {activeDrivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} — Lic. {d.license_type || 'N/D'}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-4 border-t border-brand-border/40">
                <label className={labelCls}>Observaciones operativas</label>
                <textarea value={form.operationNotes} onChange={(e) => update('operationNotes', e.target.value)} placeholder="Accesos especiales, preferencias de horario, indicaciones para el conductor..." rows={4} maxLength={500} className={inputCls + ' resize-none'} />
                <p className="text-xs text-text-muted mt-1 text-right">{form.operationNotes.length}/500</p>
              </div>
            </div>
          )}

          {/* === SUCURSALES === */}
          {activeTab === 'branches' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <i className="ri-building-2-line text-brand-primary" /> Puntos de Origen / Sucursales
                </h3>
                <button onClick={addBranch} type="button" className="text-sm text-brand-green hover:text-brand-green/80 font-medium flex items-center gap-1.5">
                  <i className="ri-add-line" /> Agregar sucursal
                </button>
              </div>
              {form.branches.map((b, i) => (
                <div key={i} className="bg-brand-light/50 rounded-xl p-4 space-y-3 relative">
                  {form.branches.length > 1 && (
                    <button onClick={() => removeBranch(i)} type="button" className="absolute top-3 right-3 text-text-muted hover:text-red-500 transition-colors">
                      <i className="ri-delete-bin-line" />
                    </button>
                  )}
                  <p className="text-xs font-medium text-text-muted uppercase">Sucursal {i + 1}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Nombre de sede</label>
                      <input type="text" value={b.name} onChange={(e) => updateBranch(i, 'name', e.target.value)} placeholder="Ej: Casa Central" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Direccion</label>
                      <input type="text" value={b.address} onChange={(e) => updateBranch(i, 'address', e.target.value)} placeholder="Ej: Av. 9 de Julio 2000" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Horarios</label>
                      <input type="text" value={b.schedule} onChange={(e) => updateBranch(i, 'schedule', e.target.value)} placeholder="Ej: Lun-Mie-Vie 08:00" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Cantidad de tachos</label>
                      <input type="number" value={b.containerCount} onChange={(e) => updateBranch(i, 'containerCount', parseInt(e.target.value) || 0)} min={0} className={inputCls} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>Observaciones</label>
                      <input type="text" value={b.observations} onChange={(e) => updateBranch(i, 'observations', e.target.value)} placeholder="Acceso, indicaciones especiales..." className={inputCls} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* === TACHOS === */}
          {activeTab === 'containers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <i className="ri-archive-line text-brand-primary" /> Comodatos / Tachos
                </h3>
                <button onClick={addContainer} type="button" className="text-sm text-brand-green hover:text-brand-green/80 font-medium flex items-center gap-1.5">
                  <i className="ri-add-line" /> Agregar tacho
                </button>
              </div>
              {form.containers.map((c, i) => (
                <div key={i} className="bg-brand-light/50 rounded-xl p-4 space-y-3 relative">
                  {form.containers.length > 1 && (
                    <button onClick={() => removeContainer(i)} type="button" className="absolute top-3 right-3 text-text-muted hover:text-red-500 transition-colors">
                      <i className="ri-delete-bin-line" />
                    </button>
                  )}
                  <p className="text-xs font-medium text-text-muted uppercase">Tacho {i + 1}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>Cantidad</label>
                      <input type="number" value={c.quantity} onChange={(e) => updateContainer(i, 'quantity', parseInt(e.target.value) || 1)} min={1} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Tipo</label>
                      <select value={c.type} onChange={(e) => updateContainer(i, 'type', e.target.value)} className={selectCls}>
                        {containerTypes.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Capacidad (L)</label>
                      <input type="number" value={c.capacity} onChange={(e) => updateContainer(i, 'capacity', parseInt(e.target.value) || 0)} min={10} step={10} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Estado</label>
                      <select value={c.status} onChange={(e) => updateContainer(i, 'status', e.target.value)} className={selectCls}>
                        {containerStatuses.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>Observaciones</label>
                      <input type="text" value={c.observations} onChange={(e) => updateContainer(i, 'observations', e.target.value)} placeholder="Estado fisico, ubicacion especifica..." className={inputCls} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* === COMERCIAL === */}
          {activeTab === 'commercial' && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <i className="ri-briefcase-line text-brand-primary" /> Informacion Comercial
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-brand-light/50 rounded-lg">
                  <button
                    type="button"
                    onClick={() => update('ucoPayment', !form.ucoPayment)}
                    className={'w-11 h-6 rounded-full transition-colors relative ' + (form.ucoPayment ? 'bg-brand-green' : 'bg-gray-300')}
                  >
                    <span className={'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ' + (form.ucoPayment ? 'translate-x-5' : '')} />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-text-primary">UCO Pago</p>
                    <p className="text-xs text-text-muted">{form.ucoPayment ? 'Si — El cliente paga por el servicio' : 'No — Servicio gratuito'}</p>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Forma de pago habitual</label>
                  <select value={form.paymentMethod} onChange={(e) => update('paymentMethod', e.target.value)} className={selectCls}>
                    {paymentOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>Productos entregados</label>
                  <input type="text" value={form.deliveredProducts} onChange={(e) => update('deliveredProducts', e.target.value)} placeholder="Ej: Aceite de cocina usado, grasa animal..." className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Convenio</label>
                  <input type="text" value={form.agreement} onChange={(e) => update('agreement', e.target.value)} placeholder="Ej: Convenio anual 2026" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Contrato</label>
                  <input type="text" value={form.contract} onChange={(e) => update('contract', e.target.value)} placeholder="Ej: CONTR-2026-001" className={inputCls} />
                </div>
              </div>
            </div>
          )}

          {/* === HISTORIAL === */}
          {activeTab === 'history' && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-4">
                <i className="ri-history-line text-3xl text-text-muted" />
              </div>
              <p className="text-sm font-medium text-text-primary mb-1">Historial de operaciones</p>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Los datos de litros retirados, visitas, manifiestos, certificados, pagos e incidencias se generan automaticamente con las operaciones del cliente.
              </p>
            </div>
          )}

          {/* Summary */}
          {isValid && (
            <div className="bg-brand-green/5 border border-brand-green/20 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-brand-green mb-2">Resumen</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-xs text-text-muted">Nombre</p>
                  <p className="font-medium text-text-primary">{form.fantasyName}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Direccion</p>
                  <p className="font-medium text-text-primary">{form.address}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Ciudad</p>
                  <p className="font-medium text-text-primary">{form.city}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Telefono</p>
                  <p className="font-medium text-text-primary">{form.phone}</p>
                </div>
              </div>
              {(form.contacts.some((c) => c.name) || form.branches.some((b) => b.name || b.address) || form.containers.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-2 pt-2 border-t border-brand-green/10">
                  {summaryContacts > 0 && (
                    <div>
                      <p className="text-xs text-text-muted">Contactos</p>
                      <p className="font-medium text-text-primary">{summaryContacts}</p>
                    </div>
                  )}
                  {summaryBranches > 0 && (
                    <div>
                      <p className="text-xs text-text-muted">Sucursales</p>
                      <p className="font-medium text-text-primary">{summaryBranches}</p>
                    </div>
                  )}
                  {summaryContainers > 0 && (
                    <div>
                      <p className="text-xs text-text-muted">Tachos</p>
                      <p className="font-medium text-text-primary">{summaryContainers} unidades</p>
                    </div>
                  )}
                  {form.habitualDriverId && (
                    <div>
                      <p className="text-xs text-text-muted">Chofer habitual</p>
                      <p className="font-medium text-text-primary">{activeDrivers.find((d) => d.id === form.habitualDriverId)?.name || '—'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-brand-border/40">
            <button onClick={() => navigate('/customers')} type="button" className={btnCancelCls}>
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid || saving}
              type="button"
              className={isValid && !saving ? btnPrimaryCls : btnDisabledCls}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <i className="ri-loader-4-line animate-spin" /> Guardando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <i className="ri-check-line" /> Crear Cliente
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}