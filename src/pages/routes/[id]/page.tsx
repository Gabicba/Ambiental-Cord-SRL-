import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface RouteData { id: string; name: string; date: string; truck_id: string | null; driver_id: string | null; companion_id: string | null; status: string; }
interface VisitData { id: string; route_id: string; customer_id: string; visit_order: number; status: string; liters_collected: number; payment_amount: number; photos: { url: string; public_id: string }[] | null; }
interface TruckSimple { id: string; plate: string; model: string | null; }
interface DriverSimple { id: string; name: string; dni: string | null; license_type: string | null; }
interface CompanionSimple { id: string; full_name: string; dni: string | null; }
interface CustomerSimple { id: string; fantasy_name: string; address: string | null; }

const visitStatusConfig: Record<string, { label: string; color: string; dot: string }> = {
  pendiente:    { label: 'Pendiente',    color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  completado:   { label: 'Completado',   color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  cerrado:      { label: 'Cerrado',      color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500' },
  demorado:     { label: 'Demorado',     color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  reprogramado: { label: 'Reprogramado', color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
};

const routeStatuses: Record<string, { label: string; color: string }> = {
  pendiente:  { label: 'Pendiente',   color: 'bg-amber-100 text-amber-700 border-amber-200' },
  en_curso:   { label: 'En Progreso', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  finalizada: { label: 'Finalizada',  color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  cancelada:  { label: 'Cancelada',   color: 'bg-red-100 text-red-700 border-red-200' },
};

export default function RouteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [visits, setVisits] = useState<VisitData[]>([]);
  const [truck, setTruck] = useState<TruckSimple | null>(null);
  const [driver, setDriver] = useState<DriverSimple | null>(null);
  const [companion, setCompanion] = useState<CompanionSimple | null>(null);
  const [customers, setCustomers] = useState<Record<string, CustomerSimple>>({});
  const [error, setError] = useState<string | null>(null);
  const [photoModal, setPhotoModal] = useState<{ visitId: string; photos: { url: string; public_id: string }[] } | null>(null);
  const { isAdmin } = useAuth();

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: r, error: re } = await supabase.from('route_sheets').select('*').eq('id', id).maybeSingle();
      if (re) throw re;
      if (!r) { setError('Ruta no encontrada'); setLoading(false); return; }
      setRoute(r as RouteData);
      const { data: v } = await supabase.from('route_visits').select('*').eq('route_id', id).order('visit_order');
      setVisits((v as VisitData[]) || []);

      if (r.truck_id) { const { data: t } = await supabase.from('trucks').select('id,plate,model').eq('id', r.truck_id).maybeSingle(); if (t) setTruck(t as TruckSimple); }
      if (r.driver_id) { const { data: d } = await supabase.from('drivers').select('id,name,dni,license_type').eq('id', r.driver_id).maybeSingle(); if (d) setDriver(d as DriverSimple); }
      if (r.companion_id) { const { data: c } = await supabase.from('companions').select('id,full_name,dni').eq('id', r.companion_id).maybeSingle(); if (c) setCompanion(c as CompanionSimple); }

      if (v && (v as VisitData[]).length > 0) {
        const cids = [...new Set((v as VisitData[]).map((x) => x.customer_id))];
        const { data: custs } = await supabase.from('customers').select('id,fantasy_name,address').in('id', cids);
        if (custs) {
          const map: Record<string, CustomerSimple> = {};
          (custs as CustomerSimple[]).forEach((c) => { map[c.id] = c; });
          setCustomers(map);
        }
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (<div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" /></div>);
  if (error || !route) return (<div className="min-h-[60vh] flex flex-col items-center justify-center"><i className="ri-route-line text-3xl text-text-muted mb-4" /><h2 className="text-lg font-semibold">Ruta no encontrada</h2><button onClick={() => navigate('/routes')} className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm">Volver</button></div>);

  const statusCfg = routeStatuses[route.status] || routeStatuses.pendiente;
  const VISITED_STATUSES = ['completado'];
  const completedCount = visits.filter((v) => VISITED_STATUSES.includes(v.status)).length;
  const progress = visits.length > 0 ? Math.round((completedCount / visits.length) * 100) : 0;
  const totalLiters = visits.reduce((s, v) => s + (v.liters_collected || 0), 0);
  const totalPayments = visits.reduce((s, v) => s + (v.payment_amount || 0), 0);

  const updateStatus = async (status: string) => {
    try {
      if (status === 'en_curso') {
        await api.patch(`/route-sheets/${route.id}/start`);
      } else if (status === 'cancelada') {
        await api.patch(`/route-sheets/${route.id}/cancel`);
      } else if (status === 'finalizada') {
        await api.patch(`/route-sheets/${route.id}/force-close`);
      }
      setRoute({ ...route, status });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al actualizar estado');
    }
  };

  const statusBtns = [
    ...(!isAdmin ? [{ s: 'en_curso', l: 'Iniciar' }] : []),
    { s: 'finalizada', l: 'Forzar cierre' },
    { s: 'cancelada',  l: 'Cancelar' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <button onClick={() => navigate('/routes')} type="button" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-brand-primary transition-colors mb-2"><i className="ri-arrow-left-line" />Volver a rutas</button>
          <h1 className="text-2xl font-bold text-text-primary">{route.name}</h1>
          <div className="flex items-center gap-3 mt-1"><span className="text-xs text-text-muted">{route.date}</span><span className={'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ' + statusCfg.color}>{statusCfg.label}</span></div>
        </div>
        <div className="flex items-center gap-2">{statusBtns.map((b) => (<button key={b.s} onClick={() => updateStatus(b.s)} type="button" className={'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ' + (route.status === b.s ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-text-secondary border-brand-border hover:bg-brand-light')}>{b.l}</button>))}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-brand-border/60"><p className="text-xs text-text-muted uppercase">Clientes</p><p className="text-xl font-bold mt-1">{completedCount}/{visits.length}</p><div className="mt-2 h-1.5 bg-brand-light rounded-full"><div className="h-full bg-brand-green rounded-full" style={{ width: progress + '%' }} /></div></div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60"><p className="text-xs text-text-muted uppercase">Litros</p><p className="text-xl font-bold mt-1">{totalLiters.toLocaleString()} L</p></div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60"><p className="text-xs text-text-muted uppercase">Pagos</p><p className="text-xl font-bold mt-1">${totalPayments.toLocaleString()}</p></div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60"><p className="text-xs text-text-muted uppercase">Camion</p><p className="text-lg font-bold mt-1">{truck?.plate || '—'}</p><p className="text-xs text-text-muted">{driver?.name || '—'}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-brand-border/60 overflow-hidden">
          <div className="p-4 border-b border-brand-border/60"><h3 className="text-sm font-semibold">Recorrido</h3></div>
          <div className="h-[420px]"><iframe title="Route Map" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d210146.68!2d-58.5734!3d-34.6157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcca3b4ef90b07%3A0x948c7b6a0bfc6!2sBuenos%20Aires%2C%20CABA!5e0!3m2!1ses!2sar" /></div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-brand-border/60">
            <h3 className="text-sm font-semibold mb-4">Informacion</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center"><i className="ri-truck-line text-brand-primary" /></div><div><p className="text-xs text-text-muted">Camion</p><p className="text-sm font-medium">{truck?.plate || '—'}</p></div></div>
              <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-brand-green/10 flex items-center justify-center"><i className="ri-user-line text-brand-green" /></div><div><p className="text-xs text-text-muted">Conductor</p><p className="text-sm font-medium">{driver?.name || '—'}</p></div></div>
              {companion && <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center"><i className="ri-user-add-line text-sky-600" /></div><div><p className="text-xs text-text-muted">Acompaniante</p><p className="text-sm font-medium">{companion.full_name}</p></div></div>}
              <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><i className="ri-calendar-line text-amber-600" /></div><div><p className="text-xs text-text-muted">Fecha</p><p className="text-sm font-medium">{route.date}</p></div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-brand-border/60 overflow-hidden">
        <div className="p-5 border-b border-brand-border/60"><h3 className="text-sm font-semibold">Visitas</h3></div>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-brand-border/40"><th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3 w-12">#</th><th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Cliente</th><th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Direccion</th><th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Estado</th><th className="text-right text-xs font-medium text-text-muted uppercase px-5 py-3">Litros</th><th className="text-right text-xs font-medium text-text-muted uppercase px-5 py-3">Pago</th><th className="text-center text-xs font-medium text-text-muted uppercase px-5 py-3">Fotos</th></tr></thead><tbody>{visits.map((v) => { const cfg = visitStatusConfig[v.status] || visitStatusConfig.pendiente; const cust = customers[v.customer_id]; return (<tr key={v.id} className="border-b border-brand-border/30 hover:bg-brand-light/50 transition-colors"><td className="px-5 py-3"><span className="w-7 h-7 rounded-full bg-brand-primary/10 flex items-center justify-center text-xs font-bold text-brand-primary">{v.visit_order}</span></td><td className="px-5 py-3"><p className="text-sm font-medium">{cust?.fantasy_name || v.customer_id}</p></td><td className="px-5 py-3 text-sm text-text-secondary max-w-[200px] truncate">{cust?.address || '—'}</td><td className="px-5 py-3"><span className={'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ' + cfg.color}><span className={'w-1.5 h-1.5 rounded-full ' + cfg.dot} />{cfg.label}</span></td><td className="px-5 py-3 text-sm font-medium text-right">{v.liters_collected > 0 ? v.liters_collected + ' L' : '—'}</td><td className="px-5 py-3 text-sm text-right">{v.payment_amount > 0 ? '$' + v.payment_amount.toLocaleString() : '—'}</td><td className="px-5 py-3 text-center">{v.photos && v.photos.length > 0 ? (<button type="button" onClick={() => setPhotoModal({ visitId: v.id, photos: v.photos! })} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors"><i className="ri-camera-line" />{v.photos.length}</button>) : (<span className="text-xs text-text-muted">—</span>)}</td></tr>); })}</tbody></table></div>
      </div>

      {photoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setPhotoModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Fotos de evidencia</h3>
              <button type="button" onClick={() => setPhotoModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-light transition-colors"><i className="ri-close-line text-text-muted" /></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photoModal.photos.map((photo) => (
                <a key={photo.public_id} href={photo.url} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-xl overflow-hidden border border-brand-border/60 hover:border-brand-primary transition-colors">
                  <img src={photo.url} alt="Foto de visita" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}