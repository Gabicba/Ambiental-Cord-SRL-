import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { useTrucks, truckStatuses } from '@/hooks/useTrucks';
import { useDrivers } from '@/hooks/useDrivers';

interface TruckData {
  id: string; plate: string; model: string | null; assigned_driver_id: string | null;
  gps_device_id: string | null; status: string; capacity_liters: number; year: number | null;
  last_maintenance: string | null; next_maintenance: string | null;
  km_total: number; km_since_maintenance: number; vin: string | null; fuel_type: string;
  insurance_expiry: string | null; technical_revision_expiry: string | null;
  notes: string | null; created_at: string; updated_at: string; deleted_at: string | null;
}

interface DriverSimple { id: string; name: string; dni: string | null; license_type: string | null; status: string; }

function getDocStatus(dateStr: string | null): string {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr); d.setHours(0,0,0,0);
  const now = new Date(); now.setHours(0,0,0,0);
  if (d < now) return 'Expired';
  const diff = (d.getTime() - now.getTime()) / (1000*60*60*24);
  if (diff < 30) return 'Near';
  return 'Active';
}

const docStatuses: Record<string, { label: string; color: string }> = {
  Active: { label: 'Vigente', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Expired: { label: 'Vencido', color: 'bg-red-50 text-red-700 border-red-200' },
  Near: { label: 'Proximo a vencer', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  Unknown: { label: 'Sin datos', color: 'bg-gray-50 text-gray-700 border-gray-200' },
};

const tabs = [
  { id: 'general', label: 'General' }, { id: 'documents', label: 'Documentos' },
  { id: 'maintenance', label: 'Mantenimiento' }, { id: 'routes', label: 'Rutas' }, { id: 'gps', label: 'GPS' },
];

export default function TruckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteTruck } = useTrucks();
  const { drivers } = useDrivers();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [truck, setTruck] = useState<TruckData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ plate: '', model: '', year: '', capacity_liters: 0, gps_device_id: '', assigned_driver_id: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: d, error: e } = await supabase.from('trucks').select('*').eq('id', id).is('deleted_at', null).maybeSingle();
      if (e) throw e;
      if (!d) { setError('No encontrado'); setLoading(false); return; }
      setTruck(d as TruckData);
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (<div className="flex items-center justify-center py-20"><div className="flex flex-col items-center gap-4"><div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" /><p className="text-sm text-text-secondary">Cargando...</p></div></div>);
  if (error || !truck) return (<div className="space-y-4"><button type="button" onClick={() => navigate('/trucks')} className="text-sm text-text-secondary hover:text-brand-primary transition-colors">← Volver a Camiones</button><div className="bg-white rounded-xl p-8 text-center border border-brand-border/60"><i className="ri-truck-line text-5xl text-text-muted mb-4" /><h2 className="text-xl font-semibold text-text-primary">Camion no encontrado</h2></div></div>);

  const statusCfg = truckStatuses[truck.status as keyof typeof truckStatuses];
  const driver = truck.assigned_driver_id ? drivers.find((d) => d.id === truck.assigned_driver_id) : null;

  const openEdit = () => {
    setEditForm({ plate: truck.plate, model: truck.model || '', year: truck.year ? String(truck.year) : '', capacity_liters: truck.capacity_liters, gps_device_id: truck.gps_device_id || '', assigned_driver_id: truck.assigned_driver_id || '', notes: truck.notes || '' });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const updated = await api.patch<TruckData>(`/trucks/${truck.id}`, {
        plate: editForm.plate || undefined,
        model: editForm.model || undefined,
        year: editForm.year ? parseInt(editForm.year) : undefined,
        capacityLiters: editForm.capacity_liters || undefined,
        gpsDeviceId: editForm.gps_device_id || undefined,
        assignedDriverId: editForm.assigned_driver_id || undefined,
        notes: editForm.notes || undefined,
      });
      setTruck({ ...truck, ...updated });
      setShowEditModal(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Dar de baja este camion?')) return;
    try { await deleteTruck(truck.id); navigate('/trucks'); }
    catch (e) { alert(e instanceof Error ? e.message : 'Error'); }
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30';
  const selectCls = 'w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30 appearance-none cursor-pointer';
  const labelCls = 'text-xs font-medium text-text-muted uppercase block mb-1.5';

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <button type="button" onClick={() => navigate('/trucks')} className="text-xs text-text-secondary hover:text-brand-primary transition-colors mb-2">← Volver a Camiones</button>
          <div className="flex items-center gap-3 flex-wrap"><h1 className="text-2xl font-bold text-text-primary">{truck.plate}</h1><span className={'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ' + (statusCfg?.color || '')}><span className={'w-1.5 h-1.5 rounded-full ' + (
                    truck.status === 'activo'            ? 'bg-emerald-500' :
                    truck.status === 'en_recorrido'      ? 'bg-blue-500' :
                    'bg-gray-500'
                  )} />{statusCfg?.label}</span></div>
          <p className="text-sm text-text-secondary mt-1">{truck.model}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={handleDeactivate} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors whitespace-nowrap"><i className="ri-close-circle-line mr-1.5" />Dar de Baja</button>
          <button type="button" onClick={openEdit} className="inline-flex items-center gap-2 px-3 py-2 border border-brand-border rounded-lg text-sm font-medium text-text-secondary hover:border-brand-green hover:text-brand-green transition-colors whitespace-nowrap"><i className="ri-edit-line" />Editar</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-brand-border/60"><p className="text-xs text-text-muted">Capacidad</p><p className="text-xl font-bold text-text-primary">{truck.capacity_liters.toLocaleString()} L</p></div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60"><p className="text-xs text-text-muted">Kilometraje</p><p className="text-xl font-bold text-text-primary">{truck.km_total.toLocaleString()} km</p></div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60"><p className="text-xs text-text-muted">Anio</p><p className="text-xl font-bold text-text-primary">{truck.year || '—'}</p></div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60"><p className="text-xs text-text-muted">Combustible</p><p className="text-xl font-bold text-text-primary">{truck.fuel_type}</p></div>
      </div>

      <div className="border-b border-brand-border/60"><div className="flex gap-1 overflow-x-auto">{tabs.map((tab) => (<button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={'px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative ' + (activeTab === tab.id ? 'text-brand-green' : 'text-text-secondary hover:text-text-primary')}>{tab.label}{activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green rounded-full" />}</button>))}</div></div>

      <div className="bg-white rounded-xl border border-brand-border/60 p-5">
        {activeTab === 'general' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-text-primary">Informacion Tecnica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-text-muted">Modelo</p><p className="text-sm font-medium text-text-primary">{truck.model}</p></div>
                  <div><p className="text-xs text-text-muted">Anio</p><p className="text-sm font-medium text-text-primary">{truck.year || '—'}</p></div>
                  <div><p className="text-xs text-text-muted">VIN</p><p className="text-sm font-medium text-text-primary">{truck.vin || '—'}</p></div>
                  <div><p className="text-xs text-text-muted">Combustible</p><p className="text-sm font-medium text-text-primary">{truck.fuel_type}</p></div>
                  <div><p className="text-xs text-text-muted">Capacidad</p><p className="text-sm font-medium text-text-primary">{truck.capacity_liters.toLocaleString()} L</p></div>
                  <div><p className="text-xs text-text-muted">Kilometraje</p><p className="text-sm font-medium text-text-primary">{truck.km_total.toLocaleString()} km</p></div>
                  <div><p className="text-xs text-text-muted">GPS</p><p className="text-sm font-medium text-text-primary">{truck.gps_device_id || '—'}</p></div>
                  <div><p className="text-xs text-text-muted">Desde ultimo service</p><p className="text-sm font-medium text-text-primary">{truck.km_since_maintenance.toLocaleString()} km</p></div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-text-primary">Conductor Asignado</h3>
                {driver ? (
                  <div className="flex items-center gap-4 p-4 bg-brand-light rounded-xl border border-brand-border/40"><div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-base font-bold text-brand-primary flex-shrink-0">{driver.name.split(' ').map((n) => n[0]).join('')}</div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-text-primary">{driver.name}</p><p className="text-xs text-text-muted">{driver.dni} · Lic. {driver.license_type}</p></div><button type="button" onClick={() => navigate('/drivers/' + driver.id)} className="text-brand-green text-sm font-medium hover:underline whitespace-nowrap">Ver Perfil →</button></div>
                ) : (<div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200"><i className="ri-user-line text-xl text-text-muted" /><p className="text-sm text-text-secondary">Sin conductor asignado</p></div>)}
                {truck.notes && (<div className="pt-2"><h3 className="text-base font-semibold text-text-primary mb-2">Observaciones</h3><p className="text-sm text-text-secondary">{truck.notes}</p></div>)}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-text-primary">Documentacion</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-brand-light rounded-lg border border-brand-border/40"><div><p className="text-sm font-medium text-text-primary">Seguro Vehicular</p><p className="text-xs text-text-muted">Vence: {truck.insurance_expiry ? new Date(truck.insurance_expiry).toLocaleDateString('es-AR') : '—'}</p></div><span className={'inline-flex px-2 py-1 rounded-full text-xs font-medium border ' + docStatuses[getDocStatus(truck.insurance_expiry)].color}>{docStatuses[getDocStatus(truck.insurance_expiry)].label}</span></div>
              <div className="flex items-center justify-between p-3 bg-brand-light rounded-lg border border-brand-border/40"><div><p className="text-sm font-medium text-text-primary">Revision Tecnica</p><p className="text-xs text-text-muted">Vence: {truck.technical_revision_expiry ? new Date(truck.technical_revision_expiry).toLocaleDateString('es-AR') : '—'}</p></div><span className={'inline-flex px-2 py-1 rounded-full text-xs font-medium border ' + docStatuses[getDocStatus(truck.technical_revision_expiry)].color}>{docStatuses[getDocStatus(truck.technical_revision_expiry)].label}</span></div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="text-center py-10"><div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-4"><i className="ri-tools-line text-3xl text-text-muted" /></div><p className="text-sm font-medium text-text-primary mb-1">Sin datos de mantenimiento</p><p className="text-xs text-text-muted max-w-sm mx-auto">El modulo de mantenimiento se conectara a Supabase en la Fase 7. Por ahora los datos estan en localStorage.</p></div>
        )}

        {activeTab === 'routes' && (
          <div className="text-center py-10"><div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-4"><i className="ri-route-line text-3xl text-text-muted" /></div><p className="text-sm font-medium text-text-primary mb-1">Sin rutas asignadas</p><p className="text-xs text-text-muted max-w-sm mx-auto">Las rutas se vinculan al crear hojas de ruta en la Fase 4.</p></div>
        )}

        {activeTab === 'gps' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-base font-semibold text-text-primary">GPS en Vivo</h3><span className="text-xs text-text-muted">DEV: {truck.gps_device_id || '—'}</span></div>
            <div className="rounded-xl overflow-hidden border border-brand-border/60 h-80">
              <iframe title={'Mapa GPS ' + truck.plate} width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d105073.26479892258!2d-58.41729755!3d-34.61582385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcca3b4ef90ffd%3A0xe15788b47bca6197!2sBuenos%20Aires%2C%20Argentina!5e0!3m2!1ses!2sus!4v1699999999999" /></div>
          </div>
        )}
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-brand-border/60 flex items-center justify-between"><h3 className="text-base font-semibold text-text-primary">Editar Camion</h3><button type="button" onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-brand-light transition-colors"><i className="ri-close-line text-lg" /></button></div>
            <div className="p-5 space-y-4">
              <div><label className={labelCls}>Patente *</label><input type="text" value={editForm.plate} onChange={(e) => setEditForm((f) => ({ ...f, plate: e.target.value.toUpperCase() }))} className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-4"><div><label className={labelCls}>Modelo</label><input type="text" value={editForm.model} onChange={(e) => setEditForm((f) => ({ ...f, model: e.target.value }))} className={inputCls} /></div><div><label className={labelCls}>Anio</label><input type="number" value={editForm.year} onChange={(e) => setEditForm((f) => ({ ...f, year: e.target.value }))} className={inputCls} /></div></div>
              <div className="grid grid-cols-2 gap-4"><div><label className={labelCls}>Capacidad (L)</label><input type="number" value={editForm.capacity_liters} onChange={(e) => setEditForm((f) => ({ ...f, capacity_liters: parseInt(e.target.value) || 0 }))} className={inputCls} /></div><div><label className={labelCls}>ID GPS</label><input type="text" value={editForm.gps_device_id} onChange={(e) => setEditForm((f) => ({ ...f, gps_device_id: e.target.value }))} className={inputCls} /></div></div>
              <div><label className={labelCls}>Conductor</label><select value={editForm.assigned_driver_id} onChange={(e) => setEditForm((f) => ({ ...f, assigned_driver_id: e.target.value }))} className={selectCls}><option value="">Sin asignar</option>{drivers.filter((d) => d.status === 'activo').map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}</select></div>
              <div><label className={labelCls}>Observaciones</label><textarea value={editForm.notes} onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))} rows={3} maxLength={500} className={inputCls + ' resize-none'} /></div>
            </div>
            <div className="p-5 border-t border-brand-border/60 flex items-center justify-end gap-3"><button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap">Cancelar</button><button type="button" onClick={saveEdit} disabled={saving || !editForm.plate} className={'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap ' + (saving || !editForm.plate ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-green hover:bg-brand-green/90')}>{saving ? 'Guardando...' : 'Guardar Cambios'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}