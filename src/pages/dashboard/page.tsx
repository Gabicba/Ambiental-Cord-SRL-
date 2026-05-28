import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import {
  dashboardKPIs,
  weeklyCollectionsData,
  zoneDistribution,
  recentRoutes,
  topDrivers,
} from '@/mocks/dashboard';
import { routeStatuses } from '@/mocks/routes';
import { useSharedMaintenance } from '@/hooks/useSharedMaintenance';
import { maintenanceCategories, alertStatuses } from '@/mocks/maintenance';

const pieColors = ['#1e3a5f', '#2d8a6e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  const { getSummary, getUrgentAlerts } = useSharedMaintenance();
  const maintSummary = getSummary();
  const urgentAlerts = getUrgentAlerts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">
            Resumen operativo de recoleccion de aceite usado
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedPeriod('week')}
            type="button"
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              selectedPeriod === 'week'
                ? 'bg-brand-primary text-white'
                : 'bg-white text-text-secondary border border-brand-border'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            type="button"
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              selectedPeriod === 'month'
                ? 'bg-brand-primary text-white'
                : 'bg-white text-text-secondary border border-brand-border'
            }`}
          >
            Mes
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {dashboardKPIs.map((kpi) => (
          <div
            key={kpi.id}
            className="bg-white rounded-xl p-4 border border-brand-border/60 hover:border-brand-green/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-lg ${kpi.color} flex items-center justify-center`}>
                <i className={`${kpi.icon} text-xl`} />
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  kpi.changeType === 'positive'
                    ? 'bg-emerald-100 text-emerald-700'
                    : kpi.changeType === 'negative'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {kpi.change}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-text-primary">
                {kpi.value}
                <span className="text-sm font-normal text-text-muted ml-1">{kpi.unit}</span>
              </p>
              <p className="text-xs text-text-secondary mt-1">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Maintenance Alerts Banner */}
      {(maintSummary.expired > 0 || maintSummary.due > 0) && (
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <i className="ri-tools-line text-red-600" />
              <h3 className="text-sm font-semibold text-red-700">Alertas de mantenimiento</h3>
            </div>
            <Link
              to="/trucks/maintenance"
              className="text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Ver todas
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {urgentAlerts.slice(0, 3).map((alert) => {
              const cat = maintenanceCategories[alert.category];
              const status = alertStatuses[alert.status];
              const now = new Date('2026-05-23');
              const due = new Date(alert.next_due_date);
              const daysDiff = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={alert.id} className="bg-white rounded-lg p-3 border border-red-100 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center flex-shrink-0`}>
                    <i className={`${cat.icon} text-sm`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{alert.truck_plate}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{cat.label}</p>
                    <p className="text-xs font-medium text-red-600 mt-0.5">
                      {daysDiff < -7 ? `Vencido hace ${Math.abs(daysDiff)} dias` : daysDiff <= 0 ? 'Vence hoy' : `Vence en ${daysDiff} dias`}
                    </p>
                  </div>
                </div>
              );
            })}
            {urgentAlerts.length > 3 && (
              <div className="bg-white rounded-lg p-3 border border-red-100 flex items-center justify-center">
                <Link to="/trucks/maintenance" className="text-xs text-red-600 font-medium hover:text-red-800">
                  +{urgentAlerts.length - 3} alertas mas
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Collections Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-brand-border/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-text-primary">Litros Colectados</h3>
            <span className="text-xs text-text-muted">Ultima semana</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyCollectionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="liters" fill="#2d8a6e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone Distribution */}
        <div className="bg-white rounded-xl p-5 border border-brand-border/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-text-primary">Distribucion por Zona</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={zoneDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="percentage"
                  nameKey="zone"
                >
                  {zoneDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2">
            {zoneDistribution.map((zone, index) => (
              <div key={zone.zone} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: pieColors[index] }}
                  />
                  <span className="text-text-secondary">{zone.zone}</span>
                </div>
                <span className="font-medium text-text-primary">{zone.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Routes + Top Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Routes */}
        <div className="bg-white rounded-xl border border-brand-border/60 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-brand-border/60">
            <h3 className="text-base font-semibold text-text-primary">Rutas Recientes</h3>
            <Link
              to="/routes"
              className="text-sm text-brand-green hover:text-brand-primary transition-colors font-medium"
            >
              Ver todas
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-border/40">
                  <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Ruta</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Conductor</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Fecha</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase px-5 py-3">Estado</th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase px-5 py-3">Litros</th>
                </tr>
              </thead>
              <tbody>
                {recentRoutes.map((route) => {
                  const statusConfig = routeStatuses[route.status as keyof typeof routeStatuses];
                  return (
                    <tr key={route.id} className="border-b border-brand-border/30 hover:bg-brand-light/50 transition-colors">
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-text-primary">{route.name}</p>
                          <p className="text-xs text-text-muted">{route.id}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-text-secondary">{route.driver}</td>
                      <td className="px-5 py-3 text-sm text-text-secondary">{route.date}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig?.color || 'bg-gray-100 text-gray-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            route.status === 'Completed' ? 'bg-emerald-500' :
                            route.status === 'In_Progress' ? 'bg-blue-500' :
                            route.status === 'Pending' ? 'bg-amber-500' :
                            'bg-red-500'
                          }`} />
                          {statusConfig?.label || route.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-text-primary text-right">
                        {route.liters.toLocaleString()} L
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Drivers */}
        <div className="bg-white rounded-xl border border-brand-border/60 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-brand-border/60">
            <h3 className="text-base font-semibold text-text-primary">Productividad de Conductores</h3>
            <Link
              to="/drivers"
              className="text-sm text-brand-green hover:text-brand-primary transition-colors font-medium"
            >
              Ver todos
            </Link>
          </div>
          <div className="p-5 space-y-4">
            {topDrivers.map((driver, index) => (
              <div key={driver.name} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-sm font-bold text-brand-primary flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-text-primary truncate">{driver.name}</p>
                    <p className="text-sm font-semibold text-brand-green">{driver.efficiency}%</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span>{driver.routes} rutas</span>
                    <span>{driver.liters.toLocaleString()} L</span>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-brand-light rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-green rounded-full transition-all"
                      style={{ width: `${driver.efficiency}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}