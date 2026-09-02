import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { FuelChartData } from '@/hooks/useFuel';

type Granularity = 'monthly' | 'weekly' | 'yearly';
type Metric = 'liters' | 'cost';

const GRANULARITY_OPTIONS: { key: Granularity; label: string }[] = [
  { key: 'monthly', label: 'Mes' },
  { key: 'weekly', label: 'Semana' },
  { key: 'yearly', label: 'Año' },
];

const FUEL_COLORS: Record<string, string> = {
  diesel: '#16a34a',
  nafta: '#f59e0b',
  gasolina: '#f59e0b',
  gnc: '#ef4444',
  electrico: '#0d9488',
  electric: '#0d9488',
  hibrido: '#d97706',
  otro: '#94a3b8',
};

const FALLBACK_COLORS = ['#16a34a', '#f59e0b', '#ef4444', '#0d9488', '#d97706', '#94a3b8'];

function fuelColor(fuel: string, index: number): string {
  const key = fuel.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return FUEL_COLORS[key] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export default function FuelCharts({ chartData }: { chartData: FuelChartData }) {
  const [granularity, setGranularity] = useState<Granularity>('monthly');
  const [metric, setMetric] = useState<Metric>('liters');

  const points = chartData[granularity];
  const fuelTypes = chartData.fuelTypes;

  const rows = points.map((p) => {
    const row: Record<string, string | number> = { label: p.label };
    fuelTypes.forEach((ft) => {
      const v = p.byFuel[ft];
      row[ft] = metric === 'liters' ? (v ? Math.round(v.liters * 10) / 10 : 0) : (v ? Math.round(v.cost) : 0);
    });
    return row;
  });

  const pieData = chartData.byFuelTotal.map((f) => ({
    name: f.fuel,
    value: metric === 'liters' ? Math.round(f.liters * 10) / 10 : Math.round(f.cost),
  }));

  const formatValue = (v: number) =>
    metric === 'liters' ? `${v.toLocaleString('es-AR')} L` : `$${v.toLocaleString('es-AR')}`;

  const axisFormatter = (v: number) =>
    metric === 'liters' ? v.toLocaleString('es-AR') : `$${v.toLocaleString('es-AR')}`;

  if (fuelTypes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-brand-border p-5">
        <p className="text-sm text-text-muted">No hay datos de combustible para graficar.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Gráfico de barras apiladas */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-brand-border p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-base font-semibold text-text-primary">Evolución del consumo</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center rounded-full bg-brand-light p-1">
              {GRANULARITY_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setGranularity(opt.key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    granularity === opt.key
                      ? 'bg-white text-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="inline-flex items-center rounded-full bg-brand-light p-1">
              <button
                type="button"
                onClick={() => setMetric('liters')}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  metric === 'liters' ? 'bg-white text-text-primary' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Litros
              </button>
              <button
                type="button"
                onClick={() => setMetric('cost')}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  metric === 'cost' ? 'bg-white text-text-primary' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Pesos
              </button>
            </div>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={axisFormatter}
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip
                formatter={(value, name) => [formatValue(Number(value)), name]}
                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
              />
              {fuelTypes.map((ft, i) => (
                <Bar
                  key={ft}
                  dataKey={ft}
                  stackId="fuel"
                  fill={fuelColor(ft, i)}
                  radius={i === fuelTypes.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
          {fuelTypes.map((ft, i) => (
            <span key={ft} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: fuelColor(ft, i) }} />
              <span className="text-text-secondary">{ft}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Donut de distribución */}
      <div className="bg-white rounded-xl border border-brand-border p-5">
        <h3 className="text-base font-semibold text-text-primary mb-4">Distribución por combustible</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {pieData.map((entry, i) => (
                  <Cell key={entry.name} fill={fuelColor(entry.name, i)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [formatValue(Number(value)), name]}
                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 space-y-1.5">
          {pieData.map((entry, i) => {
            const total = pieData.reduce((s, d) => s + d.value, 0);
            const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
            return (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: fuelColor(entry.name, i) }} />
                  <span className="text-text-secondary">{entry.name}</span>
                </span>
                <span className="text-text-primary font-medium">
                  {formatValue(entry.value)} · {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}