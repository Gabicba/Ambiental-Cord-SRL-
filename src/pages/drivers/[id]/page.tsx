import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { useDrivers, driverStatuses } from '@/hooks/useDrivers';
import { useTrucks } from '@/hooks/useTrucks';

interface DriverData {
  id: string; name: string; phone: string | null; dni: string | null;
  license_type: string | null; license_number: string | null;
  license_expiry: string | null; license_issue_date: string | null;
  status: string; assigned_truck_id: string | null; email: string | null;
  joined_at: string | null; birth_date: string | null; address: string | null;
  emergency_contact: Record<string, unknown> | null; notes: string | null;
  created_at: string; updated_at: string; deleted_at: string | null;
  auth_user_id: string | null;
}

interface EquipmentItem {
  id: string; employee_id: string; item_type: string; size: string | null;
  quantity: number; delivery_date: string | null; replacement_date: string | null;
  notes: string | null;
}

const equipmentLabels: Record<string, string> = {
  uniform_shirt: 'Camisa de Uniforme', uniform_pants: 'Pantalon de Uniforme',
  uniform_jacket: 'Campera de Uniforme', safety_boots: 'Botas de Seguridad',
  safety_gloves: 'Guantes de Seguridad', safety_glasses: 'Anteojos de Seguridad',
  safety_vest: 'Chaleco Reflectivo', helmet: 'Casco', other: 'Otro',
};

const equipmentIcons: Record<string, string> = {
  uniform_shirt: 'ri-shirt-line', uniform_pants: 'ri-checkbox-blank-line',
  uniform_jacket: 'ri-t-shirt-line', safety_boots: 'ri-footprint-line',
  safety_gloves: 'ri-hand-sanitizer-line', safety_glasses: 'ri-glasses-line',
  safety_vest: 'ri-shirt-line', helmet: 'ri-user-star-line', other: 'ri-box-3-line',
};

