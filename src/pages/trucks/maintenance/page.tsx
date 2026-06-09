import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMaintenance } from '@/hooks/useMaintenance';
import { useTrucks } from '@/hooks/useTrucks';

const categoryOptions: { value: string; label: string; icon: string; color: string }[] = [
  { value: 'all', label: 'Todas', icon: 'ri-tools-line', color: 'bg-brand-light' },
  { value: 'oil_change', label: 'Aceite', icon: 'ri-oil-line', color: 'bg-amber-100' },
  { value: 'battery', label: 'Bateria', icon: 'ri-battery-line', color: 'bg-sky-100' },
  { value: 'tires', label: 'Cubiertas', icon: 'ri-car-line', color: 'bg-gray-100' },
  { value: 'brakes', label: 'Frenos', icon: 'ri-stop-circle-line', color: 'bg-red-100' },
  { value: 'itv', label: 'ITV/RTO', icon: 'ri-file-shield-line', color: 'bg-blue-100' },
  { value: 'insurance', label: 'Seguro', icon: 'ri-shield-check-line', color: 'bg-green-100' },
  { value: 'general', label: 'General', icon: 'ri-settings-3-line', color: 'bg-purple-100' },
];

function formatDate(d: Date): string { const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0'); return y + '-' + m + '-' + day; }

export default function MaintenancePage() {
  const navigate = useNavigate();
  const { records, loading, error, addRecord, updateRecord, deleteRecord, getSummary } = useMaintenance();
  const { trucks } = useTrucks();
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ truck_id: '', category: 'oil_change', last_done_date: formatDate(new Date()), interval_months: 3, next_due_date: '', current_km: 0, notes: '', provider: '', cost: 0, status: 'Upcoming' });

  const [completing, setCompleting] = useState<string | null>(null);
  const [completeForm, setCompleteForm] = useState({ completed_date: formatDate(new Date()), km: 0, cost: 0, provider: '', notes: '' });

  const summary = getSummary();

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (catFilter !== 'all' && r.category !== catFilter) return false;
      if (search && !r.truck_plate.toLowerCase().includes(search.toLowerCase()) && !(r.provider || '').toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [records, catFilter, search]);

  if (loading) return (<div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" /></div>);
  if (error) return (<div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"><p className="text-red-700">{error}</p><button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-lg">Reintentar</button></div>);

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green bg-white';
  const labelCls = 'text-xs font-medium text-text-muted uppercase block mb-1.5';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-text-primary">Mantenimiento</h1><p className="text-sm text-text-secondary mt-1">Alertas y seguimiento de mantenimiento de vehiculos</p></div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setForm({ truck_id: trucks[0]?.id || '', category: 'oil_change', last_done_date: formatDate(new Date()), interval_months: 3, next_due_date: '', current_km: 0, notes: '', provider: '', cost: 0, status: 'Upcoming' }); setShowNew(true); }} type="button" className="inline-flex items-center gap-2 px-3 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap"><i className="ri-add-line" />Nuevo Registro</button>
          <Link to="/trucks" className="text-sm text-brand-green hover:text-brand-primary transition-colors font-medium">Camiones</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-red-200/60"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><i className="ri-close-circle-line text-red-700 text-xl" /></div><div><p className="text-2xl font-bold text-red-700">{summary.expired}</p><p className="text-xs text-text-secondary">Vencidos hace dias</p></div></div></div>
        <div className="bg-white rounded-xl p-4 border border-red-200/60"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center"><i className="ri-alarm-warning-line text-amber-700 text-xl" /></div><div><p className="text-2xl font-bold text-amber-700">{summary.due}</p><p className="text-xs text-text-secondary">Vencidos</p></div></div></div>
        <div className="bg-white rounded-xl p-4 border border-amber-200/60"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><i className="ri-error-warning-line text-amber-600 text-xl" /></div><div><p className="text-2xl font-bold text-amber-600">{summary.upcoming}</p><p className="text-xs text-text-secondary">Proximos (30 dias)</p></div></div></div>
        <div className="bg-white rounded-xl p-4 border border-brand-border/60"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center"><i className="ri-tools-line text-brand-primary text-xl" /></div><div><p className="text-2xl font-bold text-text-primary">{summary.total}</p><p className="text-xs text-text-secondary">Total activos</p></div></div></div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-brand-border/60 flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><div className="relative"><i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por patente..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-brand-green" /></div></div>
        <div className="flex flex-wrap gap-2">{categoryOptions.map((c) => (<button key={c.value} onClick={() => setCatFilter(c.value)} type="button" className={'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ' + (catFilter === c.value ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-text-secondary border-brand-border hover:bg-brand-light')}>{c.label}</button>))}</div>
      </div>

      <div className="bg-white rounded-xl border border-brand-border/60 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-brand-border/40 bg-brand-light/30"><th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Vehiculo</th><th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Categoria</th><th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Ultimo</th><th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Proximo</th><th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Estado</th><th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Intervalo</th><th className="text-right text-xs font-medium text-text-muted uppercase px-5 py-3">Accion</th></tr></thead><tbody>
          {filtered.map((r) => {
            const cat = categoryOptions.find((c) => c.value === r.category) || categoryOptions[categoryOptions.length - 1];
            const days = Math.ceil((new Date(r.next_due_date).getTime() - new Date().setHours(0,0,0,0)) / (1000*60*60*24));
            const statusLabel = r.status === 'Completed' ? 'Completado' : r.status === 'Expired' ? 'Vencido' : r.status === 'Due' ? 'Por vencer' : 'Proximo';
            const statusColor = r.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : r.status === 'Expired' ? 'bg-red-100 text-red-700 border-red-200' : r.status === 'Due' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200';
            return (<tr key={r.id} className="border-b border-brand-border/30 hover:bg-brand-light/30 transition-colors">
              <td className="px-5 py-3"><div className="flex items-center gap-3"><div className={'w-8 h-8 rounded-lg ' + cat.color + ' flex items-center justify-center flex-shrink-0'}><i className={cat.icon + ' text-sm'} /></div><div><p className="text-sm font-medium">{r.truck_plate}</p><p className="text-xs text-text-muted">{r.truck_model}</p></div></div></td>
              <td className="px-5 py-3"><span className="text-sm text-text-secondary">{cat.label}</span></td>
              <td className="px-5 py-3 text-sm text-text-secondary">{r.last_done_date}</td>
              <td className="px-5 py-3"><span className={'text-sm font-medium ' + (days <= 0 && r.status !== 'Completed' ? 'text-red-600' : days <= 30 && r.status !== 'Completed' ? 'text-amber-600' : 'text-text-primary')}>{r.next_due_date}</span></td>
              <td className="px-5 py-3"><span className={'inline-flex px-2 py-1 rounded-full text-xs font-medium border ' + statusColor}>{statusLabel}</span></td>
              <td className="px-5 py-3"><span className="text-sm text-text-secondary">{r.interval_months} m</span></td>
              <td className="px-5 py-3 text-right">
                {r.status !== 'Completed' ? (<div className="flex items-center justify-end gap-2">
                  <button onClick={() => { setCompleting(r.id); setCompleteForm({ completed_date: formatDate(new Date()), km: r.current_km, cost: r.cost || 0, provider: r.provider || '', notes: '' }); }} type="button" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-green text-white text-xs font-medium hover:bg-brand-green/90 whitespace-nowrap"><i className="ri-check-line" />Completar</button>
                  <button onClick={() => { if (window.confirm('Eliminar?')) deleteRecord(r.id); }} type="button" className="w-7 h-7 rounded-lg border border-brand-border text-text-muted hover:text-red-600 flex items-center justify-center"><i className="ri-delete-bin-line text-xs" /></button>
                </div>) : (<button onClick={() => { if (window.confirm('Eliminar?')) deleteRecord(r.id); }} type="button" className="w-7 h-7 rounded-lg border border-brand-border text-text-muted hover:text-red-600 flex items-center justify-center"><i className="ri-delete-bin-line text-xs" /></button>)}
              </td>
            </tr>);
          })}
        </tbody></table></div>
      </div>

      {showNew && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"><div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b"><h3 className="text-lg font-semibold">Nuevo Registro</h3><button onClick={() => setShowNew(false)} type="button" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-light"><i className="ri-close-line" /></button></div>
        <div className="p-5 space-y-4">
          <div><label className={labelCls}>Vehiculo</label><select value={form.truck_id} onChange={(e) => { const t = trucks.find((x) => x.id === e.target.value); setForm({ ...form, truck_id: e.target.value, current_km: t?.km_total || 0 }); }} className={inputCls}>{trucks.filter((t) => !t.deleted_at).map((t) => (<option key={t.id} value={t.id}>{t.plate} - {t.model}</option>))}</select></div>
          <div><label className={labelCls}>Categoria</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>{categoryOptions.filter((c) => c.value !== 'all').map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}</select></div>
          <div className="grid grid-cols-2 gap-4"><div><label className={labelCls}>Ultima fecha</label><input type="date" value={form.last_done_date} onChange={(e) => { const d = e.target.value; const m = new Date(d); m.setMonth(m.getMonth() + form.interval_months); setForm({ ...form, last_done_date: d, next_due_date: formatDate(m) }); }} className={inputCls} /></div><div><label className={labelCls}>Intervalo (meses)</label><input type="number" min={1} max={60} value={form.interval_months} onChange={(e) => { const v = parseInt(e.target.value) || 3; const m = new Date(form.last_done_date); m.setMonth(m.getMonth() + v); setForm({ ...form, interval_months: v, next_due_date: formatDate(m) }); }} className={inputCls} /></div></div>
          <div><label className={labelCls}>Proximo vencimiento</label><div className="px-3 py-2 rounded-lg border bg-brand-light text-sm">{form.next_due_date || '—'}</div></div>
          <div><label className={labelCls}>Kilometraje</label><input type="number" value={form.current_km || ''} onChange={(e) => setForm({ ...form, current_km: parseInt(e.target.value) || 0 })} className={inputCls} /></div>
          <div><label className={labelCls}>Proveedor</label><input type="text" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className={inputCls} /></div>
          <div><label className={labelCls}>Costo ($)</label><input type="number" value={form.cost || ''} onChange={(e) => setForm({ ...form, cost: parseInt(e.target.value) || 0 })} className={inputCls} /></div>
          <div><label className={labelCls}>Notas</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={inputCls + ' resize-none'} /></div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t"><button onClick={() => setShowNew(false)} type="button" className="px-4 py-2 rounded-lg border text-sm font-medium text-text-secondary hover:bg-brand-light whitespace-nowrap">Cancelar</button><button onClick={async () => { try { const truck = trucks.find((t) => t.id === form.truck_id); await addRecord({ truck_id: form.truck_id, truck_plate: truck?.plate || '', truck_model: truck?.model || '', category: form.category, last_done_date: form.last_done_date, next_due_date: form.next_due_date || form.last_done_date, interval_months: form.interval_months, current_km: form.current_km, status: 'Upcoming', notes: form.notes || null, provider: form.provider || null, cost: form.cost || null, created_at: new Date().toISOString() }); setShowNew(false); } catch (e) { alert(e instanceof Error ? e.message : 'Error'); } }} type="button" className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-green/90 whitespace-nowrap">Crear</button></div>
      </div></div>)}

      {completing && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"><div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b"><h3 className="text-lg font-semibold">Completar</h3><button onClick={() => setCompleting(null)} type="button" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-light"><i className="ri-close-line" /></button></div>
        <div className="p-5 space-y-4">
          <div><label className={labelCls}>Fecha</label><input type="date" value={completeForm.completed_date} onChange={(e) => setCompleteForm({ ...completeForm, completed_date: e.target.value })} className={inputCls} /></div>
          <div><label className={labelCls}>Kilometraje</label><input type="number" value={completeForm.km || ''} onChange={(e) => setCompleteForm({ ...completeForm, km: parseInt(e.target.value) || 0 })} className={inputCls} /></div>
          <div><label className={labelCls}>Proveedor</label><input type="text" value={completeForm.provider} onChange={(e) => setCompleteForm({ ...completeForm, provider: e.target.value })} className={inputCls} /></div>
          <div><label className={labelCls}>Costo ($)</label><input type="number" value={completeForm.cost || ''} onChange={(e) => setCompleteForm({ ...completeForm, cost: parseInt(e.target.value) || 0 })} className={inputCls} /></div>
          <div><label className={labelCls}>Notas</label><textarea value={completeForm.notes} onChange={(e) => setCompleteForm({ ...completeForm, notes: e.target.value })} rows={2} className={inputCls + ' resize-none'} /></div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t"><button onClick={() => setCompleting(null)} type="button" className="px-4 py-2 rounded-lg border text-sm font-medium text-text-secondary hover:bg-brand-light whitespace-nowrap">Cancelar</button><button onClick={async () => { try { const rec = records.find((r) => r.id === completing); const next = new Date(completeForm.completed_date); next.setMonth(next.getMonth() + (rec?.interval_months || 3)); await updateRecord(completing, { status: 'Completed', last_done_date: completeForm.completed_date, current_km: completeForm.km, provider: completeForm.provider, cost: completeForm.cost, notes: (rec?.notes || '') + '\nCompletado: ' + completeForm.notes }); if (rec) { await addRecord({ truck_id: rec.truck_id, truck_plate: rec.truck_plate, truck_model: rec.truck_model, category: rec.category, last_done_date: completeForm.completed_date, next_due_date: formatDate(next), interval_months: rec.interval_months, current_km: completeForm.km, status: 'Upcoming', notes: 'Recurrente', provider: completeForm.provider || null, cost: completeForm.cost || null, created_at: new Date().toISOString() }); } setCompleting(null); } catch (e) { alert(e instanceof Error ? e.message : 'Error'); } }} type="button" className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-green/90 whitespace-nowrap">Confirmar</button></div>
      </div></div>)}
    </div>
  );
}