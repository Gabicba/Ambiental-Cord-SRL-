import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { truckStatuses } from '@/hooks/useTrucks';
import { useDrivers } from '@/hooks/useDrivers';

export default function TruckNewPage() {
  const navigate = useNavigate();
  const { drivers } = useDrivers();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [capacityLiters, setCapacityLiters] = useState('');
  const [vin, setVin] = useState('');
  const [fuelType, setFuelType] = useState('Diesel');
  const [gpsDeviceId, setGpsDeviceId] = useState('');
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [technicalRevisionExpiry, setTechnicalRevisionExpiry] = useState('');
  const [assignedDriverId, setAssignedDriverId] = useState('');
  const [status, setStatus] = useState('Active');
  const [notes, setNotes] = useState('');

  const availableDrivers = drivers.filter((d) => d.status === 'Active' || d.status === 'On_Route');
  const fuelTypes = ['Diesel', 'Nafta', 'GNC', 'Electrico'];
  const statusOptions = Object.entries(truckStatuses).map(([key, config]) => ({ value: key, label: config.label }));
  const inputCls = 'w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30';
  const selectCls = 'w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30 appearance-none cursor-pointer';
  const labelCls = 'text-xs font-medium text-text-muted uppercase block mb-1.5';
  const isValid = plate && model && year && capacityLiters;

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { error: err } = await supabase.from('trucks').insert({
        plate: plate.toUpperCase(),
        model,
        year: parseInt(year) || null,
        capacity_liters: parseInt(capacityLiters) || 0,
        vin: vin || null,
        fuel_type: fuelType,
        gps_device_id: gpsDeviceId || null,
        insurance_expiry: insuranceExpiry || null,
        technical_revision_expiry: technicalRevisionExpiry || null,
        assigned_driver_id: assignedDriverId || null,
        status,
        notes: notes || null,
        km_total: 0,
        km_since_maintenance: 0,
      });
      if (err) throw err;
      navigate('/trucks');
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Error al guardar');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-text-primary">Nuevo Camion</h1><p className="text-sm text-text-secondary mt-1">Registrar un nuevo vehiculo en la flota</p></div>
      {saveError && (<div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"><i className="ri-error-warning-line text-red-500 mt-0.5" /><div className="flex-1"><p className="text-sm font-medium text-red-700">Error</p><p className="text-xs text-red-600 mt-0.5">{saveError}</p></div><button type="button" onClick={() => setSaveError(null)} className="text-red-400 hover:text-red-600"><i className="ri-close-line" /></button></div>)}
      <div className="bg-white rounded-xl border border-brand-border/60 p-6 space-y-6">
        <div><h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2"><i className="ri-truck-line text-brand-primary" />Informacion del Vehiculo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelCls}>Patente *</label><input type="text" value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder="Ej: AB 123 CD" className={inputCls} /></div>
            <div><label className={labelCls}>Modelo *</label><input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ej: Mercedes-Benz Atego 1726" className={inputCls} /></div>
            <div><label className={labelCls}>Anio *</label><input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Ej: 2022" min="1990" max="2030" className={inputCls} /></div>
            <div><label className={labelCls}>Capacidad (Litros) *</label><input type="number" value={capacityLiters} onChange={(e) => setCapacityLiters(e.target.value)} placeholder="Ej: 8000" min="500" step="100" className={inputCls} /></div>
            <div><label className={labelCls}>VIN</label><input type="text" value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} placeholder="Ej: WDB9706231L123456" className={inputCls} /></div>
            <div><label className={labelCls}>Tipo de Combustible</label><select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className={selectCls}>{fuelTypes.map((ft) => (<option key={ft} value={ft}>{ft}</option>))}</select></div>
          </div>
        </div>
        <div className="border-t border-brand-border/40 pt-6"><h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2"><i className="ri-gps-line text-brand-primary" />GPS y Estado</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelCls}>ID Dispositivo GPS</label><input type="text" value={gpsDeviceId} onChange={(e) => setGpsDeviceId(e.target.value.toUpperCase())} placeholder="Ej: DEV-009" className={inputCls} /></div>
            <div><label className={labelCls}>Estado Inicial</label><select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>{statusOptions.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}</select></div>
            <div><label className={labelCls}>Conductor Asignado</label><select value={assignedDriverId} onChange={(e) => setAssignedDriverId(e.target.value)} className={selectCls}><option value="">Sin asignar</option>{availableDrivers.map((d) => (<option key={d.id} value={d.id}>{d.name} — Lic. {d.license_type || 'N/D'}</option>))}</select></div>
          </div>
        </div>
        <div className="border-t border-brand-border/40 pt-6"><h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2"><i className="ri-file-list-line text-brand-primary" />Documentacion</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelCls}>Vencimiento Seguro</label><input type="date" value={insuranceExpiry} onChange={(e) => setInsuranceExpiry(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Vencimiento Revision Tecnica</label><input type="date" value={technicalRevisionExpiry} onChange={(e) => setTechnicalRevisionExpiry(e.target.value)} className={inputCls} /></div>
          </div>
        </div>
        <div className="border-t border-brand-border/40 pt-6"><h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2"><i className="ri-sticky-note-line text-brand-primary" />Observaciones</h3>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas adicionales sobre el vehiculo..." rows={4} maxLength={500} className={inputCls + ' resize-none'} /><p className="text-xs text-text-muted mt-1 text-right">{notes.length}/500</p>
        </div>
        {isValid && (<div className="bg-brand-green/5 border border-brand-green/20 rounded-xl p-4"><h4 className="text-sm font-semibold text-brand-green mb-2">Resumen</h4><div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm"><div><p className="text-xs text-text-muted">Patente</p><p className="font-medium text-text-primary">{plate}</p></div><div><p className="text-xs text-text-muted">Modelo</p><p className="font-medium text-text-primary">{model}</p></div><div><p className="text-xs text-text-muted">Capacidad</p><p className="font-medium text-text-primary">{capacityLiters ? Number(capacityLiters).toLocaleString() : 0} L</p></div><div><p className="text-xs text-text-muted">GPS</p><p className="font-medium text-text-primary">{gpsDeviceId || '—'}</p></div></div></div>)}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button onClick={() => navigate('/trucks')} type="button" className="px-5 py-2.5 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap">Cancelar</button>
          <button onClick={handleSave} disabled={!isValid || saving} type="button" className={'px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap ' + (isValid && !saving ? 'bg-brand-green hover:bg-brand-green/90' : 'bg-gray-300 cursor-not-allowed')}>{saving ? (<span className="flex items-center gap-2"><i className="ri-loader-4-line animate-spin" />Guardando...</span>) : (<span className="flex items-center gap-2"><i className="ri-check-line" />Crear Camion</span>)}</button>
        </div>
      </div>
    </div>
  );
}