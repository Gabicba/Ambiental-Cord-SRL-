import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [oilPrice, setOilPrice] = useState(25);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const loadPrice = async () => {
      const { data } = await supabase.from('settings').select('value').eq('key', 'oil_price_per_liter').single();
      if (data) setOilPrice(Number(data.value));
    };
    loadPrice();
  }, []);

  const handleSaveOilPrice = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const { error: err } = await supabase.from('settings').upsert({ key: 'oil_price_per_liter', value: String(oilPrice) }, { onConflict: 'key' });
      if (err) throw err;
      setSaveMsg('Precio guardado correctamente');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Configuracion</h1>
        <p className="text-sm text-text-secondary mt-1">
          Ajustes del sistema y preferencias
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        <div className="bg-white rounded-xl p-5 border border-brand-border/60 space-y-4">
          <h3 className="text-base font-semibold text-text-primary">Precios</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-text-muted uppercase">Precio del aceite (por litro)</label>
              <div className="flex gap-2 mt-1">
                <span className="flex items-center px-3 bg-brand-light border border-brand-border border-r-0 rounded-l-lg text-sm text-text-muted">$</span>
                <input
                  type="number"
                  value={oilPrice}
                  onChange={(e) => setOilPrice(Number(e.target.value))}
                  className="flex-1 px-3 py-2 rounded-r-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                />
              </div>
              <p className="text-xs text-text-muted mt-1">Este precio se usa para calcular pagos automaticos en la app del chofer</p>
              {saveMsg && <p className={`text-xs mt-1 ${saveMsg.includes('Error') ? 'text-red-600' : 'text-emerald-600'}`}>{saveMsg}</p>}
            </div>
            <button
              onClick={handleSaveOilPrice}
              type="button"
              disabled={saving}
              className="w-full py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {saving ? 'Guardando...' : 'Guardar Precio'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-brand-border/60 space-y-4">
          <h3 className="text-base font-semibold text-text-primary">Empresa</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-text-muted uppercase">Nombre</label>
              <input
                type="text"
                defaultValue="Ambiental Cord S.R.L."
                className="w-full mt-1 px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase">CUIT</label>
              <input
                type="text"
                defaultValue="30-12345678-9"
                className="w-full mt-1 px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase">Direccion</label>
              <input
                type="text"
                defaultValue="Av. Industrial 1234, Cordoba"
                className="w-full mt-1 px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-brand-border/60 space-y-4">
          <h3 className="text-base font-semibold text-text-primary">Integraciones</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-brand-light rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <i className="ri-map-2-line text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">ControlSat GPS</p>
                  <p className="text-xs text-text-muted">API de rastreo vehicular</p>
                </div>
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Conectado</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-brand-light rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <i className="ri-map-pin-line text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">Google Maps</p>
                  <p className="text-xs text-text-muted">Visualizacion de rutas</p>
                </div>
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Activo</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-brand-light rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <i className="ri-file-pdf-line text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">Generacion PDF</p>
                  <p className="text-xs text-text-muted">Manifiestos y recibos</p>
                </div>
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Activo</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-brand-border/60 space-y-4">
          <h3 className="text-base font-semibold text-text-primary">Notificaciones</h3>
          <div className="space-y-3">
            {[
              { label: 'Alertas de ruta completada', enabled: true },
              { label: 'Camion en mantenimiento', enabled: true },
              { label: 'Nuevo prospecto registrado', enabled: false },
              { label: 'Incidencia de conductor', enabled: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">{item.label}</span>
                <button
                  type="button"
                  className={`relative w-10 h-5 rounded-full transition-colors ${item.enabled ? 'bg-brand-green' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-brand-border/60 space-y-4">
          <h3 className="text-base font-semibold text-text-primary">Seguridad</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-text-muted uppercase">Contrasena actual</label>
              <input
                type="password"
                placeholder="********"
                className="w-full mt-1 px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase">Nueva contrasena</label>
              <input
                type="password"
                placeholder="********"
                className="w-full mt-1 px-3 py-2 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <button
              type="button"
              className="w-full py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors whitespace-nowrap"
            >
              Cambiar Contrasena
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}