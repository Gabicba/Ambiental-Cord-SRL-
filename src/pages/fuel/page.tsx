import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFuel } from '@/hooks/useFuel';
import { useTrucks } from '@/hooks/useTrucks';
import type { Truck } from '@/hooks/useTrucks';
import { supabase } from '@/lib/supabase';
import FuelCharts from '@/pages/fuel/components/FuelCharts';

export default function FuelPage() {
  const navigate = useNavigate();
  const { records, summary, loading, error, refetch, createFuelRecord, deleteFuelRecord, chartData } = useFuel();
  const { trucks } = useTrucks();

  const [showForm, setShowForm] = useState(false);
  const [truckId, setTruckId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [liters, setLiters] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [kmAtRefuel, setKmAtRefuel] = useState('');
  const [station, setStation] = useState('');
  const [notes, setNotes] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [truckFilter, setTruckFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | '30' | '90' | '365'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedTruck = useMemo(() => trucks.find(t => t.id === truckId), [trucks, truckId]);

  const handleLitersChange = (val: string) => {
    setLiters(val);
    const l = parseFloat(val);
    const up = parseFloat(unitPrice);
    if (!isNaN(l) && !isNaN(up) && l > 0 && up > 0) {
      setTotalCost((l * up).toFixed(2));
    }
  };

  const handleUnitPriceChange = (val: string) => {
    setUnitPrice(val);
    const l = parseFloat(liters);
    const up = parseFloat(val);
    if (!isNaN(l) && !isNaN(up) && l > 0 && up > 0) {
      setTotalCost((l * up).toFixed(2));
    } else {
      const tc = parseFloat(totalCost);
      if (!isNaN(tc) && !isNaN(up) && up > 0) {
        setLiters((tc / up).toFixed(2));
      }
    }
  };

  const handleTotalCostChange = (val: string) => {
    setTotalCost(val);
    const l = parseFloat(liters);
    const tc = parseFloat(val);
    if (!isNaN(l) && !isNaN(tc) && l > 0 && tc > 0) {
      setUnitPrice((tc / l).toFixed(2));
    }
  };

  const handleTruckSelect = (id: string) => {
    setTruckId(id);
    const t = trucks.find(tr => tr.id === id);
    if (t) {
      setKmAtRefuel(String(t.km_total || ''));
    }
  };

  const uploadPhoto = async (file: File, recordId: string): Promise<string | null> => {
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `fuel-receipts/${recordId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('fuel-receipts').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('fuel-receipts').getPublicUrl(path);
      return data?.publicUrl || null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!truckId || !date || !liters || !kmAtRefuel) {
      setFormError('Completá camión, fecha, litros y km del odómetro');
      return;
    }
    const litersNum = parseFloat(liters);
    const kmNum = parseInt(kmAtRefuel, 10);
    const costNum = totalCost ? parseFloat(totalCost) : (unitPrice ? litersNum * parseFloat(unitPrice) : null);
    if (isNaN(litersNum) || litersNum <= 0) { setFormError('Los litros deben ser mayores a 0'); return; }
    if (isNaN(kmNum) || kmNum < 0) { setFormError('El km debe ser un número válido'); return; }

    setFormSubmitting(true);
    try {
      const unitPriceNum = unitPrice ? parseFloat(unitPrice) : (costNum && litersNum ? costNum / litersNum : null);

      const result = await createFuelRecord({
        truck_id: truckId,
        truck_plate: selectedTruck?.plate,
        truck_model: selectedTruck?.model || undefined,
        date,
        liters: litersNum,
        cost: costNum ? parseFloat(costNum.toFixed(2)) : null,
        unit_price: unitPriceNum ? parseFloat(unitPriceNum.toFixed(2)) : null,
        km_at_refuel: kmNum,
        station: station.trim() || null,
        notes: notes.trim() || null,
      });

      let photoUrl: string | null = null;
      if (photoFile && result && (result as Record<string, unknown>).id) {
        const rid = (result as Record<string, unknown>).id as string;
        photoUrl = await uploadPhoto(photoFile, rid);
        if (photoUrl) {
          await supabase.from('fuel_records').update({ photo_url: photoUrl }).eq('id', rid);
        }
      }

      setShowForm(false);
      resetForm();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setFormSubmitting(false);
    }
  };

  const resetForm = () => {
    setTruckId('');
    setDate(new Date().toISOString().split('T')[0]);
    setLiters('');
    setUnitPrice('');
    setTotalCost('');
    setKmAtRefuel('');
    setStation('');
    setNotes('');
    setPhotoFile(null);
  };

  const filteredRecords = useMemo(() => {
    let result = records;
    if (truckFilter !== 'all') result = result.filter(r => r.truck_id === truckFilter);
    if (periodFilter !== 'all') {
      const days = parseInt(periodFilter, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter(r => new Date(r.date) >= cutoff);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(r =>
        r.truck_plate.toLowerCase().includes(q) ||
        (r.station || '').toLowerCase().includes(q) ||
        r.date.includes(q)
      );
    }
    return result;
  }, [records, truckFilter, periodFilter, searchTerm]);

  const filteredSummary = useMemo(() => {
    const totalLiters = filteredRecords.reduce((s, r) => s + r.liters, 0);
    const totalCost = filteredRecords.reduce((s, r) => s + (r.cost || 0), 0);
    const withL100 = filteredRecords.filter(r => r.consumption_l_per_100km);
    const avgL100 = withL100.length > 0 ? withL100.reduce((s, r) => s + (r.consumption_l_per_100km || 0), 0) / withL100.length : 0;
    const withCostKm = filteredRecords.filter(r => r.cost_per_km);
    const avgCostKm = withCostKm.length > 0 ? withCostKm.reduce((s, r) => s + (r.cost_per_km || 0), 0) / withCostKm.length : 0;
    const withUp = filteredRecords.filter(r => r.unit_price);
    const avgUp = withUp.length > 0 ? withUp.reduce((s, r) => s + (r.unit_price || 0), 0) / withUp.length : 0;
    return { totalLiters, totalCost, avgL100, avgCostKm, avgUp };
  }, [filteredRecords]);

  const monthlyComparison = useMemo(() => {
    if (summary.monthly.length < 2) return null;
    const curr = summary.monthly[summary.monthly.length - 1];
    const prev = summary.monthly[summary.monthly.length - 2];
    const costDiff = prev.cost > 0 ? ((curr.cost - prev.cost) / prev.cost * 100) : 0;
    const l100Diff = prev.km > 0 && curr.km > 0 ? (((curr.liters / curr.km * 100) - (prev.liters / prev.km * 100)) / (prev.liters / prev.km * 100) * 100) : 0;
    return { curr, prev, costDiff, l100Diff };
  }, [summary.monthly]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-sm text-text-secondary">Cargando combustible...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <i className="ri-error-warning-line text-3xl text-red-500" />
          <p className="text-sm text-red-700 mt-2">{error}</p>
          <button onClick={refetch} className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 whitespace-nowrap" type="button">Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Combustible</h1>
          <p className="text-sm text-text-secondary mt-1">Registro y control de cargas de combustible por vehículo</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(v => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors whitespace-nowrap"
        >
          <i className={showForm ? 'ri-close-line' : 'ri-add-line'} />
          {showForm ? 'Cancelar' : 'Nueva Carga'}
        </button>
      </div>

      {/* Alertas */}
      {summary.alerts.length > 0 && (
        <div className="space-y-2">
          {summary.alerts.slice(0, 5).map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm">
              <i className="ri-alert-line text-amber-600 text-lg" />
              <div className="flex-1">
                <span className="font-medium text-amber-800">{a.truck_plate}</span>
                <span className="text-amber-700 ml-2">{a.message}</span>
              </div>
              <button type="button" onClick={() => navigate('/trucks/' + a.truck_id)} className="text-amber-700 hover:text-amber-900 text-xs font-medium whitespace-nowrap">Ver camión →</button>
            </div>
          ))}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-xl border border-brand-border p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Nueva carga de combustible</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selector de camión con info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">Camión *</label>
                <select
                  value={truckId}
                  onChange={(e) => handleTruckSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                  required
                >
                  <option value="">Seleccionar camión...</option>
                  {trucks.map((t: Truck) => (
                    <option key={t.id} value={t.id}>{t.plate} — {t.model || 'Sin modelo'} ({t.fuel_type})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Fecha *</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Estación</label>
                <input type="text" value={station} onChange={(e) => setStation(e.target.value)} placeholder="Ej: YPF Ruta 9" className="w-full px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30" />
              </div>
            </div>

            {/* Info del camión seleccionado */}
            {selectedTruck && (
              <div className="p-3 rounded-lg bg-brand-light border border-brand-border/50 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
                <span><span className="font-medium text-text-primary">Patente:</span> {selectedTruck.plate}</span>
                <span><span className="font-medium text-text-primary">Modelo:</span> {selectedTruck.model || '—'}</span>
                <span><span className="font-medium text-text-primary">Combustible:</span> {selectedTruck.fuel_type}</span>
                <span><span className="font-medium text-text-primary">KM actual:</span> {selectedTruck.km_total.toLocaleString()} km</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Litros *</label>
                <input type="number" step="0.01" value={liters} onChange={(e) => handleLitersChange(e.target.value)} placeholder="Ej: 85.5" className="w-full px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Precio unitario ($/L)</label>
                <input type="number" step="0.01" value={unitPrice} onChange={(e) => handleUnitPriceChange(e.target.value)} placeholder="$1.450" className="w-full px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Total ($)</label>
                <input type="number" step="0.01" value={totalCost} onChange={(e) => handleTotalCostChange(e.target.value)} placeholder="$87.000" className="w-full px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">KM Odómetro *</label>
                <input type="number" value={kmAtRefuel} onChange={(e) => setKmAtRefuel(e.target.value)} placeholder="Ej: 124500" className="w-full px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Comprobante (foto)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary file:mr-3 file:px-3 file:py-1 file:rounded file:border-0 file:bg-brand-green file:text-white file:text-xs file:cursor-pointer"
                />
                {photoFile && <p className="text-xs text-text-muted mt-1">{photoFile.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Notas</label>
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones..." className="w-full px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30" />
              </div>
            </div>

            {formError && <div className="text-sm text-red-600">{formError}</div>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-2 rounded-lg border border-brand-border text-sm text-text-secondary hover:bg-brand-light whitespace-nowrap">Cancelar</button>
              <button type="submit" disabled={formSubmitting} className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-green/90 disabled:opacity-50 whitespace-nowrap">{formSubmitting ? 'Guardando...' : 'Guardar Carga'}</button>
            </div>
          </form>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-brand-border">
          <p className="text-xs text-text-muted">Total Cargado</p>
          <p className="text-xl font-bold text-text-primary mt-1">{filteredSummary.totalLiters.toLocaleString('es-AR', { maximumFractionDigits: 1 })} L</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-brand-border">
          <p className="text-xs text-text-muted">Gasto Total</p>
          <p className="text-xl font-bold text-text-primary mt-1">${filteredSummary.totalCost.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-brand-border">
          <p className="text-xs text-text-muted">Consumo (L/100km)</p>
          <p className="text-xl font-bold text-text-primary mt-1">
            {filteredSummary.avgL100 > 0 ? `${filteredSummary.avgL100.toFixed(1)} L/100km` : '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-brand-border">
          <p className="text-xs text-text-muted">Costo/km</p>
          <p className="text-xl font-bold text-text-primary mt-1">
            {filteredSummary.avgCostKm > 0 ? `$${filteredSummary.avgCostKm.toFixed(1)}/km` : '—'}
          </p>
        </div>
      </div>

      {/* Comparación mensual */}
      {monthlyComparison && (
        <div className="bg-white rounded-xl border border-brand-border p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Este mes vs mes anterior</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-brand-light">
              <p className="text-xs text-text-muted">Gasto</p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-text-primary">${monthlyComparison.curr.cost.toLocaleString('es-AR')}</span>
                <span className={`text-xs font-medium ${monthlyComparison.costDiff > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {monthlyComparison.costDiff > 0 ? '+' : ''}{monthlyComparison.costDiff.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-brand-light">
              <p className="text-xs text-text-muted">Litros</p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-text-primary">{monthlyComparison.curr.liters.toLocaleString('es-AR')} L</span>
                <span className="text-xs text-text-muted">{monthlyComparison.curr.count} cargas</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-brand-light">
              <p className="text-xs text-text-muted">Consumo (L/100km)</p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-text-primary">
                  {monthlyComparison.curr.km > 0 ? (monthlyComparison.curr.liters / monthlyComparison.curr.km * 100).toFixed(1) : '—'} L/100km
                </span>
                <span className={`text-xs font-medium ${monthlyComparison.l100Diff > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {monthlyComparison.l100Diff > 0 ? '+' : ''}{monthlyComparison.l100Diff.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos de consumo */}
      <FuelCharts chartData={chartData} />

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <select value={truckFilter} onChange={(e) => setTruckFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-white border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30">
          <option value="all">Todos los camiones</option>
          {trucks.map((t: Truck) => (
            <option key={t.id} value={t.id}>{t.plate} {t.model ? `— ${t.model}` : ''}</option>
          ))}
        </select>
        <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value as 'all' | '30' | '90' | '365')} className="px-3 py-2 rounded-lg bg-white border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30">
          <option value="all">Todo el período</option>
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 90 días</option>
          <option value="365">Último año</option>
        </select>
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por patente, estación, fecha..." className="px-3 py-2 rounded-lg bg-white border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30 flex-1 min-w-[200px]" />
      </div>

      {/* Tabla de registros */}
      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-light border-b border-brand-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Camión</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Estación</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary">Litros</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary">$/L</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary">Total</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary">KM</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary">Km rec.</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary">L/100km</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary">$/km</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-text-secondary">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-text-muted">
                    No hay registros de combustible para los filtros seleccionados
                  </td>
                </tr>
              )}
              {filteredRecords.map((r) => (
                <tr key={r.id} className="border-b border-brand-border/40 hover:bg-brand-light/50">
                  <td className="px-4 py-3 text-text-primary whitespace-nowrap">{new Date(r.date).toLocaleDateString('es-AR')}</td>
                  <td className="px-4 py-3 text-text-primary">
                    <span className="font-medium">{r.truck_plate}</span>
                    {r.truck_model && <span className="text-text-muted text-xs ml-1">— {r.truck_model}</span>}
                  </td>
                  <td className="px-4 py-3 text-text-primary">{r.station || '—'}</td>
                  <td className="px-4 py-3 text-right text-text-primary font-medium">{r.liters.toLocaleString('es-AR')} L</td>
                  <td className="px-4 py-3 text-right text-text-secondary">{r.unit_price ? `$${r.unit_price.toLocaleString('es-AR')}` : '—'}</td>
                  <td className="px-4 py-3 text-right text-text-primary">{r.cost ? `$${r.cost.toLocaleString('es-AR')}` : '—'}</td>
                  <td className="px-4 py-3 text-right text-text-muted">{r.km_at_refuel.toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3 text-right text-text-secondary">{r.km_since_last_refuel ? r.km_since_last_refuel.toLocaleString('es-AR') + ' km' : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    {r.consumption_l_per_100km ? (
                      <span className="text-brand-green font-medium">{r.consumption_l_per_100km.toFixed(1)} L/100km</span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-text-secondary">{r.cost_per_km ? `$${r.cost_per_km.toFixed(1)}` : '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => { if (confirm('¿Eliminar este registro de combustible?')) { deleteFuelRecord(r.id).catch(() => {}); } }}
                      type="button"
                      className="text-red-500 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <i className="ri-delete-bin-line" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen por camión */}
      {summary.byTruck.length > 0 && (
        <div className="bg-white rounded-xl border border-brand-border p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Consumo por camión</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {summary.byTruck.map(t => (
              <div key={t.truck_id} className="flex items-center justify-between p-3 rounded-lg bg-brand-light border border-brand-border/50">
                <div>
                  <p className="text-sm font-medium text-text-primary">{t.plate}</p>
                  <p className="text-xs text-text-muted">{t.count} cargas · {t.liters.toLocaleString('es-AR')} L</p>
                  {t.avgConsumptionL100 > 0 && <p className="text-xs text-text-muted">{t.avgConsumptionL100.toFixed(1)} L/100km</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-text-primary">{t.cost > 0 ? `$${t.cost.toLocaleString('es-AR')}` : '—'}</p>
                  {t.avgCostPerKm > 0 && <p className="text-xs text-text-muted">${t.avgCostPerKm.toFixed(1)}/km</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}