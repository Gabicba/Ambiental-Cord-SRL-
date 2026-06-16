import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { useCustomers } from '@/hooks/useCustomers';
import { useTrucks } from '@/hooks/useTrucks';
import { useDrivers } from '@/hooks/useDrivers';

interface TemplateData { id: string; name: string; description: string | null; customer_ids: string[]; visit_order: Record<string, number> | null; notes: string | null; }

export default function RouteTemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers } = useCustomers();
  const { trucks } = useTrucks();
  const { drivers } = useDrivers();
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [truckId, setTruckId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchTemplate = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: t, error: e } = await supabase.from('route_templates').select('*').eq('id', id).is('deleted_at', null).maybeSingle();
      if (e) throw e;
      if (!t) { setError('No encontrada'); setLoading(false); return; }
      setTemplate(t as TemplateData);
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchTemplate(); }, [fetchTemplate]);

  const activeCustomers = customers.filter((c) => c.status === 'Active');
  const availableTrucks = trucks.filter((t) => t.status === 'activo' || t.status === 'en_recorrido');
  const availableDrivers = drivers.filter((d) => d.status === 'activo');

  const templateCustomers = useMemo(() => {
    if (!template) return [];
    const ids = template.customer_ids || [];
    const order = template.visit_order || {};
    return ids.map((cid) => activeCustomers.find((c) => c.id === cid)).filter(Boolean).sort((a, b) => (order[a!.id] || 0) - (order[b!.id] || 0));
  }, [template, activeCustomers]);

  if (loading) return (<div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" /></div>);
  if (error || !template) return (<div className="text-center py-16"><p className="text-lg text-text-muted">Plantilla no encontrada</p><button onClick={() => navigate('/routes/templates')} className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm">Volver</button></div>);

  const inputCls = 'w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30';
  const selectCls = 'w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30 appearance-none cursor-pointer';
  const labelCls = 'text-xs font-medium text-text-muted uppercase block mb-1.5';
  const isValid = date && truckId && driverId;

  const handleCreateRoute = async () => {
    if (!isValid || !template) return;
    setSaving(true);
    setSaveError(null);
    try {
      const route = await api.post<{ id: string }>('/route-sheets', {
        name: template.name,
        date,
        truckId,
        driverId,
      });

      const visits = template.customer_ids.map((customerId, idx) => ({
        routeId: route.id,
        customerId,
        visitOrder: idx + 1,
      }));

      await Promise.all(visits.map((v) => api.post('/route-visits', v)));

      navigate('/routes');
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Error al crear la ruta');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3"><button onClick={() => navigate('/routes/templates')} type="button" className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"><i className="ri-arrow-left-line" />Plantillas</button></div>
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-text-primary">{template.name}</h1><p className="text-sm text-text-secondary mt-1">{template.description}</p></div><span className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-medium">{templateCustomers.length} clientes</span></div>
      {template.notes && (<div className="bg-amber-50 rounded-xl p-4 border border-amber-200"><p className="text-sm text-amber-800"><i className="ri-information-line mr-2" />{template.notes}</p></div>)}
      {saveError && (<div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-sm text-red-700">{saveError}</p></div>)}

      <div className="bg-white rounded-xl border border-brand-border/60 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-text-primary">Crear ruta desde plantilla</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelCls}>Fecha</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Camion</label><select value={truckId} onChange={(e) => setTruckId(e.target.value)} className={selectCls}><option value="">Seleccionar</option>{availableTrucks.map((t) => (<option key={t.id} value={t.id}>{t.plate} - {t.model}</option>))}</select></div>
          <div><label className={labelCls}>Conductor</label><select value={driverId} onChange={(e) => setDriverId(e.target.value)} className={selectCls}><option value="">Seleccionar</option>{availableDrivers.map((d) => (<option key={d.id} value={d.id}>{d.name} - Lic {d.license_type}</option>))}</select></div>
        </div>

        <div className="border-t border-brand-border/40 pt-6"><h3 className="text-sm font-semibold mb-3">Clientes ({templateCustomers.length})</h3>
          <div className="space-y-2">
            {templateCustomers.map((c, i) => c && (<div key={c.id} className="p-3 rounded-lg bg-brand-light border border-brand-border/40 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span><div><p className="text-sm font-medium">{c.fantasy_name}</p><p className="text-xs text-text-muted">{c.address}</p></div></div>))}
          </div>
        </div>

        {isValid && (<div className="bg-brand-green/5 border border-brand-green/20 rounded-xl p-4"><h4 className="text-sm font-semibold text-brand-green mb-2">Resumen</h4><div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm"><div><p className="text-xs text-text-muted">Fecha</p><p className="font-medium">{date}</p></div><div><p className="text-xs text-text-muted">Clientes</p><p className="font-medium">{templateCustomers.length}</p></div><div><p className="text-xs text-text-muted">Camion</p><p className="font-medium">{trucks.find((t) => t.id === truckId)?.plate}</p></div><div><p className="text-xs text-text-muted">Conductor</p><p className="font-medium">{drivers.find((d) => d.id === driverId)?.name}</p></div></div></div>)}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button onClick={() => navigate('/routes/templates')} type="button" className="px-5 py-2.5 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap">Cancelar</button>
          <button onClick={handleCreateRoute} disabled={!isValid || saving} type="button" className={'px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap ' + (isValid && !saving ? 'bg-brand-green hover:bg-brand-green/90' : 'bg-gray-300 cursor-not-allowed')}>{saving ? 'Creando...' : 'Crear Ruta'}</button>
        </div>
      </div>
    </div>
  );
}