import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useTrucks } from '@/hooks/useTrucks';
import { useDrivers } from '@/hooks/useDrivers';
import { useCustomers } from '@/hooks/useCustomers';
import { useCompanions } from '@/hooks/useCompanions';

export default function RouteNewPage() {
  const navigate = useNavigate();
  const { trucks } = useTrucks();
  const { drivers } = useDrivers();
  const { customers } = useCustomers();
  const { companions } = useCompanions();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [truckId, setTruckId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [companionId, setCompanionId] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [searchCustomer, setSearchCustomer] = useState('');

  const availableTrucks = trucks.filter((t) => t.status === 'Active' || t.status === 'On_Route');
  const availableDrivers = drivers.filter((d) => d.status === 'Active' || d.status === 'On_Route');
  const activeCustomers = customers.filter((c) => c.status === 'Active');

  const filteredCustomers = useMemo(() => activeCustomers.filter((c) => !selectedCustomers.includes(c.id) && (c.fantasy_name.toLowerCase().includes(searchCustomer.toLowerCase()) || (c.address || '').toLowerCase().includes(searchCustomer.toLowerCase()))), [searchCustomer, selectedCustomers, activeCustomers]);
  const selectedList = activeCustomers.filter((c) => selectedCustomers.includes(c.id));

  const inputCls = 'w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30';
  const selectCls = 'w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30 appearance-none cursor-pointer';
  const labelCls = 'text-xs font-medium text-text-muted uppercase block mb-1.5';
  const isValid = name && date && truckId && driverId && selectedCustomers.length > 0;

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true); setSaveError(null);
    try {
      const { data: route, error: routeErr } = await supabase.from('route_sheets').insert({ name, date, truck_id: truckId, driver_id: driverId, companion_id: companionId || null, status: 'Pending' }).select().single();
      if (routeErr) throw routeErr;
      const visitRows = selectedCustomers.map((cid, idx) => ({ route_id: route.id, customer_id: cid, visit_order: idx + 1, status: 'Pending' }));
      if (visitRows.length > 0) {
        const { error: vErr } = await supabase.from('route_visits').insert(visitRows);
        if (vErr) throw vErr;
      }
      navigate('/routes');
    } catch (e) { setSaveError(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-text-primary">Nueva Hoja de Ruta</h1><p className="text-sm text-text-secondary mt-1">Planificar recorrido de recoleccion</p></div>
      {saveError && (<div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"><i className="ri-error-warning-line text-red-500 mt-0.5" /><div className="flex-1"><p className="text-sm font-medium text-red-700">Error</p><p className="text-xs text-red-600 mt-0.5">{saveError}</p></div><button type="button" onClick={() => setSaveError(null)} className="text-red-400 hover:text-red-600"><i className="ri-close-line" /></button></div>)}
      <div className="bg-white rounded-xl border border-brand-border/60 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelCls}>Nombre de la Ruta</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Ruta Centro - Zona Norte" className={inputCls} /></div>
          <div><label className={labelCls}>Fecha</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelCls}>Camion</label><select value={truckId} onChange={(e) => setTruckId(e.target.value)} className={selectCls}><option value="">Seleccionar camion</option>{availableTrucks.map((t) => (<option key={t.id} value={t.id}>{t.plate} - {t.model}</option>))}</select></div>
          <div><label className={labelCls}>Conductor</label><select value={driverId} onChange={(e) => setDriverId(e.target.value)} className={selectCls}><option value="">Seleccionar conductor</option>{availableDrivers.map((d) => (<option key={d.id} value={d.id}>{d.name} - Lic. {d.license_type}</option>))}</select></div>
        </div>
        <div><label className={labelCls}>Acompaniante (Opcional)</label><select value={companionId} onChange={(e) => setCompanionId(e.target.value)} className={selectCls}><option value="">Sin acompaniante</option>{companions.map((c) => (<option key={c.id} value={c.id}>{c.full_name}</option>))}</select></div>

        <div className="border-t border-brand-border/40 pt-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Clientes a Visitar</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-brand-light rounded-xl p-4">
              <div className="relative mb-3"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"><i className="ri-search-line" /></span><input type="text" value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} placeholder="Buscar clientes..." className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30" /></div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {filteredCustomers.map((c) => (<button key={c.id} onClick={() => setSelectedCustomers((p) => p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id])} type="button" className="w-full text-left p-3 rounded-lg bg-white border border-brand-border/60 hover:border-brand-green/40 transition-colors"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-text-primary">{c.fantasy_name}</p><p className="text-xs text-text-muted mt-0.5">{c.address}</p></div><div className="w-6 h-6 rounded-full border-2 border-brand-border flex items-center justify-center flex-shrink-0"><i className="ri-add-line text-xs text-text-muted" /></div></div></button>))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-brand-border/60 p-4">
              <div className="flex items-center justify-between mb-3"><span className="text-sm font-medium text-text-primary">Seleccionados: {selectedCustomers.length}</span>{selectedCustomers.length > 0 && <button onClick={() => setSelectedCustomers([])} type="button" className="text-xs text-red-500">Limpiar</button>}</div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {selectedList.map((c, idx) => (<div key={c.id} className="p-3 rounded-lg bg-brand-light border border-brand-border/40 flex items-start justify-between gap-2"><div className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-brand-primary/10 flex items-center justify-center text-[10px] font-bold text-brand-primary flex-shrink-0 mt-0.5">{idx + 1}</span><div><p className="text-sm font-medium text-text-primary">{c.fantasy_name}</p><p className="text-xs text-text-muted">{c.address}</p></div></div><button onClick={() => setSelectedCustomers((p) => p.filter((x) => x !== c.id))} type="button" className="text-text-muted hover:text-red-500 p-0.5"><i className="ri-close-line" /></button></div>))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button onClick={() => navigate('/routes')} type="button" className="px-5 py-2.5 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap">Cancelar</button>
          <button onClick={handleSave} disabled={!isValid || saving} type="button" className={'px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap ' + (isValid && !saving ? 'bg-brand-green hover:bg-brand-green/90' : 'bg-gray-300 cursor-not-allowed')}>{saving ? 'Creando...' : 'Crear Ruta'}</button>
        </div>
      </div>
    </div>
  );
}