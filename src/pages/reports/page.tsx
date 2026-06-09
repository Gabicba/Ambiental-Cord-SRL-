import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { monthlyCollectionsData, topDrivers } from '@/mocks/dashboard';

const driverPerformance = [
  { month: 'Ene', carlos: 2800, maria: 3200, juan: 2500, pedro: 2100 },
  { month: 'Feb', carlos: 3100, maria: 2900, juan: 2800, pedro: 2300 },
  { month: 'Mar', carlos: 2900, maria: 3400, juan: 2600, pedro: 2200 },
  { month: 'Abr', carlos: 3500, maria: 3100, juan: 3200, pedro: 2800 },
  { month: 'May', carlos: 3300, maria: 3600, juan: 3000, pedro: 2600 },
  { month: 'Jun', carlos: 3400, maria: 3500, juan: 3100, pedro: 2700 },
];

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Reportes</h1>
        <p className="text-sm text-text-secondary mt-1">
          Analisis operativo y KPIs de recoleccion
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Litros (Jun)', value: '24,850 L', change: '+12.5%', positive: true },
          { label: 'Rutas Completadas', value: '156', change: '+8.3%', positive: true },
          { label: 'Promedio por Ruta', value: '159 L', change: '+3.2%', positive: true },
          { label: 'Incidencias', value: '12', change: '-25%', positive: true },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-4 border border-brand-border/60">
            <p className="text-xs text-text-muted">{card.label}</p>
            <p className="text-xl font-bold text-text-primary mt-1">{card.value}</p>
            <p className={`text-xs mt-1 ${card.positive ? 'text-emerald-600' : 'text-red-600'}`}>
              {card.change} vs mes anterior
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-brand-border/60">
          <h3 className="text-base font-semibold text-text-primary mb-4">Litros por Mes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCollectionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="liters" fill="#1e3a5f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-brand-border/60">
          <h3 className="text-base font-semibold text-text-primary mb-4">Rendimiento por Conductor</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={driverPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="carlos" stroke="#1e3a5f" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="maria" stroke="#2d8a6e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="juan" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="pedro" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#1e3a5f]" /> Carlos</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#2d8a6e]" /> Maria</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#f59e0b]" /> Juan</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#ef4444]" /> Pedro</span>
          </div>
        </div>
      </div>

      {/* Driver Productivity Table */}
      <div className="bg-white rounded-xl border border-brand-border/60 overflow-hidden">
        <div className="p-5 border-b border-brand-border/60">
          <h3 className="text-base font-semibold text-text-primary">Productividad Detallada</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border/40">
                <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Conductor</th>
                <th className="text-right text-xs font-medium text-text-muted uppercase px-5 py-3">Rutas</th>
                <th className="text-right text-xs font-medium text-text-muted uppercase px-5 py-3">Litros</th>
                <th className="text-right text-xs font-medium text-text-muted uppercase px-5 py-3">Eficiencia</th>
                <th className="text-right text-xs font-medium text-text-muted uppercase px-5 py-3">Promedio/Ruta</th>
              </tr>
            </thead>
            <tbody>
              {topDrivers.map((driver) => (
                <tr key={driver.name} className="border-b border-brand-border/30">
                  <td className="px-5 py-3 text-sm font-medium text-text-primary">{driver.name}</td>
                  <td className="px-5 py-3 text-sm text-text-secondary text-right">{driver.routes}</td>
                  <td className="px-5 py-3 text-sm font-medium text-text-primary text-right">
                    {driver.liters.toLocaleString()} L
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="inline-flex items-center gap-1.5">
                      <div className="w-16 h-1.5 bg-brand-light rounded-full overflow-hidden">
                        <div className="h-full bg-brand-green rounded-full" style={{ width: `${driver.efficiency}%` }} />
                      </div>
                      <span className="text-sm text-text-secondary">{driver.efficiency}%</span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-text-secondary text-right">
                    {Math.round(driver.liters / driver.routes)} L
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}