function getEqStatus(replacementDate: string | null): { label: string; color: string; dot: string } {
  if (!replacementDate) return { label: 'Sin fecha', color: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-500' };
  const d = new Date(replacementDate); const now = new Date();
  if (d < now) return { label: 'Vencido', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' };
  const diff = (d.getTime() - now.getTime()) / (1000*60*60*24*30);
  if (diff < 3) return { label: 'Proximo', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
  return { label: 'Vigente', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
}

function getLicenseStatus(expiry: string | null): { label: string; color: string } {
  if (!expiry) return { label: 'Sin datos', color: 'bg-gray-100 text-gray-700 border-gray-200' };
  const d = new Date(expiry); const now = new Date();
  if (d < now) return { label: 'Vencida', color: 'bg-red-100 text-red-700 border-red-200' };
  const diff = (d.getTime() - now.getTime()) / (1000*60*60*24*30);
  if (diff < 3) return { label: 'Proxima a vencer', color: 'bg-amber-100 text-amber-700 border-amber-200' };
  return { label: 'Vigente', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
}

const tabs = [
  { id: 'general', label: 'General' }, { id: 'license', label: 'Licencia' },
  { id: 'equipment', label: 'Equipamiento' }, { id: 'performance', label: 'Rendimiento' },
];

export default function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteDriver } = useDrivers();
  const { trucks } = useTrucks();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState<DriverData | null>(null);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessEmail, setAccessEmail] = useState('');
  const [accessPassword, setAccessPassword] = useState('');
  const [accessSaving, setAccessSaving] = useState(false);
  const [accessError, setAccessError] = useState('');
  const [accessSuccess, setAccessSuccess] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', dni: '', email: '', address: '', status: '', assigned_truck_id: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: d, error: e } = await supabase.from('drivers').select('*').eq('id', id).is('deleted_at', null).maybeSingle();
      if (e) throw e;
      if (!d) { setError('No encontrado'); setLoading(false); return; }
      setDriver(d as DriverData);
      const { data: eq } = await supabase.from('employee_equipment').select('*').eq('employee_id', id);
      setEquipment((eq as EquipmentItem[]) || []);
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (<div className="flex items-center justify-center py-20"><div className="flex flex-col items-center gap-4"><div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" /><p className="text-sm text-text-secondary">Cargando...</p></div></div>);
  if (error || !driver) return (
    <div className="space-y-4">
      <button type="button" onClick={() => navigate('/drivers')} className="text-sm text-text-secondary hover:text-brand-primary transition-colors">← Volver a Conductores</button>
      <div className="bg-white rounded-xl p-8 text-center border border-brand-border/60"><i className="ri-user-line text-5xl text-text-muted mb-4" /><h2 className="text-xl font-semibold text-text-primary">Conductor no encontrado</h2></div>
    </div>
  );

  const assignedTruck = driver.assigned_truck_id ? trucks.find((t) => t.id === driver.assigned_truck_id) : null;
  const statusCfg = driverStatuses[driver.status as keyof typeof driverStatuses];
  const licenseStatus = getLicenseStatus(driver.license_expiry);
  const emergency = (driver.emergency_contact || {}) as Record<string, unknown>;

  const openEdit = () => {
    setEditForm({ name: driver.name, phone: driver.phone || '', dni: driver.dni || '', email: driver.email || '', address: driver.address || '', status: driver.status, assigned_truck_id: driver.assigned_truck_id || '', notes: driver.notes || '' });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const updated = await api.patch<DriverData>(`/drivers/${driver.id}`, {
        name: editForm.name || undefined,
        phone: editForm.phone || undefined,
        dni: editForm.dni || undefined,
        email: editForm.email || undefined,
        address: editForm.address || undefined,
        assignedTruckId: editForm.assigned_truck_id || undefined,
        notes: editForm.notes || undefined,
      });
      setDriver({ ...driver, ...updated });
      setShowEditModal(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      await deleteDriver(driver.id);
      navigate('/drivers');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    }
  };

  const handleCreateAccess = async () => {
    if (!accessEmail || !accessPassword) return;
    setAccessSaving(true);
    setAccessError('');
    try {
      await api.post(`/drivers/${driver.id}/create-access`, {
        email: accessEmail,
        password: accessPassword,
      });
      setAccessSuccess(true);
      setTimeout(() => {
        setShowAccessModal(false);
        setAccessSuccess(false);
        setAccessEmail('');
        setAccessPassword('');
        fetchData();
      }, 1500);
    } catch (e) {
      setAccessError(e instanceof Error ? e.message : 'Error al crear acceso');
    } finally {
      setAccessSaving(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30';
  const selectCls = 'w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30 appearance-none cursor-pointer';
  const labelCls = 'text-xs font-medium text-text-muted uppercase block mb-1.5';

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-brand-primary/10 flex items-center justify-center text-2xl font-bold text-brand-primary flex-shrink-0">{driver.name.split(' ').map((n) => n[0]).join('')}</div>
          <div>
            <button type="button" onClick={() => navigate('/drivers')} className="text-xs text-text-secondary hover:text-brand-primary transition-colors mb-1">← Volver a Conductores</button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-text-primary">{driver.name}</h1>
              <span className={'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ' + (statusCfg?.color || '')}><span className={'w-1.5 h-1.5 rounded-full ' + (driver.status === 'activo' ? 'bg-emerald-500' : 'bg-gray-500')} />{statusCfg?.label}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-text-muted mt-1"><span>DNI: {driver.dni}</span><span>·</span><span>Licencia: {driver.license_type}</span><span>·</span><span>Desde: {driver.joined_at ? new Date(driver.joined_at).toLocaleDateString('es-AR') : '—'}</span></div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowAccessModal(true)}
            className="px-4 py-2 border border-brand-green text-brand-green rounded-lg text-sm font-medium hover:bg-brand-green/10 transition-colors whitespace-nowrap"
          >
            <i className="ri-key-line mr-1.5" />
            {driver.auth_user_id ? 'Acceso creado' : 'Crear acceso'}
          </button>
          <button type="button" onClick={() => setShowDeactivateModal(true)} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors whitespace-nowrap">
            <i className="ri-close-circle-line mr-1.5" />Dar de Baja
          </button>
          <button type="button" onClick={openEdit} className="inline-flex items-center gap-2 px-3 py-2 border border-brand-border rounded-lg text-sm font-medium text-text-secondary hover:border-brand-green hover:text-brand-green transition-colors whitespace-nowrap"><i className="ri-edit-line" />Editar</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-brand-border/60"><p className="text-xs text-text-muted">DNI</p><p className="text-xl font-bold text-text-primary">{driver.dni || '—'}</p></div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60"><p className="text-xs text-text-muted">Telefono</p><p className="text-xl font-bold text-text-primary">{driver.phone || '—'}</p></div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60"><p className="text-xs text-text-muted">Licencia</p><p className="text-xl font-bold text-text-primary">{driver.license_type || '—'}</p></div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60"><p className="text-xs text-text-muted">Equipamiento</p><p className="text-xl font-bold text-text-primary">{equipment.length} items</p></div>
      </div>

      <div className="border-b border-brand-border/60"><div className="flex gap-1 overflow-x-auto">{tabs.map((tab) => (<button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={'px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative ' + (activeTab === tab.id ? 'text-brand-green' : 'text-text-secondary hover:text-text-primary')}>{tab.label}{activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green rounded-full" />}</button>))}</div></div>

      <div className="bg-white rounded-xl border border-brand-border/60 p-5">
        {activeTab === 'general' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-text-primary">Informacion Personal</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-text-muted">Nombre Completo</p><p className="text-sm font-medium text-text-primary">{driver.name}</p></div>
                  <div><p className="text-xs text-text-muted">DNI</p><p className="text-sm font-medium text-text-primary">{driver.dni}</p></div>
                  <div><p className="text-xs text-text-muted">Fecha de Nacimiento</p><p className="text-sm font-medium text-text-primary">{driver.birth_date ? new Date(driver.birth_date).toLocaleDateString('es-AR') : '—'}</p></div>
                  <div><p className="text-xs text-text-muted">Telefono</p><p className="text-sm font-medium text-text-primary">{driver.phone}</p></div>
                  <div><p className="text-xs text-text-muted">Email</p><p className="text-sm font-medium text-text-primary">{driver.email || '—'}</p></div>
                  <div><p className="text-xs text-text-muted">Direccion</p><p className="text-sm font-medium text-text-primary">{driver.address || '—'}</p></div>
                  <div><p className="text-xs text-text-muted">Fecha de Ingreso</p><p className="text-sm font-medium text-text-primary">{driver.joined_at ? new Date(driver.joined_at).toLocaleDateString('es-AR') : '—'}</p></div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-text-primary">Contacto de Emergencia</h3>
                {emergency.name ? (
                  <div className="p-3 bg-brand-light rounded-lg border border-brand-border/40"><p className="text-sm font-medium text-text-primary">{emergency.name as string}</p><p className="text-xs text-text-muted">{emergency.relation as string || ''} · {emergency.phone as string || ''}</p></div>
                ) : <p className="text-sm text-text-secondary">Sin contacto registrado</p>}
                <h3 className="text-base font-semibold text-text-primary pt-2">Camion Asignado</h3>
                {assignedTruck ? (
                  <div className="flex items-center gap-3 p-3 bg-brand-light rounded-lg border border-brand-border/40"><div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0"><i className="ri-truck-line text-brand-primary" /></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-text-primary">{assignedTruck.plate}</p><p className="text-xs text-text-muted">{assignedTruck.model}</p></div><button type="button" onClick={() => navigate('/trucks/' + assignedTruck.id)} className="text-brand-green text-xs font-medium hover:underline">Ver Camion →</button></div>
                ) : <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"><i className="ri-truck-line text-xl text-text-muted" /><p className="text-sm text-text-secondary">Sin camion asignado</p></div>}
                {driver.notes && <div className="pt-2"><h3 className="text-base font-semibold text-text-primary mb-2">Observaciones</h3><p className="text-sm text-text-secondary">{driver.notes}</p></div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'license' && (
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-text-primary">Informacion de Licencia</h3>
            <div className="p-4 bg-brand-light rounded-xl border border-brand-border/40">
              <div className="flex items-center justify-between mb-3"><p className="text-sm font-semibold text-text-primary">Licencia de Conducir</p><span className={'inline-flex px-2 py-1 rounded-full text-xs font-medium border ' + licenseStatus.color}>{licenseStatus.label}</span></div>
              <div className="space-y-3">
                <div className="flex justify-between"><p className="text-xs text-text-muted">Numero</p><p className="text-sm font-medium text-text-primary">{driver.license_number || '—'}</p></div>
                <div className="flex justify-between"><p className="text-xs text-text-muted">Categoria</p><p className="text-sm font-medium text-text-primary">{driver.license_type || '—'}</p></div>
                <div className="flex justify-between"><p className="text-xs text-text-muted">Fecha de Emision</p><p className="text-sm font-medium text-text-primary">{driver.license_issue_date ? new Date(driver.license_issue_date).toLocaleDateString('es-AR') : '—'}</p></div>
                <div className="flex justify-between"><p className="text-xs text-text-muted">Fecha de Vencimiento</p><p className="text-sm font-medium text-text-primary">{driver.license_expiry ? new Date(driver.license_expiry).toLocaleDateString('es-AR') : '—'}</p></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between"><h3 className="text-base font-semibold text-text-primary">Equipamiento Asignado</h3><span className="text-xs text-text-muted">{equipment.length} articulos</span></div>
            {equipment.length === 0 ? (
              <div className="text-center py-10"><div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-3"><i className="ri-shirt-line text-2xl text-text-muted" /></div><p className="text-sm text-text-secondary">Sin equipamiento registrado</p><p className="text-xs text-text-muted mt-1">Asigna uniformes y equipos desde la pagina de Equipamiento.</p></div>
            ) : (
              <div className="space-y-3">{equipment.map((eq) => { const st = getEqStatus(eq.replacement_date); return (
                <div key={eq.id} className="flex items-start gap-4 p-4 border border-brand-border/40 rounded-xl hover:bg-brand-light/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary flex-shrink-0"><i className={(equipmentIcons[eq.item_type] || 'ri-box-3-line') + ' text-lg'} /></div>
                  <div className="flex-1 min-w-0"><div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-text-primary">{equipmentLabels[eq.item_type] || eq.item_type}</p><span className={'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ' + st.color}><span className={'w-1.5 h-1.5 rounded-full ' + st.dot} />{st.label}</span></div>
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-1 flex-wrap">{eq.size && <span>Talle: <strong className="text-text-secondary">{eq.size}</strong></span>}{eq.size && <span>·</span>}<span>Cantidad: <strong className="text-text-secondary">{eq.quantity}</strong></span>{eq.delivery_date && <><span>·</span><span>Entrega: {new Date(eq.delivery_date).toLocaleDateString('es-AR')}</span></>}{eq.replacement_date && <><span>·</span><span>Reemplazo: {new Date(eq.replacement_date).toLocaleDateString('es-AR')}</span></>}</div>{eq.notes && <p className="text-xs text-text-muted mt-1.5 truncate">{eq.notes}</p>}</div>
                </div>
              );})}</div>
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="text-center py-10"><div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-4"><i className="ri-bar-chart-line text-3xl text-text-muted" /></div><p className="text-sm font-medium text-text-primary mb-1">Sin datos de rendimiento</p><p className="text-xs text-text-muted max-w-sm mx-auto">Las metricas de rendimiento se calculan desde las hojas de ruta completadas. Al conectar el modulo de rutas, estos datos se generaran automaticamente.</p></div>
        )}
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-brand-border/60 flex items-center justify-between"><h3 className="text-base font-semibold text-text-primary">Editar Conductor</h3><button type="button" onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-brand-light transition-colors"><i className="ri-close-line text-lg" /></button></div>
            <div className="p-5 space-y-4">
              <div><label className={labelCls}>Nombre *</label><input type="text" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>DNI</label><input type="text" value={editForm.dni} onChange={(e) => setEditForm((f) => ({ ...f, dni: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>Telefono</label><input type="text" value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>Email</label><input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>Direccion</label><input type="text" value={editForm.address} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Estado</label><select value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))} className={selectCls}>{Object.entries(driverStatuses).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}</select></div>
                <div><label className={labelCls}>Camion</label><select value={editForm.assigned_truck_id} onChange={(e) => setEditForm((f) => ({ ...f, assigned_truck_id: e.target.value }))} className={selectCls}><option value="">Sin asignar</option>{trucks.filter((t) => t.status === 'activo' || t.status === 'en_recorrido').map((t) => (<option key={t.id} value={t.id}>{t.plate}</option>))}</select></div>
              </div>
              <div><label className={labelCls}>Observaciones</label><textarea value={editForm.notes} onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))} rows={3} maxLength={500} className={inputCls + ' resize-none'} /></div>
            </div>
            <div className="p-5 border-t border-brand-border/60 flex items-center justify-end gap-3"><button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap">Cancelar</button><button type="button" onClick={saveEdit} disabled={saving || !editForm.name} className={'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap ' + (saving || !editForm.name ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-green hover:bg-brand-green/90')}>{saving ? 'Guardando...' : 'Guardar Cambios'}</button></div>
          </div>
        </div>
      )}

      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm">
            <div className="p-5 border-b border-brand-border/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <i className="ri-close-circle-line text-red-600 text-lg" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">Dar de Baja</h3>
                  <p className="text-xs text-text-muted mt-0.5">Esta accion no se puede deshacer facilmente</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-text-secondary">
                ¿Confirmas que queres dar de baja al conductor <span className="font-semibold text-text-primary">{driver.name}</span>? Dejara de aparecer en los listados y no podra ser asignado a nuevas rutas.
              </p>
            </div>
            <div className="p-5 border-t border-brand-border/60 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setShowDeactivateModal(false)} className="px-4 py-2 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap">
                Cancelar
              </button>
              <button type="button" onClick={handleDeactivate} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors whitespace-nowrap">
                Confirmar Baja
              </button>
            </div>
          </div>
        </div>
      )}

      {showAccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm">
            <div className="p-5 border-b border-brand-border/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center flex-shrink-0">
                  <i className="ri-key-line text-brand-green text-lg" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">Crear acceso</h3>
                  <p className="text-xs text-text-muted mt-0.5">{driver.name}</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowAccessModal(false)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-brand-light transition-colors">
                <i className="ri-close-line text-lg" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {accessSuccess ? (
                <div className="flex flex-col items-center py-4">
                  <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center mb-3">
                    <i className="ri-check-line text-brand-green text-2xl" />
                  </div>
                  <p className="text-sm font-medium text-text-primary">Acceso creado correctamente</p>
                </div>
              ) : (
                <>
                  {accessError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <p className="text-xs text-red-600">{accessError}</p>
                    </div>
                  )}
                  <div>
                    <label className={labelCls}>Email</label>
                    <input
                      type="email"
                      value={accessEmail}
                      onChange={(e) => setAccessEmail(e.target.value)}
                      placeholder="conductor@empresa.com"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Contraseña</label>
                    <input
                      type="password"
                      value={accessPassword}
                      onChange={(e) => setAccessPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className={inputCls}
                    />
                  </div>
                </>
              )}
            </div>

            {!accessSuccess && (
              <div className="p-5 border-t border-brand-border/60 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowAccessModal(false)} className="px-4 py-2 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap">
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateAccess}
                  disabled={accessSaving || !accessEmail || accessPassword.length < 8}
                  className={'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap ' + (accessSaving || !accessEmail || accessPassword.length < 8 ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-green hover:bg-brand-green/90')}
                >
                  {accessSaving ? 'Creando...' : 'Crear acceso'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}