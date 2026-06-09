import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useCustomers } from '@/hooks/useCustomers';

export default function RouteTemplateNewPage() {
  const navigate = useNavigate();
  const { customers } = useCustomers();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customerOrder, setCustomerOrder] = useState<Record<string, number>>({});
  const [searchCustomer, setSearchCustomer] = useState('');

  const activeCustomers = customers.filter((c) => c.status === 'Active');
  const filteredCustomers = useMemo(() => activeCustomers.filter((c) => !selectedCustomers.includes(c.id) && (c.fantasy_name.toLowerCase().includes(searchCustomer.toLowerCase()) || (c.address || '').toLowerCase().includes(searchCustomer.toLowerCase()))), [searchCustomer, selectedCustomers, activeCustomers]);
  const selectedList = selectedCustomers.map((sid) => activeCustomers.find((c) => c.id === sid)).filter(Boolean).sort((a, b) => (customerOrder[a!.id] || 0) - (customerOrder[b!.id] || 0));

  const toggleCustomer = (id: string) => { setSelectedCustomers((p) => { if (p.includes(id)) { const n = p.filter((x) => x !== id); setCustomerOrder((o) => { const c = { ...o }; delete c[id]; return c; }); return n; } const n = [...p, id]; setCustomerOrder((o) => ({ ...o, [id]: n.length })); return n; }); };
  const moveUp = (i: number) => { if (i === 0) return; const l = [...selectedList]; [l[i], l[i-1]] = [l[i-1], l[i]]; const o: Record<string, number> = {}; l.forEach((c, j) => { if (c) o[c.id] = j + 1; }); setCustomerOrder(o); setSelectedCustomers(l.map((c) => c!.id)); };
  const moveDown = (i: number) => { if (i >= selectedList.length - 1) return; const l = [...selectedList]; [l[i], l[i+1]] = [l[i+1], l[i]]; const o: Record<string, number> = {}; l.forEach((c, j) => { if (c) o[c.id] = j + 1; }); setCustomerOrder(o); setSelectedCustomers(l.map((c) => c!.id)); };

  const inputCls = 'w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30';
  const labelCls = 'text-xs font-medium text-text-muted uppercase block mb-1.5';
  const isValid = name.trim() && selectedCustomers.length > 0;

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true); setSaveError(null);
    try {
      const { error: err } = await supabase.from('route_templates').insert({ name, description: description || null, notes: notes || null, customer_ids: selectedCustomers, visit_order: customerOrder });
      if (err) throw err;
      navigate('/routes/templates');
    } catch (e) { setSaveError(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3"><button onClick={() => navigate('/routes/templates')} type="button" className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"><i className="ri-arrow-left-line" />Plantillas</button></div>
      <div><h1 className="text-2xl font-bold text-text-primary">Nueva Plantilla de Ruta</h1><p className="text-sm text-text-secondary mt-1">Guarda una ruta recurrente para usarla multiples veces</p></div>
      {saveError && (<div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-sm text-red-700">{saveError}</p></div>)}
      <div className="bg-white rounded-xl border border-brand-border/60 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className={labelCls}>Nombre</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Ruta Norte - Lunes" className={inputCls} /></div><div><label className={labelCls}>Descripcion</label><input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descripcion" className={inputCls} /></div></div>
        <div><label className={labelCls}>Notas</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={500} className={inputCls + ' resize-none'} /><p className="text-xs text-text-muted mt-1 text-right">{notes.length}/500</p></div>
        <div className="border-t border-brand-border/40 pt-6"><h3 className="text-sm font-semibold text-text-primary mb-3">Clientes en la ruta</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-brand-light rounded-xl p-4"><div className="relative mb-3"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"><i className="ri-search-line" /></span><input type="text" value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} placeholder="Buscar clientes..." className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-brand-border text-sm" /></div><div className="space-y-2 max-h-72 overflow-y-auto">{filteredCustomers.map((c) => (<button key={c.id} onClick={() => toggleCustomer(c.id)} type="button" className="w-full text-left p-3 rounded-lg bg-white border border-brand-border/60 hover:border-brand-green/40"><div className="flex items-start justify-between"><div><p className="text-sm font-medium">{c.fantasy_name}</p><p className="text-xs text-text-muted mt-0.5">{c.address}</p></div><div className="w-6 h-6 rounded-full border-2 border-brand-border flex items-center justify-center"><i className="ri-add-line text-xs text-text-muted" /></div></div></button>))}</div></div>
            <div className="bg-white rounded-xl border border-brand-border/60 p-4"><div className="flex items-center justify-between mb-3"><span className="text-sm font-medium">Seleccionados: {selectedCustomers.length}</span>{selectedCustomers.length > 0 && <button onClick={() => { setSelectedCustomers([]); setCustomerOrder({}); }} type="button" className="text-xs text-red-500">Limpiar</button>}</div><div className="space-y-2 max-h-72 overflow-y-auto">{selectedList.map((c, i) => c && (<div key={c.id} className="p-3 rounded-lg bg-brand-light border border-brand-border/40 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{c.fantasy_name}</p><p className="text-xs text-text-muted truncate">{c.address}</p></div><div className="flex items-center gap-1"><button onClick={() => moveUp(i)} disabled={i === 0} type="button" className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-brand-border/50 disabled:opacity-30"><i className="ri-arrow-up-line text-sm" /></button><button onClick={() => moveDown(i)} disabled={i >= selectedList.length - 1} type="button" className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-brand-border/50 disabled:opacity-30"><i className="ri-arrow-down-line text-sm" /></button><button onClick={() => toggleCustomer(c.id)} type="button" className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-red-500"><i className="ri-close-line text-sm" /></button></div></div>))}</div></div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2"><button onClick={() => navigate('/routes/templates')} type="button" className="px-5 py-2.5 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap">Cancelar</button><button onClick={handleSave} disabled={!isValid || saving} type="button" className={'px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap ' + (isValid && !saving ? 'bg-brand-green hover:bg-brand-green/90' : 'bg-gray-300 cursor-not-allowed')}>{saving ? 'Guardando...' : 'Guardar Plantilla'}</button></div>
      </div>
    </div>
  );
}